'use client';

import { GuidesPanel } from '@/src/components/pro/guides-panel';
import { ProLockedPreview } from '@/src/components/pro/pro-locked-preview';
import { useProAccess } from '@/src/hooks/use-pro-access';

export default function ProGuidesPage() {
  const { loading, isPro } = useProAccess();

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
            Guides
          </h1>
        </div>
        <p className="mt-1 text-sm text-foreground-secondary">
          Skool-style video lessons for peptide research.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-5xl">
          {loading ? (
            <p className="text-sm text-foreground-secondary">Loading…</p>
          ) : isPro ? (
            <GuidesPanel />
          ) : (
            <ProLockedPreview feature="Guides">
              <GuidesPanel />
            </ProLockedPreview>
          )}
        </div>
      </div>
    </div>
  );
}
