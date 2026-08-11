'use client';

import { ProtocolsPanel } from '@/src/components/pro/protocols-panel';
import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { PRO_COMING_SOON } from '@/src/constants/billing';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { useProAccess } from '@/src/hooks/use-pro-access';

export default function ProProtocolsPage() {
  const { loading, isPro } = useProAccess();
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const waiting = loading || adminLoading;
  const unlocked = isAdmin || (isPro && !PRO_COMING_SOON);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-3.5 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground sm:text-2xl">
          Protocols
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Goal-built peptide stacks for research planning.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain p-4 pb-8 sm:p-6">
        <div className="mx-auto w-full max-w-6xl">
          {waiting ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : unlocked ? (
            <ProtocolsPanel />
          ) : (
            <ProLockedPreview feature="Protocols">
              <ProtocolsPanel />
            </ProLockedPreview>
          )}
        </div>
      </div>
    </div>
  );
}
