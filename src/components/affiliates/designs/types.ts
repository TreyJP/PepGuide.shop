import type { ReferralAffiliate } from '@/src/types/referral-affiliates';

export type AffiliateDesignViewProps = {
  affiliate: ReferralAffiliate | null;
  referredByCode: string | null;
  shareUrl: string;
  copied: 'link' | 'code' | null;
  onCopy: (value: string, kind: 'link' | 'code') => void;
  /** Preferred code for self-serve signup (controlled by workspace). */
  signupCode: string;
  onSignupCodeChange: (code: string) => void;
  enrolling: boolean;
  enrollError: string | null;
  onEnroll: () => void;
};
