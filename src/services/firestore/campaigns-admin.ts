import type {
  DocumentData,
  Firestore,
  Query,
} from 'firebase-admin/firestore';

import type {
  Campaign,
  CampaignAuditLog,
  CampaignInput,
  CampaignParticipant,
  CampaignQualificationRules,
  CampaignReferral,
  CampaignReferralVisit,
  CampaignStatus,
  ReferralStatus,
} from '@/src/types/campaigns';
import {
  CAMPAIGN_TERMS_VERSION,
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
  DEFAULT_CAMPAIGN_RULES_MARKDOWN,
  DEFAULT_PAYOUT_STRUCTURE,
  DEFAULT_QUALIFICATION_RULES,
} from '@/src/constants/campaigns';
import {
  generateCampaignReferralCode,
  hashIdentifier,
  normalizeCampaignReferralCode,
  slugifyCampaignName,
} from '@/src/lib/campaigns/codes';
import {
  isValidVanityHandle,
  normalizeCampaignRef,
  normalizeVanityHandle,
} from '@/src/lib/campaigns/handles';
import {
  canAutoQualify,
  compareParticipantEmail,
  detectProxyHint,
  scoreReferralFraud,
} from '@/src/lib/campaigns/fraud';
import {
  buildLeaderboard,
  estimatePayoutUsd,
} from '@/src/lib/campaigns/payouts';
import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';

function requireDb(): Firestore {
  const db = tryGetAdminDb();
  if (!db) throw new Error('Firebase Admin is not configured.');
  return db;
}

function referralDocId(campaignId: string, referredUserId: string): string {
  return `${campaignId}_${referredUserId}`;
}

function nowIso() {
  return new Date().toISOString();
}

function mergeRules(
  partial?: Partial<CampaignQualificationRules>,
): CampaignQualificationRules {
  return { ...DEFAULT_QUALIFICATION_RULES, ...partial };
}

function mapCampaign(id: string, data: DocumentData): Campaign {
  return {
    id,
    name: String(data.name ?? ''),
    slug: String(data.slug ?? id),
    description: String(data.description ?? ''),
    imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : null,
    status: (data.status as CampaignStatus) ?? 'draft',
    prizePoolUsd: Number(data.prizePoolUsd ?? 0),
    payoutStructure: data.payoutStructure ?? DEFAULT_PAYOUT_STRUCTURE,
    startDate: String(data.startDate ?? ''),
    endDate: String(data.endDate ?? ''),
    attributionWindowDays: Number(
      data.attributionWindowDays ?? DEFAULT_ATTRIBUTION_WINDOW_DAYS,
    ),
    qualificationRules: mergeRules(data.qualificationRules),
    termsVersion: String(data.termsVersion ?? CAMPAIGN_TERMS_VERSION),
    termsMarkdown: String(data.termsMarkdown ?? DEFAULT_CAMPAIGN_RULES_MARKDOWN),
    rulesMarkdown: String(data.rulesMarkdown ?? DEFAULT_CAMPAIGN_RULES_MARKDOWN),
    maxParticipants:
      typeof data.maxParticipants === 'number' ? data.maxParticipants : null,
    leaderboardPublic: data.leaderboardPublic !== false,
    participantCount: Number(data.participantCount ?? 0),
    qualifiedReferralCount: Number(data.qualifiedReferralCount ?? 0),
    clickCount: Number(data.clickCount ?? 0),
    createdAt: String(data.createdAt ?? nowIso()),
    updatedAt: String(data.updatedAt ?? nowIso()),
    finalizedAt: typeof data.finalizedAt === 'string' ? data.finalizedAt : null,
  };
}

function mapParticipant(
  id: string,
  data: DocumentData,
): CampaignParticipant {
  return {
    id,
    campaignId: String(data.campaignId ?? ''),
    userId: String(data.userId ?? ''),
    displayName: String(data.displayName ?? 'Creator'),
    publicName: String(data.publicName ?? data.displayName ?? 'Creator'),
    vanityHandle: String(data.vanityHandle ?? ''),
    referralCode: String(data.referralCode ?? ''),
    joinedAt: String(data.joinedAt ?? nowIso()),
    termsVersionAccepted: String(data.termsVersionAccepted ?? ''),
    termsAcceptedAt: String(data.termsAcceptedAt ?? nowIso()),
    status: data.status ?? 'active',
    clicks: Number(data.clicks ?? 0),
    registrations: Number(data.registrations ?? 0),
    verifiedSignups: Number(data.verifiedSignups ?? 0),
    pendingReferrals: Number(data.pendingReferrals ?? 0),
    qualifiedReferrals: Number(data.qualifiedReferrals ?? 0),
    rejectedReferrals: Number(data.rejectedReferrals ?? 0),
    fraudReviewCount: Number(data.fraudReviewCount ?? 0),
    rank: typeof data.rank === 'number' ? data.rank : null,
    estimatedPayoutUsd:
      typeof data.estimatedPayoutUsd === 'number' ? data.estimatedPayoutUsd : null,
    updatedAt: String(data.updatedAt ?? nowIso()),
  };
}

function mapReferral(
  id: string,
  data: DocumentData,
): CampaignReferral {
  return {
    id,
    campaignId: String(data.campaignId ?? ''),
    participantId: String(data.participantId ?? ''),
    referralCode: String(data.referralCode ?? ''),
    referredUserId: String(data.referredUserId ?? ''),
    originalVisitId:
      typeof data.originalVisitId === 'string' ? data.originalVisitId : null,
    status: (data.status as ReferralStatus) ?? 'pending',
    fraudRiskScore: Number(data.fraudRiskScore ?? 0),
    fraudSignals: Array.isArray(data.fraudSignals)
      ? data.fraudSignals.map(String)
      : [],
    registeredAt: String(data.registeredAt ?? nowIso()),
    verifiedAt: typeof data.verifiedAt === 'string' ? data.verifiedAt : null,
    qualifiedAt: typeof data.qualifiedAt === 'string' ? data.qualifiedAt : null,
    rejectedAt: typeof data.rejectedAt === 'string' ? data.rejectedAt : null,
    pendingUntil: typeof data.pendingUntil === 'string' ? data.pendingUntil : null,
    updatedAt: String(data.updatedAt ?? nowIso()),
  };
}

async function writeAudit(input: {
  campaignId: string;
  adminUserId: string;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
}) {
  const db = requireDb();
  const ref = db.collection('campaignAuditLogs').doc();
  const entry: CampaignAuditLog = {
    id: ref.id,
    campaignId: input.campaignId,
    adminUserId: input.adminUserId,
    adminEmail: input.adminEmail,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    previousValue: input.previousValue ?? null,
    newValue: input.newValue ?? null,
    createdAt: nowIso(),
  };
  await ref.set(entry);
  return entry;
}

async function uniqueReferralCode(): Promise<string> {
  const db = requireDb();
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const code = generateCampaignReferralCode();
    const snap = await db
      .collection('campaignParticipants')
      .where('referralCode', '==', code)
      .limit(1)
      .get();
    if (snap.empty) return code;
  }
  throw new Error('Unable to allocate a unique referral code.');
}

async function assertVanityHandleAvailable(handle: string): Promise<string> {
  const normalized = normalizeVanityHandle(handle);
  if (!isValidVanityHandle(normalized)) {
    throw new Error(
      'Creator handle must be 3–24 characters, start with a letter, and use only letters, numbers, _ or -.',
    );
  }
  const db = requireDb();
  const snap = await db
    .collection('campaignParticipants')
    .where('vanityHandle', '==', normalized)
    .limit(1)
    .get();
  if (!snap.empty) {
    const existing = snap.docs[0]!.data();
    if (existing.status === 'active' || existing.status === 'banned') {
      throw new Error('That creator handle is already taken.');
    }
  }
  return normalized;
}

export const campaignsAdminService = {
  async listCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
    const db = requireDb();
    let query: Query = db.collection('campaigns');
    if (status) query = query.where('status', '==', status);
    const snap = await query.get();
    return snap.docs
      .map((doc) => mapCampaign(doc.id, doc.data()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async listPublicActiveCampaigns(): Promise<Campaign[]> {
    const db = requireDb();
    const snap = await db
      .collection('campaigns')
      .where('status', 'in', ['active', 'ending_review', 'finalized'])
      .get();
    return snap.docs
      .map((doc) => mapCampaign(doc.id, doc.data()))
      .filter((c) => c.leaderboardPublic || c.status === 'active')
      .sort((a, b) => a.endDate.localeCompare(b.endDate));
  },

  async getCampaign(idOrSlug: string): Promise<Campaign | null> {
    const db = requireDb();
    const byId = await db.collection('campaigns').doc(idOrSlug).get();
    if (byId.exists) return mapCampaign(byId.id, byId.data()!);
    const bySlug = await db
      .collection('campaigns')
      .where('slug', '==', idOrSlug)
      .limit(1)
      .get();
    if (bySlug.empty) return null;
    const doc = bySlug.docs[0]!;
    return mapCampaign(doc.id, doc.data());
  },

  async createCampaign(
    input: CampaignInput,
    admin: { uid: string; email: string | null },
  ): Promise<Campaign> {
    const db = requireDb();
    const slug = slugifyCampaignName(input.slug || input.name);
    const existing = await db
      .collection('campaigns')
      .where('slug', '==', slug)
      .limit(1)
      .get();
    if (!existing.empty) {
      throw new Error('A campaign with this slug already exists.');
    }

    const ref = db.collection('campaigns').doc();
    const createdAt = nowIso();
    const campaign: Campaign = {
      id: ref.id,
      name: input.name.trim(),
      slug,
      description: input.description.trim(),
      imageUrl: input.imageUrl?.trim() || null,
      status: input.status ?? 'draft',
      prizePoolUsd: input.prizePoolUsd,
      payoutStructure: input.payoutStructure ?? DEFAULT_PAYOUT_STRUCTURE,
      startDate: input.startDate,
      endDate: input.endDate,
      attributionWindowDays:
        input.attributionWindowDays ?? DEFAULT_ATTRIBUTION_WINDOW_DAYS,
      qualificationRules: mergeRules(input.qualificationRules),
      termsVersion: input.termsVersion ?? CAMPAIGN_TERMS_VERSION,
      termsMarkdown: input.termsMarkdown ?? DEFAULT_CAMPAIGN_RULES_MARKDOWN,
      rulesMarkdown: input.rulesMarkdown ?? DEFAULT_CAMPAIGN_RULES_MARKDOWN,
      maxParticipants: input.maxParticipants ?? null,
      leaderboardPublic: input.leaderboardPublic !== false,
      participantCount: 0,
      qualifiedReferralCount: 0,
      clickCount: 0,
      createdAt,
      updatedAt: createdAt,
      finalizedAt: null,
    };
    await ref.set(campaign);
    await writeAudit({
      campaignId: ref.id,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'create_campaign',
      targetType: 'campaign',
      targetId: ref.id,
      newValue: { name: campaign.name, status: campaign.status },
    });
    return campaign;
  },

  async updateCampaign(
    campaignId: string,
    patch: Partial<CampaignInput> & { status?: CampaignStatus },
    admin: { uid: string; email: string | null },
  ): Promise<Campaign> {
    const db = requireDb();
    const ref = db.collection('campaigns').doc(campaignId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Campaign not found.');
    const previous = mapCampaign(snap.id, snap.data()!);
    const next = {
      ...patch,
      updatedAt: nowIso(),
      ...(patch.qualificationRules
        ? { qualificationRules: mergeRules(patch.qualificationRules) }
        : {}),
      ...(patch.slug ? { slug: slugifyCampaignName(patch.slug) } : {}),
    };
    await ref.update(next);
    const updated = await ref.get();
    const campaign = mapCampaign(updated.id, updated.data()!);
    await writeAudit({
      campaignId,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'update_campaign',
      targetType: 'campaign',
      targetId: campaignId,
      previousValue: { status: previous.status, prizePoolUsd: previous.prizePoolUsd },
      newValue: { status: campaign.status, prizePoolUsd: campaign.prizePoolUsd },
    });
    return campaign;
  },

  async joinCampaign(input: {
    campaignId: string;
    userId: string;
    displayName: string;
    publicName?: string;
    vanityHandle: string;
    termsVersion: string;
  }): Promise<CampaignParticipant> {
    const db = requireDb();
    const campaign = await this.getCampaign(input.campaignId);
    if (!campaign) throw new Error('Campaign not found.');
    if (campaign.status !== 'active') {
      throw new Error('This campaign is not open for joining.');
    }
    if (
      campaign.maxParticipants != null &&
      campaign.participantCount >= campaign.maxParticipants
    ) {
      throw new Error('This campaign is full.');
    }

    const existing = await db
      .collection('campaignParticipants')
      .where('campaignId', '==', campaign.id)
      .where('userId', '==', input.userId)
      .limit(1)
      .get();
    if (!existing.empty) {
      return mapParticipant(existing.docs[0]!.id, existing.docs[0]!.data());
    }

    if (input.termsVersion !== campaign.termsVersion) {
      throw new Error('Please accept the latest campaign rules to join.');
    }

    const vanityHandle = await assertVanityHandleAvailable(input.vanityHandle);
    const referralCode = await uniqueReferralCode();
    const ref = db.collection('campaignParticipants').doc();
    const joinedAt = nowIso();
    const participant: CampaignParticipant = {
      id: ref.id,
      campaignId: campaign.id,
      userId: input.userId,
      displayName: input.displayName,
      publicName: (input.publicName || input.displayName).trim() || 'Creator',
      vanityHandle,
      referralCode,
      joinedAt,
      termsVersionAccepted: input.termsVersion,
      termsAcceptedAt: joinedAt,
      status: 'active',
      clicks: 0,
      registrations: 0,
      verifiedSignups: 0,
      pendingReferrals: 0,
      qualifiedReferrals: 0,
      rejectedReferrals: 0,
      fraudReviewCount: 0,
      rank: null,
      estimatedPayoutUsd: null,
      updatedAt: joinedAt,
    };

    await db.runTransaction(async (tx) => {
      const campaignRef = db.collection('campaigns').doc(campaign.id);
      const campaignSnap = await tx.get(campaignRef);
      if (!campaignSnap.exists) throw new Error('Campaign not found.');
      const count = Number(campaignSnap.data()?.participantCount ?? 0);
      const max = campaignSnap.data()?.maxParticipants;
      if (typeof max === 'number' && count >= max) {
        throw new Error('This campaign is full.');
      }
      tx.set(ref, participant);
      tx.set(
        db.collection('campaignTermsAcceptances').doc(`${campaign.id}_${input.userId}`),
        {
          campaignId: campaign.id,
          userId: input.userId,
          termsVersion: input.termsVersion,
          acceptedAt: joinedAt,
        },
      );
      tx.update(campaignRef, {
        participantCount: count + 1,
        updatedAt: nowIso(),
      });
    });

    return participant;
  },

  /** Server-side engagement counters used by the qualification engine. */
  async recordEngagement(
    userId: string,
    kind: 'session' | 'meaningful',
  ): Promise<void> {
    const db = requireDb();
    const userRef = db.collection('users').doc(userId);
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(userRef);
      if (!snap.exists) return;
      const data = snap.data() ?? {};
      const now = nowIso();
      if (kind === 'session') {
        const last =
          typeof data.campaignLastSessionAt === 'string'
            ? data.campaignLastSessionAt
            : null;
        // Count at most one session bump per calendar day (UTC).
        if (last && last.slice(0, 10) === now.slice(0, 10)) return;
        tx.update(userRef, {
          campaignSessionCount: Number(data.campaignSessionCount ?? 0) + 1,
          campaignLastSessionAt: now,
          updatedAt: now,
        });
        return;
      }
      tx.update(userRef, {
        campaignMeaningfulActions:
          Number(data.campaignMeaningfulActions ?? 0) + 1,
        updatedAt: now,
      });
    });
  },

  async getParticipantByUser(
    campaignId: string,
    userId: string,
  ): Promise<CampaignParticipant | null> {
    const db = requireDb();
    const snap = await db
      .collection('campaignParticipants')
      .where('campaignId', '==', campaignId)
      .where('userId', '==', userId)
      .limit(1)
      .get();
    if (snap.empty) return null;
    return mapParticipant(snap.docs[0]!.id, snap.docs[0]!.data());
  },

  /**
   * Resolve a creator by PG-XXXXXX code or vanity handle (rylan, trey, …).
   */
  async getParticipantByCode(code: string): Promise<CampaignParticipant | null> {
    const db = requireDb();
    const ref = normalizeCampaignRef(code);
    if (!ref) return null;

    if (/^PG-[A-Z0-9]{6}$/.test(ref)) {
      const snap = await db
        .collection('campaignParticipants')
        .where('referralCode', '==', ref)
        .limit(1)
        .get();
      if (snap.empty) return null;
      return mapParticipant(snap.docs[0]!.id, snap.docs[0]!.data());
    }

    const handle = normalizeVanityHandle(ref);
    const snap = await db
      .collection('campaignParticipants')
      .where('vanityHandle', '==', handle)
      .limit(5)
      .get();
    if (snap.empty) return null;
    const active = snap.docs
      .map((doc) => mapParticipant(doc.id, doc.data()))
      .find((p) => p.status === 'active');
    return active ?? mapParticipant(snap.docs[0]!.id, snap.docs[0]!.data());
  },

  async listParticipants(campaignId: string): Promise<CampaignParticipant[]> {
    const db = requireDb();
    const snap = await db
      .collection('campaignParticipants')
      .where('campaignId', '==', campaignId)
      .get();
    return snap.docs.map((doc) => mapParticipant(doc.id, doc.data()));
  },

  async recordVisit(input: {
    code: string;
    campaignId?: string | null;
    visitorId: string;
    landingPage: string | null;
    ip: string | null;
    userAgent: string | null;
    country: string | null;
    utm: Record<string, string>;
  }): Promise<{ visitId: string; participant: CampaignParticipant } | null> {
    const participant = await this.getParticipantByCode(input.code);
    if (!participant || participant.status !== 'active') return null;

    const campaign = await this.getCampaign(participant.campaignId);
    if (!campaign || campaign.status !== 'active') return null;
    if (input.campaignId && input.campaignId !== campaign.id) {
      // Prefer participant's campaign; ignore mismatched query param.
    }

    const db = requireDb();
    const ref = db.collection('campaignReferralVisits').doc();
    const visit: CampaignReferralVisit = {
      id: ref.id,
      campaignId: campaign.id,
      participantId: participant.id,
      referralCode: participant.referralCode,
      visitorId: input.visitorId,
      createdAt: nowIso(),
      landingPage: input.landingPage,
      hashedNetworkId: input.ip ? hashIdentifier(input.ip) : null,
      deviceHash: input.userAgent
        ? hashIdentifier(`${input.userAgent}:${input.visitorId}`)
        : null,
      userAgent: input.userAgent,
      country: input.country,
      utm: input.utm,
      signupUserId: null,
    };
    await ref.set(visit);
    await db
      .collection('campaignParticipants')
      .doc(participant.id)
      .update({
        clicks: (participant.clicks ?? 0) + 1,
        updatedAt: nowIso(),
      });
    await db.collection('campaigns').doc(campaign.id).update({
      clickCount: (campaign.clickCount ?? 0) + 1,
      updatedAt: nowIso(),
    });
    return { visitId: ref.id, participant };
  },

  /**
   * Idempotent: associates a new user signup to a campaign referral.
   * Does not qualify immediately — runs fraud scoring and sets pending/review.
   */
  async attributeSignup(input: {
    referredUserId: string;
    email: string | null;
    emailVerified: boolean;
    referralCode: string | null;
    campaignId: string | null;
    visitorId: string | null;
    visitId: string | null;
    ip: string | null;
    userAgent: string | null;
  }): Promise<CampaignReferral | null> {
    const code = normalizeCampaignRef(input.referralCode);
    if (!code) return null;

    const participant = await this.getParticipantByCode(code);
    if (!participant || participant.status !== 'active') return null;
    if (participant.userId === input.referredUserId) return null;

    const campaign = await this.getCampaign(participant.campaignId);
    if (!campaign || (campaign.status !== 'active' && campaign.status !== 'ending_review')) {
      return null;
    }

    const db = requireDb();
    const referralId = referralDocId(campaign.id, input.referredUserId);
    const existingRef = db.collection('campaignReferrals').doc(referralId);
    const existingSnap = await existingRef.get();
    if (existingSnap.exists) {
      return mapReferral(existingSnap.id, existingSnap.data()!);
    }

    const hashedNetworkId = input.ip ? hashIdentifier(input.ip) : null;
    const deviceHash = input.userAgent
      ? hashIdentifier(`${input.userAgent}:${input.visitorId ?? ''}`)
      : null;

    const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const [networkSnap, deviceSnap, velocitySnap] = await Promise.all([
      hashedNetworkId
        ? db
            .collection('campaignReferrals')
            .where('campaignId', '==', campaign.id)
            .where('hashedNetworkId', '==', hashedNetworkId)
            .get()
            .catch(() => null)
        : Promise.resolve(null),
      deviceHash
        ? db
            .collection('campaignReferrals')
            .where('campaignId', '==', campaign.id)
            .where('deviceHash', '==', deviceHash)
            .get()
            .catch(() => null)
        : Promise.resolve(null),
      db
        .collection('campaignReferrals')
        .where('campaignId', '==', campaign.id)
        .where('participantId', '==', participant.id)
        .where('registeredAt', '>=', hourAgo)
        .get()
        .catch(() => null),
    ]);

    const participantUser = await db.collection('users').doc(participant.userId).get();
    const participantEmail =
      typeof participantUser.data()?.email === 'string'
        ? String(participantUser.data()?.email)
        : null;

    let assessment = scoreReferralFraud({
      email: input.email,
      emailVerified: input.emailVerified,
      referredUserId: input.referredUserId,
      participantUserId: participant.userId,
      hashedNetworkId,
      deviceHash,
      networkAccountCount: networkSnap?.size ?? 0,
      deviceAccountCount: deviceSnap?.size ?? 0,
      participantHourlySignups: velocitySnap?.size ?? 0,
      networkHourlySignups: networkSnap
        ? networkSnap.docs.filter((d) => String(d.data().registeredAt) >= hourAgo)
            .length
        : 0,
      userAgent: input.userAgent,
      isDatacenterOrProxyHint: detectProxyHint({
        userAgent: input.userAgent,
        forwardedFor: input.ip,
      }),
      accountAgeHours: 0,
      sessionCount: 0,
      meaningfulActionCount: 0,
    });
    assessment = compareParticipantEmail(input.email, participantEmail, assessment);

    let status: ReferralStatus = 'registered';
    if (input.emailVerified) status = 'email_verified';
    if (assessment.suggestedStatus === 'rejected') status = 'rejected';
    else if (assessment.suggestedStatus === 'fraud_review') status = 'fraud_review';
    else status = 'pending';

    const pendingHours = Math.max(
      1,
      campaign.qualificationRules.minimumAccountAgeHours,
    );
    const pendingUntil = new Date(
      Date.now() + pendingHours * 60 * 60 * 1000,
    ).toISOString();

    const ref = existingRef;
    const registeredAt = nowIso();
    const referral: CampaignReferral & {
      hashedNetworkId: string | null;
      deviceHash: string | null;
    } = {
      id: referralId,
      campaignId: campaign.id,
      participantId: participant.id,
      referralCode: participant.referralCode,
      referredUserId: input.referredUserId,
      originalVisitId: input.visitId,
      status,
      fraudRiskScore: assessment.score,
      fraudSignals: assessment.signals,
      registeredAt,
      verifiedAt: input.emailVerified ? registeredAt : null,
      qualifiedAt: null,
      rejectedAt: status === 'rejected' ? registeredAt : null,
      pendingUntil: status === 'pending' ? pendingUntil : null,
      updatedAt: registeredAt,
      hashedNetworkId,
      deviceHash,
    };

    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (current.exists) return;

      tx.create(ref, referral);

      const participantRef = db
        .collection('campaignParticipants')
        .doc(participant.id);
      const pSnap = await tx.get(participantRef);
      if (!pSnap.exists) return;
      const pdata = pSnap.data()!;
      const patch: Record<string, unknown> = {
        registrations: Number(pdata.registrations ?? 0) + 1,
        updatedAt: nowIso(),
      };
      if (input.emailVerified) {
        patch.verifiedSignups = Number(pdata.verifiedSignups ?? 0) + 1;
      }
      if (status === 'pending') {
        patch.pendingReferrals = Number(pdata.pendingReferrals ?? 0) + 1;
      } else if (status === 'rejected') {
        patch.rejectedReferrals = Number(pdata.rejectedReferrals ?? 0) + 1;
      } else if (status === 'fraud_review') {
        patch.fraudReviewCount = Number(pdata.fraudReviewCount ?? 0) + 1;
        patch.pendingReferrals = Number(pdata.pendingReferrals ?? 0) + 1;
      }
      tx.update(participantRef, patch);

      if (input.visitId) {
        tx.update(db.collection('campaignReferralVisits').doc(input.visitId), {
          signupUserId: input.referredUserId,
        });
      }

      const userRef = db.collection('users').doc(input.referredUserId);
      const userSnap = await tx.get(userRef);
      if (userSnap.exists) {
        const udata = userSnap.data() ?? {};
        if (!udata.campaignReferredByCode) {
          tx.update(userRef, {
            campaignReferredByCode: participant.referralCode,
            campaignReferredByCampaignId: campaign.id,
            campaignReferredByParticipantId: participant.id,
          });
        }
      }
    });

    const saved = await ref.get();
    return mapReferral(saved.id, saved.data()!);
  },

  async reevaluateReferral(referralId: string): Promise<CampaignReferral> {
    const db = requireDb();
    const ref = db.collection('campaignReferrals').doc(referralId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Referral not found.');
    const referral = mapReferral(snap.id, snap.data()!);
    if (referral.status === 'qualified' || referral.status === 'rejected') {
      return referral;
    }

    const campaign = await this.getCampaign(referral.campaignId);
    if (!campaign) throw new Error('Campaign not found.');

    const userSnap = await db.collection('users').doc(referral.referredUserId).get();
    const user = userSnap.data() ?? {};
    const emailVerified = Boolean(user.emailVerified);
    const createdAt = typeof user.createdAt === 'string' ? user.createdAt : referral.registeredAt;
    const accountAgeHours =
      (Date.now() - new Date(createdAt).getTime()) / (60 * 60 * 1000);
    const sessionCount = Number(user.campaignSessionCount ?? user.sessionCount ?? 1);
    const meaningfulActionCount = Number(
      user.campaignMeaningfulActions ?? user.chatCount ?? 0,
    );

    const check = canAutoQualify({
      rules: campaign.qualificationRules,
      emailVerified,
      accountAgeHours,
      sessionCount,
      meaningfulActionCount,
      fraudScore: referral.fraudRiskScore,
      suggestedStatus:
        referral.fraudRiskScore >= campaign.qualificationRules.veryHighRiskFloor
          ? 'rejected'
          : referral.fraudRiskScore >= campaign.qualificationRules.highRiskFloor
            ? 'fraud_review'
            : 'pending',
    });

    if (!check.ok) {
      const nextStatus: ReferralStatus =
        check.reasons.includes('auto_rejected_by_fraud')
          ? 'rejected'
          : check.reasons.includes('requires_fraud_review') ||
              check.reasons.includes('manual_approval_required')
            ? 'fraud_review'
            : 'pending';
      await ref.update({
        status: nextStatus,
        verifiedAt: emailVerified ? referral.verifiedAt ?? nowIso() : referral.verifiedAt,
        rejectedAt: nextStatus === 'rejected' ? nowIso() : null,
        updatedAt: nowIso(),
      });
      return mapReferral(ref.id, { ...snap.data(), status: nextStatus });
    }

    return this.markQualified(referralId);
  },

  async markQualified(referralId: string): Promise<CampaignReferral> {
    const db = requireDb();
    const ref = db.collection('campaignReferrals').doc(referralId);

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      if (!snap.exists) throw new Error('Referral not found.');
      const data = snap.data()!;
      if (data.status === 'qualified') return;

      const previous = String(data.status);
      tx.update(ref, {
        status: 'qualified',
        qualifiedAt: nowIso(),
        updatedAt: nowIso(),
        rejectedAt: null,
      });

      const participantRef = db
        .collection('campaignParticipants')
        .doc(String(data.participantId));
      const pSnap = await tx.get(participantRef);
      if (pSnap.exists) {
        const pdata = pSnap.data()!;
        const patch: Record<string, unknown> = {
          qualifiedReferrals: Number(pdata.qualifiedReferrals ?? 0) + 1,
          updatedAt: nowIso(),
        };
        if (previous === 'pending' || previous === 'fraud_review') {
          patch.pendingReferrals = Math.max(0, Number(pdata.pendingReferrals ?? 0) - 1);
        }
        if (previous === 'fraud_review') {
          patch.fraudReviewCount = Math.max(0, Number(pdata.fraudReviewCount ?? 0) - 1);
        }
        tx.update(participantRef, patch);
      }

      const campaignRef = db.collection('campaigns').doc(String(data.campaignId));
      const cSnap = await tx.get(campaignRef);
      if (cSnap.exists) {
        tx.update(campaignRef, {
          qualifiedReferralCount:
            Number(cSnap.data()?.qualifiedReferralCount ?? 0) + 1,
          updatedAt: nowIso(),
        });
      }
    });

    const updated = await ref.get();
    await this.recalculateRanks(String(updated.data()?.campaignId));
    return mapReferral(updated.id, updated.data()!);
  },

  async markRejected(
    referralId: string,
    admin: { uid: string; email: string | null },
    reason?: string,
  ): Promise<CampaignReferral> {
    const db = requireDb();
    const ref = db.collection('campaignReferrals').doc(referralId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Referral not found.');
    const previous = mapReferral(snap.id, snap.data()!);

    await db.runTransaction(async (tx) => {
      const current = await tx.get(ref);
      if (!current.exists) return;
      const data = current.data()!;
      if (data.status === 'rejected') return;
      const wasQualified = data.status === 'qualified';
      tx.update(ref, {
        status: 'rejected',
        rejectedAt: nowIso(),
        updatedAt: nowIso(),
      });
      const participantRef = db
        .collection('campaignParticipants')
        .doc(String(data.participantId));
      const pSnap = await tx.get(participantRef);
      if (pSnap.exists) {
        const pdata = pSnap.data()!;
        const patch: Record<string, unknown> = {
          rejectedReferrals: Number(pdata.rejectedReferrals ?? 0) + 1,
          updatedAt: nowIso(),
        };
        if (wasQualified) {
          patch.qualifiedReferrals = Math.max(
            0,
            Number(pdata.qualifiedReferrals ?? 0) - 1,
          );
        } else {
          patch.pendingReferrals = Math.max(0, Number(pdata.pendingReferrals ?? 0) - 1);
        }
        tx.update(participantRef, patch);
      }
      if (wasQualified) {
        const campaignRef = db.collection('campaigns').doc(String(data.campaignId));
        const cSnap = await tx.get(campaignRef);
        if (cSnap.exists) {
          tx.update(campaignRef, {
            qualifiedReferralCount: Math.max(
              0,
              Number(cSnap.data()?.qualifiedReferralCount ?? 0) - 1,
            ),
            updatedAt: nowIso(),
          });
        }
      }
    });

    await writeAudit({
      campaignId: previous.campaignId,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'reject_referral',
      targetType: 'referral',
      targetId: referralId,
      previousValue: { status: previous.status },
      newValue: { status: 'rejected', reason: reason ?? null },
    });

    await this.recalculateRanks(previous.campaignId);
    const updated = await ref.get();
    return mapReferral(updated.id, updated.data()!);
  },

  async approveReferral(
    referralId: string,
    admin: { uid: string; email: string | null },
  ): Promise<CampaignReferral> {
    const referral = await this.markQualified(referralId);
    await writeAudit({
      campaignId: referral.campaignId,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'approve_referral',
      targetType: 'referral',
      targetId: referralId,
      newValue: { status: 'qualified' },
    });
    return referral;
  },

  async recalculateRanks(campaignId: string): Promise<void> {
    const campaign = await this.getCampaign(campaignId);
    if (!campaign) return;
    const participants = await this.listParticipants(campaignId);
    const leaderboard = buildLeaderboard(participants);
    const db = requireDb();
    const batch = db.batch();
    for (const row of leaderboard) {
      const estimated = estimatePayoutUsd(
        campaign.prizePoolUsd,
        campaign.payoutStructure,
        row.rank,
        leaderboard.length,
      );
      batch.update(db.collection('campaignParticipants').doc(row.participantId), {
        rank: row.rank,
        estimatedPayoutUsd: estimated,
        updatedAt: nowIso(),
      });
    }
    await batch.commit();
  },

  async getLeaderboard(campaignId: string) {
    const participants = await this.listParticipants(campaignId);
    return buildLeaderboard(participants);
  },

  async listFraudQueue(campaignId: string): Promise<CampaignReferral[]> {
    const db = requireDb();
    const snap = await db
      .collection('campaignReferrals')
      .where('campaignId', '==', campaignId)
      .where('status', 'in', ['fraud_review', 'pending'])
      .get();
    return snap.docs
      .map((doc) => mapReferral(doc.id, doc.data()))
      .filter((r) => r.fraudRiskScore >= 30 || r.status === 'fraud_review')
      .sort((a, b) => b.fraudRiskScore - a.fraudRiskScore);
  },

  async setParticipantStatus(
    participantId: string,
    status: CampaignParticipant['status'],
    admin: { uid: string; email: string | null },
  ): Promise<CampaignParticipant> {
    const db = requireDb();
    const ref = db.collection('campaignParticipants').doc(participantId);
    const snap = await ref.get();
    if (!snap.exists) throw new Error('Participant not found.');
    const previous = mapParticipant(snap.id, snap.data()!);
    await ref.update({ status, updatedAt: nowIso() });
    await writeAudit({
      campaignId: previous.campaignId,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'set_participant_status',
      targetType: 'participant',
      targetId: participantId,
      previousValue: { status: previous.status },
      newValue: { status },
    });
    await this.recalculateRanks(previous.campaignId);
    const updated = await ref.get();
    return mapParticipant(updated.id, updated.data()!);
  },

  async finalizeCampaign(
    campaignId: string,
    admin: { uid: string; email: string | null },
  ): Promise<Campaign> {
    await this.recalculateRanks(campaignId);
    const campaign = await this.updateCampaign(
      campaignId,
      { status: 'finalized' },
      admin,
    );
    const db = requireDb();
    await db.collection('campaigns').doc(campaignId).update({
      finalizedAt: nowIso(),
    });
    await writeAudit({
      campaignId,
      adminUserId: admin.uid,
      adminEmail: admin.email,
      action: 'finalize_campaign',
      targetType: 'campaign',
      targetId: campaignId,
      newValue: { status: 'finalized' },
    });
    return { ...campaign, status: 'finalized', finalizedAt: nowIso() };
  },

  async runPendingQualificationSweep(campaignId: string): Promise<number> {
    const db = requireDb();
    const snap = await db
      .collection('campaignReferrals')
      .where('campaignId', '==', campaignId)
      .where('status', '==', 'pending')
      .get();
    let changed = 0;
    for (const doc of snap.docs) {
      const pendingUntil = doc.data().pendingUntil;
      if (typeof pendingUntil === 'string' && pendingUntil > nowIso()) continue;
      await this.reevaluateReferral(doc.id);
      changed += 1;
    }
    return changed;
  },
};
