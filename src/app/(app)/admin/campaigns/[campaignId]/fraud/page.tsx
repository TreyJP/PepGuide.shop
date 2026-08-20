'use client';

import { AdminCampaignsPanel } from '@/src/components/admin/admin-campaigns-panel';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useAuthStore } from '@/src/stores/auth-store';
import { Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminCampaignFraudPage() {
  const router = useRouter();
  const params = useParams<{ campaignId: string }>();
  const user = useAuthStore((state) => state.user);
  const { loading, isAdmin } = useAdminAccess();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/?signin=1');
      return;
    }
    if (!isAdmin) router.replace('/');
  }, [loading, isAdmin, router, user]);

  if (loading || !isAdmin) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-foreground-secondary" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="px-4 pt-4 text-sm text-foreground-secondary sm:px-6">
        Fraud review for campaign{' '}
        <span className="font-semibold text-foreground">
          {params.campaignId}
        </span>
        . Select the campaign in the list to load its queue.
      </p>
      <AdminCampaignsPanel />
    </div>
  );
}
