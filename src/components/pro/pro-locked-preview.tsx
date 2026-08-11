'use client';

import { Lock, Sparkles } from 'lucide-react';
import { useEffect, type ReactNode } from 'react';

import { PRO_BILLING, PRO_COMING_SOON } from '@/src/constants/billing';
import { cn } from '@/src/lib/utils';
import { useUiStore } from '@/src/stores/ui-store';

export type ProFeatureName =
  | 'Education & Research'
  | 'Guides'
  | 'Protocols'
  | 'Bookmarks'
  | 'Ask a Professional'
  | 'Forum'
  | 'Questions & Discussion'
  | 'PepGuide Pro';

export type ProLockedPreviewProps = {
  feature: ProFeatureName;
  children: ReactNode;
  className?: string;
};

/**
 * Shows Pro content as a greyed/blurred teaser. Interaction is blocked;
 * clicking opens the subscribe modal — or Coming soon while PRO_COMING_SOON.
 */
export function ProLockedPreview({
  feature,
  children,
  className,
}: ProLockedPreviewProps) {
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );

  useEffect(() => {
    // Auto-open the gate once so locked visitors see the CTA immediately.
    openProSubscribeModal(feature);
  }, [feature, openProSubscribeModal]);

  return (
    <div
      className={cn(
        'relative isolate min-h-[320px] sm:min-h-[420px]',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none select-none opacity-60 grayscale [filter:blur(8px)]"
      >
        {children}
      </div>

      <button
        type="button"
        aria-label={
          PRO_COMING_SOON
            ? `${feature} is coming soon`
            : `Unlock PepGuide Pro ${feature}`
        }
        onClick={() => openProSubscribeModal(feature)}
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center bg-[color-mix(in_srgb,var(--background)_40%,transparent)] p-4"
      >
        <span className="flex max-w-sm flex-col items-center rounded-[20px] border border-border bg-surface px-5 py-5 text-center shadow-[0_16px_40px_rgba(15,23,42,0.16)]">
          <span className="inline-flex size-11 items-center justify-center rounded-[14px] bg-accent-muted text-accent">
            {PRO_COMING_SOON ? (
              <Sparkles className="size-5" />
            ) : (
              <Lock className="size-5" />
            )}
          </span>
          <span className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            PepGuide Pro
          </span>
          <span className="mt-1 text-sm text-foreground-secondary">
            {PRO_COMING_SOON
              ? `${feature} is coming soon. Free Chat, Questions & Discussion, Library, Cycle, and Calculator stay available.`
              : `Subscribe for ${PRO_BILLING.priceLabel} to unlock ${feature}.`}
          </span>
          <span
            className={
              PRO_COMING_SOON
                ? 'mt-4 inline-flex h-10 items-center justify-center rounded-[12px] border border-border bg-surface-secondary px-4 text-sm font-medium text-foreground-secondary'
                : 'mt-4 inline-flex h-10 items-center justify-center rounded-[12px] bg-accent px-4 text-sm font-medium text-white'
            }
          >
            {PRO_COMING_SOON
              ? 'Coming soon'
              : `Unlock — ${PRO_BILLING.priceLabel}`}
          </span>
        </span>
      </button>
    </div>
  );
}
