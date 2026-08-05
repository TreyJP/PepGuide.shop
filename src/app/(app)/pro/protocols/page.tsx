'use client';

import { ProtocolsPanel } from '@/src/components/pro/protocols-panel';
import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { useProAccess } from '@/src/hooks/use-pro-access';

export default function ProProtocolsPage() {
  const { loading, isPro } = useProAccess();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Protocols
          </h1>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Goal-built peptide stacks for research planning.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : isPro ? (
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
