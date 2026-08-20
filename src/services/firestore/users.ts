import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { BRAND } from '@/src/constants/brand';
import {
  consumeReferralCode,
  normalizeReferralCode,
} from '@/src/lib/referral-code';
import { getFirestoreDb } from '@/src/services/firebase/config';
import { referralAffiliatesRepository } from '@/src/services/firestore/referral-affiliates';
import type { UserProfile } from '@/src/types';

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function mapUser(id: string, data: Record<string, unknown>): UserProfile {
  return {
    id,
    displayName: String(data.displayName ?? 'Researcher'),
    email: String(data.email ?? ''),
    photoURL: (data.photoURL as string | null) ?? null,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    onboardingCompleted: Boolean(data.onboardingCompleted ?? true),
    emailVerified: Boolean(data.emailVerified ?? false),
    subscriptionTier: data.subscriptionTier === 'pro' ? 'pro' : 'free',
    accountStatus:
      data.accountStatus === 'cooldown' ||
      data.accountStatus === 'review' ||
      data.accountStatus === 'suspended'
        ? data.accountStatus
        : 'active',
    chatBlockedUntil:
      typeof data.chatBlockedUntil === 'string' && data.chatBlockedUntil
        ? data.chatBlockedUntil
        : null,
    abuseStrikeCount: Number(data.abuseStrikeCount ?? 0),
    chatCount: Number(data.chatCount ?? 0),
    researchInterests: Array.isArray(data.researchInterests)
      ? (data.researchInterests as UserProfile['researchInterests'])
      : [],
    experienceLevel:
      (data.experienceLevel as UserProfile['experienceLevel']) ?? null,
    researchPreferences: Array.isArray(data.researchPreferences)
      ? (data.researchPreferences as UserProfile['researchPreferences'])
      : [],
    acceptedTermsVersion: String(
      data.acceptedTermsVersion ?? BRAND.termsVersion,
    ),
    acceptedPrivacyVersion: String(
      data.acceptedPrivacyVersion ?? BRAND.privacyVersion,
    ),
    acceptedResearchNoticeVersion: String(
      data.acceptedResearchNoticeVersion ?? BRAND.researchNoticeVersion,
    ),
    dataRetentionDays: Number(data.dataRetentionDays ?? 365),
    referredByCode:
      typeof data.referredByCode === 'string' && data.referredByCode.trim()
        ? normalizeReferralCode(data.referredByCode)
        : null,
    referredByAffiliateId:
      typeof data.referredByAffiliateId === 'string' &&
      data.referredByAffiliateId.trim()
        ? data.referredByAffiliateId.trim()
        : null,
    campaignReferredByCode:
      typeof data.campaignReferredByCode === 'string' &&
      data.campaignReferredByCode.trim()
        ? data.campaignReferredByCode.trim()
        : null,
    campaignReferredByCampaignId:
      typeof data.campaignReferredByCampaignId === 'string' &&
      data.campaignReferredByCampaignId.trim()
        ? data.campaignReferredByCampaignId.trim()
        : null,
    campaignReferredByParticipantId:
      typeof data.campaignReferredByParticipantId === 'string' &&
      data.campaignReferredByParticipantId.trim()
        ? data.campaignReferredByParticipantId.trim()
        : null,
    campaignSessionCount: Number(data.campaignSessionCount ?? 0),
    campaignMeaningfulActions: Number(data.campaignMeaningfulActions ?? 0),
    campaignLastSessionAt:
      typeof data.campaignLastSessionAt === 'string' &&
      data.campaignLastSessionAt
        ? data.campaignLastSessionAt
        : null,
  };
}

export const userRepository = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(requireDb(), 'users', userId));
    if (!snap.exists()) return null;
    return mapUser(snap.id, snap.data() as Record<string, unknown>);
  },

  async createProfile(input: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
    emailVerified?: boolean;
    referralCode?: string | null;
  }): Promise<UserProfile> {
    const now = new Date().toISOString();
    const pendingCode =
      normalizeReferralCode(input.referralCode) || consumeReferralCode();
    let referredByCode: string | null = null;
    let referredByAffiliateId: string | null = null;

    if (pendingCode) {
      try {
        const affiliate =
          await referralAffiliatesRepository.resolveActiveCode(pendingCode);
        if (affiliate) {
          referredByCode = affiliate.code;
          referredByAffiliateId = affiliate.id;
        }
      } catch (error) {
        console.error('Failed to resolve referral code', error);
      }
    }

    const payload = {
      displayName: input.displayName,
      email: input.email,
      photoURL: input.photoURL ?? null,
      createdAt: now,
      createdAtServer: serverTimestamp(),
      onboardingCompleted: true,
      emailVerified: input.emailVerified ?? false,
      subscriptionTier: 'free',
      accountStatus: 'active',
      chatBlockedUntil: null,
      abuseStrikeCount: 0,
      chatCount: 0,
      researchInterests: [],
      experienceLevel: null,
      researchPreferences: [],
      acceptedTermsVersion: BRAND.termsVersion,
      acceptedPrivacyVersion: BRAND.privacyVersion,
      acceptedResearchNoticeVersion: BRAND.researchNoticeVersion,
      dataRetentionDays: 365,
      referredByCode,
      referredByAffiliateId,
      campaignReferredByCode: null,
      campaignReferredByCampaignId: null,
      campaignReferredByParticipantId: null,
      campaignSessionCount: 0,
      campaignMeaningfulActions: 0,
      campaignLastSessionAt: null,
    };

    await setDoc(doc(requireDb(), 'users', input.id), payload, { merge: true });

    if (referredByAffiliateId) {
      try {
        await referralAffiliatesRepository.recordReferralSignup(
          referredByAffiliateId,
        );
      } catch (error) {
        console.error('Failed to record referral signup', error);
      }
    }

    return mapUser(input.id, payload);
  },

  async ensureProfile(input: {
    id: string;
    displayName: string;
    email: string;
    photoURL?: string | null;
    emailVerified?: boolean;
    referralCode?: string | null;
  }): Promise<UserProfile> {
    const existing = await this.getProfile(input.id);
    if (existing) {
      if (
        existing.emailVerified !== Boolean(input.emailVerified) ||
        existing.displayName !== input.displayName
      ) {
        return this.updateProfile(input.id, {
          emailVerified: Boolean(input.emailVerified),
          displayName: input.displayName || existing.displayName,
          photoURL: input.photoURL ?? existing.photoURL,
        });
      }
      return existing;
    }
    return this.createProfile(input);
  },

  async updateProfile(
    userId: string,
    patch: Partial<UserProfile>,
  ): Promise<UserProfile> {
    const {
      id: _id,
      subscriptionTier: _tier,
      accountStatus: _status,
      chatBlockedUntil: _blocked,
      abuseStrikeCount: _strikes,
      referredByCode: _refCode,
      referredByAffiliateId: _refId,
      campaignReferredByCode: _cCode,
      campaignReferredByCampaignId: _cCamp,
      campaignReferredByParticipantId: _cPart,
      campaignSessionCount: _cSessions,
      campaignMeaningfulActions: _cActions,
      campaignLastSessionAt: _cLast,
      ...safe
    } = patch;
    await updateDoc(doc(requireDb(), 'users', userId), {
      ...safe,
      updatedAt: new Date().toISOString(),
    });
    const updated = await this.getProfile(userId);
    if (!updated) throw new Error('User profile missing after update');
    return updated;
  },
};
