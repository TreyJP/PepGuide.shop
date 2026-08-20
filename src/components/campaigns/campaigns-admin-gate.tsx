'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

/** Temporarily gates Campaigns UI to admins only while the feature soft-launches. */
export function CampaignsAdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const { loading, isAdmin } = useAdminAccess();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      openSignInModal('Sign in with an admin account to preview Campaigns.');
      return;
    }
    if (!isAdmin) {
      router.replace('/chat');
    }
  }, [loading, isAdmin, router, user, openSignInModal]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        {loading ? 'Loading…' : 'Campaigns is in private preview.'}
      </div>
    );
  }

  return <>{children}</>;
}
