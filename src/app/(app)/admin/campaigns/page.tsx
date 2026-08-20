'use client';

import { AdminCampaignsPanel } from '@/src/components/admin/admin-campaigns-panel';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useAuthStore } from '@/src/stores/auth-store';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminCampaignsPage() {
  const router = useRouter();
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

  return <AdminCampaignsPanel />;
}
