/** PepGuide referral affiliates (signup codes + commission %) — not vendor partners. */
export type ReferralAffiliate = {
  id: string;
  name: string;
  email: string | null;
  /** Unique signup code, stored uppercase. */
  code: string;
  /**
   * @deprecated Prefer firstOrderCommissionPercent / recurringCommissionPercent.
   * Kept as the first-order rate for older documents.
   */
  commissionPercent: number;
  /** Commission % on a referred member’s first paid order. */
  firstOrderCommissionPercent: number;
  /** Commission % on every paid order after the first. */
  recurringCommissionPercent: number;
  active: boolean;
  /** PepGuide user id that owns this affiliate seat. */
  linkedUserId: string | null;
  /** Signups attributed to this code. */
  referralCount: number;
  createdAt: string;
  updatedAt: string;
};

export type ReferralAffiliateInput = {
  name: string;
  email?: string | null;
  code: string;
  /** @deprecated Use first/recurring fields. */
  commissionPercent?: number;
  firstOrderCommissionPercent?: number;
  recurringCommissionPercent?: number;
  active?: boolean;
  linkedUserId?: string | null;
};

export type AffiliateSelfEnrollInput = {
  userId: string;
  displayName: string;
  email: string;
  /** Optional custom code; generated when omitted. */
  code?: string;
};
