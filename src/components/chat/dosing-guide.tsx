'use client';

import { getResearchGuideByIds } from '@/src/data/knowledge/research-guide';
import { cn } from '@/src/lib/utils';

export type DosingGuideProps = {
  peptideIds: string[];
  previewLimit?: number;
  onSelect?: (peptideId: string) => void;
  onAddToCycle?: (peptideId: string) => void;
  onViewMore?: () => void;
  className?: string;
};

export function DosingGuide({
  peptideIds,
  previewLimit = 3,
  onSelect,
  onAddToCycle,
  onViewMore,
  className,
}: DosingGuideProps) {
  const allEntries = getResearchGuideByIds(peptideIds);
  const entries = allEntries.slice(0, previewLimit);
  const remaining = Math.max(0, allEntries.length - entries.length);
  if (entries.length === 0) return null;

  return (
    <section
      className={cn(
        'animate-fade-up overflow-hidden rounded-[20px] border border-border bg-surface shadow-[0_8px_28px_rgba(15,23,42,0.05)]',
        className,
      )}
    >
      <div className="border-b border-border bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_10%,transparent),transparent_72%)] px-4 py-4 sm:px-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
          Research dosing
        </p>
        <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Start low, then increase
        </h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-foreground-secondary">
          Educational trial/label ranges only — not a personal prescription.
          View prices or add to your cycle log.
        </p>
      </div>

      <div
        className={cn(
          'grid gap-0 md:divide-x md:divide-border',
          entries.length >= 3
            ? 'md:grid-cols-3'
            : entries.length === 2
              ? 'md:grid-cols-2'
              : 'md:grid-cols-1',
        )}
      >
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex min-w-0 flex-col border-b border-border px-4 py-4 last:border-b-0 md:border-b-0 sm:px-5"
          >
            <button
              type="button"
              onClick={() => onSelect?.(entry.id)}
              className="flex-1 text-left transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-muted text-[11px] font-semibold text-accent">
                  {index + 1}
                </span>
                <h3 className="min-w-0 truncate font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-foreground">
                  {entry.name}
                </h3>
              </div>
              <p className="mt-2 text-xs font-medium text-accent">
                {entry.mainEffectsLabel}
              </p>
              <p className="mt-1.5 text-xs text-foreground-secondary">
                {entry.why}
              </p>
              <div className="mt-3 rounded-[14px] bg-surface-secondary/70 px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
                  Dose guide
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground">
                  {entry.researchDosing}
                </p>
              </div>
            </button>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelect?.(entry.id)}
                className="text-xs font-semibold text-accent"
              >
                View prices →
              </button>
              {onAddToCycle ? (
                <button
                  type="button"
                  onClick={() => onAddToCycle(entry.id)}
                  className="text-xs font-semibold text-foreground-secondary hover:text-foreground"
                >
                  Add to cycle
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {remaining > 0 && onViewMore ? (
        <div className="border-t border-border px-5 py-3">
          <button
            type="button"
            onClick={onViewMore}
            className="text-sm font-semibold text-accent transition-colors hover:text-accent/80"
          >
            View more ({remaining} more)
          </button>
        </div>
      ) : null}
    </section>
  );
}
