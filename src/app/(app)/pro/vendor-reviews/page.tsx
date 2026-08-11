'use client';

import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { VendorReviewsPanel } from '@/src/components/pro/vendor-reviews-panel';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useProAccess } from '@/src/hooks/use-pro-access';

export default function VendorReviewsPage() {
  const { loading, isPro } = useProAccess();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const waiting = loading || adminLoading;
  const unlocked = isAdmin || (isPro && !PRO_COMING_SOON);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
          Vendor Reviews
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-foreground-secondary">
          Community notes on PepGuide partners — shipping, packaging, and
          transparency.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 sm:p-6">
        <div className="mx-auto w-full max-w-3xl">
          {waiting ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : unlocked ? (
            <VendorReviewsPanel />
          ) : (
            <ProLockedPreview feature="Vendor Reviews">
              <VendorReviewsPanel />
            </ProLockedPreview>
          )}
        </div>
      </div>
    </div>
  );
}
