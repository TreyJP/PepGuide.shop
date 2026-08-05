'use client';

import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useAuthStore } from '@/src/stores/auth-store';

export type ProAccessState = {
  loading: boolean;
  isPro: boolean;
};

/** PepGuide Pro content access — paid Pro subscribers and admin accounts. */
export function useProAccess(): ProAccessState {
  const user = useAuthStore((state) => state.user);
  const initializing = useAuthStore((state) => state.initializing);
  const { loading: adminLoading, isAdmin } = useAdminAccess();

  if (initializing || adminLoading) {
    return { loading: true, isPro: false };
  }

  return {
    loading: false,
    isPro: user?.subscriptionTier === 'pro' || isAdmin,
  };
}
