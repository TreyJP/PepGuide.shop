'use client';

import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AffDesignConsole } from '@/src/components/affiliates/designs/aff-design-console';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import '@/src/components/affiliates/affiliates-designs.css';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useAffiliateAccess } from '@/src/hooks/use-affiliate-access';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';
import { Button } from '@/src/components/ui/button';

export function AffiliatesWorkspace() {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const { isAdmin } = useAdminAccess();
  const { loading, canAccess, isAffiliate, affiliate } = useAffiliateAccess();
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);

  const shareUrl = useMemo(() => {
    if (!affiliate || typeof window === 'undefined') return '';
    return `${window.location.origin}/r/${encodeURIComponent(affiliate.code)}`;
  }, [affiliate]);

  const onCopy = async (value: string, kind: 'link' | 'code') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Loading affiliate…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-foreground-secondary">
          Sign in with an affiliate account to view your referral links.
        </p>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            openSignInModal('Sign in to open your affiliate console.')
          }
        >
          Sign in
        </Button>
      </div>
    );
  }

  if (!canAccess) {
    return (
      <div className="flex h-full items-center justify-center px-6 text-center text-sm text-foreground-secondary">
        This section is only available to PepGuide affiliate partners.
      </div>
    );
  }

  if (isAdmin && !isAffiliate) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="max-w-md text-sm text-foreground-secondary">
          You have admin access. Create and link creator seats under Admin →
          Affiliates. Linked partners will see their tracked{' '}
          <span className="font-mono text-foreground">/r/CODE</span> link here.
        </p>
        <Link href="/admin">
          <Button type="button" size="sm" variant="secondary">
            Open Admin
          </Button>
        </Link>
      </div>
    );
  }

  const viewProps: AffiliateDesignViewProps = {
    affiliate,
    referredByCode: user.referredByCode ?? null,
    shareUrl,
    copied,
    onCopy,
  };

  return (
    <div className="aff-root">
      <div className="aff-scroll">
        <AffDesignConsole {...viewProps} />
      </div>
    </div>
  );
}
