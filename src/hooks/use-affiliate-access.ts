'use client';

import { useEffect, useState } from 'react';

import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { referralAffiliatesRepository } from '@/src/services/firestore/referral-affiliates';
import { useAuthStore } from '@/src/stores/auth-store';
import type { ReferralAffiliate } from '@/src/types/referral-affiliates';

export type AffiliateAccessState = {
  loading: boolean;
  /** Linked to an active referral affiliate seat. */
  isAffiliate: boolean;
  /** Affiliate seat or admin. */
  canAccess: boolean;
  affiliate: ReferralAffiliate | null;
};

/** Creator referral console access — linked affiliate seats and admins. */
export function useAffiliateAccess(): AffiliateAccessState {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const { loading: adminLoading, isAdmin } = useAdminAccess();
  const [affiliate, setAffiliate] = useState<ReferralAffiliate | null>(null);
  const [seatLoading, setSeatLoading] = useState(true);

  useEffect(() => {
    if (initializing || adminLoading) return;

    if (!user) {
      setAffiliate(null);
      setSeatLoading(false);
      return;
    }

    let cancelled = false;
    setSeatLoading(true);
    void (async () => {
      try {
        const linked = await referralAffiliatesRepository.getByLinkedUserId(
          user.id,
        );
        if (!cancelled) setAffiliate(linked);
      } catch {
        if (!cancelled) setAffiliate(null);
      } finally {
        if (!cancelled) setSeatLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, initializing, adminLoading]);

  if (initializing || adminLoading || (Boolean(user) && seatLoading)) {
    return {
      loading: true,
      isAffiliate: false,
      canAccess: false,
      affiliate: null,
    };
  }

  const isAffiliate = Boolean(
    affiliate &&
      user &&
      affiliate.linkedUserId === user.id &&
      affiliate.active,
  );

  return {
    loading: false,
    isAffiliate,
    canAccess: isAffiliate || isAdmin,
    affiliate: isAffiliate ? affiliate : null,
  };
}
