'use client';

import { BookOpen, Check, FlaskConical, Sparkles } from 'lucide-react';

import { Button } from '@/src/components/ui/button';
import { PRO_BILLING } from '@/src/constants/billing';
import { useUiStore } from '@/src/stores/ui-store';

export function ProUnlockCard() {
  const openProSubscribeModal = useUiStore(
    (state) => state.openProSubscribeModal,
  );

  return (
    <div className="overflow-hidden rounded-[20px] border border-accent/30 bg-surface shadow-[0_12px_32px_rgba(109,79,232,0.12)]">
      <div className="bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_18%,transparent),color-mix(in_srgb,var(--accent-secondary)_8%,transparent)_50%,transparent_100%)] px-5 py-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-accent-muted px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-accent">
          <Sparkles className="size-3" />
          PepGuide Pro
        </div>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
          Unlock PepGuide Pro
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-foreground-secondary">
          Education & Research lessons, Protocol stacks, and Questions &
          Discussion. Subscribe to open the full Pro library.
        </p>
      </div>

      <div className="space-y-4 px-5 py-4">
        <ul className="space-y-2.5">
          <li className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-accent-muted text-accent">
              <BookOpen className="size-3.5" />
            </span>
            <span>
              <span className="font-semibold">Education & Research</span>
              <span className="text-foreground-secondary">
                {' '}
                — video lessons that teach the research workflow
              </span>
            </span>
          </li>
          <li className="flex items-start gap-2.5 text-sm text-foreground">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-accent-muted text-accent">
              <FlaskConical className="size-3.5" />
            </span>
            <span>
              <span className="font-semibold">Protocols</span>
              <span className="text-foreground-secondary">
                {' '}
                — curated peptide stacks for specific goals
              </span>
            </span>
          </li>
          {PRO_BILLING.features.slice(2).map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-foreground-secondary"
            >
              <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-[10px] bg-surface-secondary text-accent">
                <Check className="size-3.5" />
              </span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap items-end justify-between gap-3 border-t border-border pt-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
              Membership
            </p>
            <p className="mt-0.5 font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
              {PRO_BILLING.priceLabel}
            </p>
          </div>
          <Button
            onClick={() => openProSubscribeModal('PepGuide Pro')}
            className="w-full sm:w-auto sm:min-w-[160px]"
          >
            Subscribe — {PRO_BILLING.priceLabel}
          </Button>
        </div>

        <p className="text-xs text-foreground-secondary">
          Free Chat, Library, Cycle, and Calculator stay available. Cancel
          anytime.
        </p>
      </div>
    </div>
  );
}
