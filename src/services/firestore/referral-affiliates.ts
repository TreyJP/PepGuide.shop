import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';

import {
  AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  AFFILIATE_RECURRING_COMMISSION_PERCENT,
} from '@/src/constants/referral-affiliates';
import { normalizeReferralCode } from '@/src/lib/referral-code';
import { getFirestoreDb } from '@/src/services/firebase/config';
import type {
  AffiliateSelfEnrollInput,
  ReferralAffiliate,
  ReferralAffiliateInput,
} from '@/src/types/referral-affiliates';
import { createId } from '@/src/utils/dates';

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function affiliatesCol() {
  return collection(requireDb(), 'referralAffiliates');
}

function clampPercent(value: unknown, fallback: number): number {
  const percent = Number(value);
  if (!Number.isFinite(percent)) return fallback;
  return Math.min(100, Math.max(0, Math.round(percent * 100) / 100));
}

function mapAffiliate(
  id: string,
  data: Record<string, unknown>,
): ReferralAffiliate {
  const legacy = clampPercent(data.commissionPercent, 0);
  const firstOrder = clampPercent(
    data.firstOrderCommissionPercent,
    legacy || AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  );
  const recurring = clampPercent(
    data.recurringCommissionPercent,
    AFFILIATE_RECURRING_COMMISSION_PERCENT,
  );

  return {
    id,
    name: String(data.name ?? 'Affiliate'),
    email:
      typeof data.email === 'string' && data.email.trim()
        ? data.email.trim().toLowerCase()
        : null,
    code: normalizeReferralCode(String(data.code ?? '')),
    commissionPercent: firstOrder,
    firstOrderCommissionPercent: firstOrder,
    recurringCommissionPercent: recurring,
    active: data.active !== false,
    linkedUserId:
      typeof data.linkedUserId === 'string' && data.linkedUserId.trim()
        ? data.linkedUserId.trim()
        : null,
    referralCount: Number(data.referralCount ?? 0) || 0,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
  };
}

function assertValidCode(code: string) {
  if (!code) throw new Error('Affiliate code is required.');
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new Error(
      'Code must be 3–32 characters (letters, numbers, _ or -).',
    );
  }
}

/** Build a unique-ish default code from a display name. */
export function suggestAffiliateCode(displayName: string): string {
  const base = normalizeReferralCode(displayName).replace(/[^A-Z0-9]/g, '');
  const stem = (base || 'PARTNER').slice(0, 10);
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${stem}${suffix}`.slice(0, 32);
}

export const referralAffiliatesRepository = {
  async list(): Promise<ReferralAffiliate[]> {
    const snap = await getDocs(affiliatesCol());
    return snap.docs
      .map((item) => mapAffiliate(item.id, item.data() as Record<string, unknown>))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<ReferralAffiliate | null> {
    const snap = await getDoc(doc(requireDb(), 'referralAffiliates', id));
    if (!snap.exists()) return null;
    return mapAffiliate(snap.id, snap.data() as Record<string, unknown>);
  },

  async getByCode(code: string): Promise<ReferralAffiliate | null> {
    const normalized = normalizeReferralCode(code);
    if (!normalized) return null;
    const snap = await getDocs(
      query(affiliatesCol(), where('code', '==', normalized)),
    );
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return mapAffiliate(docSnap.id, docSnap.data() as Record<string, unknown>);
  },

  async getByLinkedUserId(userId: string): Promise<ReferralAffiliate | null> {
    if (!userId) return null;

    // Self-serve seats use the user id as the document id.
    const byId = await this.getById(userId);
    if (byId && byId.linkedUserId === userId) return byId;

    const snap = await getDocs(
      query(affiliatesCol(), where('linkedUserId', '==', userId)),
    );
    if (snap.empty) return null;
    const docSnap = snap.docs[0];
    return mapAffiliate(docSnap.id, docSnap.data() as Record<string, unknown>);
  },

  async resolveActiveCode(code: string): Promise<ReferralAffiliate | null> {
    const affiliate = await this.getByCode(code);
    if (!affiliate || !affiliate.active) return null;
    return affiliate;
  },

  async upsert(
    id: string | null,
    input: ReferralAffiliateInput,
  ): Promise<ReferralAffiliate> {
    const code = normalizeReferralCode(input.code);
    assertValidCode(code);

    const firstOrder = clampPercent(
      input.firstOrderCommissionPercent ?? input.commissionPercent,
      AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
    );
    const recurring = clampPercent(
      input.recurringCommissionPercent,
      AFFILIATE_RECURRING_COMMISSION_PERCENT,
    );

    const existingWithCode = await this.getByCode(code);
    if (existingWithCode && existingWithCode.id !== id) {
      throw new Error(`Code "${code}" is already in use.`);
    }

    const now = new Date().toISOString();
    const docId = id ?? createId('aff');
    const ref = doc(requireDb(), 'referralAffiliates', docId);
    const existing = id ? await getDoc(ref) : null;
    const prev = existing?.exists()
      ? mapAffiliate(docId, existing.data() as Record<string, unknown>)
      : null;

    const payload = {
      name: input.name.trim() || 'Affiliate',
      email:
        typeof input.email === 'string' && input.email.trim()
          ? input.email.trim().toLowerCase()
          : null,
      code,
      commissionPercent: firstOrder,
      firstOrderCommissionPercent: firstOrder,
      recurringCommissionPercent: recurring,
      active: input.active !== false,
      linkedUserId:
        typeof input.linkedUserId === 'string' && input.linkedUserId.trim()
          ? input.linkedUserId.trim()
          : null,
      referralCount: prev?.referralCount ?? 0,
      createdAt: prev?.createdAt ?? now,
      updatedAt: now,
    };

    await setDoc(ref, payload, { merge: true });
    return mapAffiliate(docId, payload);
  },

  /**
   * Any signed-in account can claim an affiliate seat.
   * Document id = userId so each account can only enroll once.
   */
  async enrollSelf(input: AffiliateSelfEnrollInput): Promise<ReferralAffiliate> {
    const existing = await this.getByLinkedUserId(input.userId);
    if (existing) return existing;

    let code = normalizeReferralCode(input.code);
    if (!code) code = suggestAffiliateCode(input.displayName);

    assertValidCode(code);

    const taken = await this.getByCode(code);
    if (taken) {
      // Auto-retry with a generated code when the preferred one is taken.
      if (input.code) {
        throw new Error(`Code "${code}" is already in use. Try another.`);
      }
      code = suggestAffiliateCode(input.displayName);
      const retryTaken = await this.getByCode(code);
      if (retryTaken) {
        code = suggestAffiliateCode(`${input.displayName}${Date.now()}`);
      }
    }

    const now = new Date().toISOString();
    const payload = {
      name: input.displayName.trim() || 'Affiliate',
      email: input.email.trim().toLowerCase() || null,
      code,
      commissionPercent: AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
      firstOrderCommissionPercent: AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
      recurringCommissionPercent: AFFILIATE_RECURRING_COMMISSION_PERCENT,
      active: true,
      linkedUserId: input.userId,
      referralCount: 0,
      createdAt: now,
      updatedAt: now,
      selfEnrolled: true,
    };

    await setDoc(doc(requireDb(), 'referralAffiliates', input.userId), payload);
    return mapAffiliate(input.userId, payload);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(requireDb(), 'referralAffiliates', id));
  },

  async recordReferralSignup(affiliateId: string): Promise<void> {
    await updateDoc(doc(requireDb(), 'referralAffiliates', affiliateId), {
      referralCount: increment(1),
      updatedAt: new Date().toISOString(),
    });
  },
};
