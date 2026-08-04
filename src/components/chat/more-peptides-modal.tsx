'use client';

import { useMemo } from 'react';

import { ModalShell } from '@/src/components/ui/modal-shell';
import { getResearchGuideByIds } from '@/src/data/knowledge/research-guide';

export type MorePeptidesModalProps = {
  open: boolean;
  peptideIds: string[];
  onClose: () => void;
  onSelect: (peptideId: string) => void;
  onAddToCycle?: (peptideId: string) => void;
};

export function MorePeptidesModal({
  open,
  peptideIds,
  onClose,
  onSelect,
  onAddToCycle,
}: MorePeptidesModalProps) {
  const entries = useMemo(
    () => (open ? getResearchGuideByIds(peptideIds) : []),
    [open, peptideIds],
  );

  return (
    <ModalShell
      open={open && entries.length > 0}
      onClose={onClose}
      titleId="more-peptides-title"
      eyebrow="More options"
      title="All research peptides"
      description="Compare prices or add a peptide to your cycle log"
      className="max-w-2xl"
    >
      <div className="space-y-2">
        {entries.map((entry, index) => (
          <div
            key={entry.id}
            className="rounded-[14px] border border-border bg-surface-secondary px-4 py-3.5"
          >
            <button
              type="button"
              onClick={() => onSelect(entry.id)}
              className="flex w-full items-start justify-between gap-3 text-left transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-accent-muted text-[11px] font-semibold text-accent">
                    {index + 1}
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-foreground">
                    {entry.name}
                  </h3>
                </div>
                <p className="mt-1.5 text-xs font-medium text-accent">
                  {entry.mainEffectsLabel}
                </p>
                <p className="mt-1 text-sm text-foreground-secondary">
                  {entry.why}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-foreground-secondary">
                  <span className="font-semibold uppercase tracking-[0.1em]">
                    Dose:{' '}
                  </span>
                  {entry.researchDosing}
                </p>
              </div>
              <span className="shrink-0 pt-1 text-xs font-semibold text-accent">
                View prices →
              </span>
            </button>
            {onAddToCycle ? (
              <button
                type="button"
                onClick={() => onAddToCycle(entry.id)}
                className="mt-2 text-xs font-semibold text-foreground-secondary hover:text-foreground"
              >
                Add to cycle
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
