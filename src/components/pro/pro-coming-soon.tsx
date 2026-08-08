'use client';

import { Sparkles } from 'lucide-react';

import { PRO_BILLING } from '@/src/constants/billing';

type ProComingSoonProps = {
  feature: string;
};

/** Placeholder while PepGuide Pro checkout/content isn’t live yet. */
export function ProComingSoon({ feature }: ProComingSoonProps) {
  return (
    <div className="flex min-h-[320px] items-center justify-center px-4 py-10 sm:min-h-[420px]">
      <div className="max-w-md text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          <Sparkles className="size-3" />
          PepGuide Pro
        </div>
        <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          {feature}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
          Coming soon. {PRO_BILLING.tagline} will open here — Chat, Questions &
          Discussion, Library, Cycle, and Calculator stay free in the meantime.
        </p>
        <p className="mt-5 inline-flex h-10 items-center justify-center rounded-[12px] border border-border bg-surface-secondary px-4 text-sm font-medium text-foreground-secondary">
          Coming soon
        </p>
      </div>
    </div>
  );
}
