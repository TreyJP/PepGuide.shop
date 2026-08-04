'use client';

import { useMemo, useState } from 'react';

import { AffiliateModal } from '@/src/components/affiliates/affiliate-modal';
import { AffiliateOfferPanel } from '@/src/components/affiliates/affiliate-offer-panel';
import { rankTopAffiliatePicks } from '@/src/lib/affiliates';

export type AffiliatePicksProps = {
  peptideIds: string[];
  onSelect?: (peptideId: string) => void;
  /** When true, parent owns the pricing modal. */
  managedExternally?: boolean;
};

export function AffiliatePicks({
  peptideIds,
  onSelect,
  managedExternally = false,
}: AffiliatePicksProps) {
  const picks = useMemo(() => rankTopAffiliatePicks(peptideIds, 3), [peptideIds]);
  const [modalId, setModalId] = useState<string | null>(null);

  if (picks.length === 0) return null;

  const openPick = (peptideId: string) => {
    onSelect?.(peptideId);
    if (!managedExternally) setModalId(peptideId);
  };

  const active = picks.find((pick) => pick.peptideId === modalId) ?? null;

  return (
    <>
      <section className="w-full animate-fade-up">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">
              Ranked for your question
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground">
              Top 3 picks
            </h2>
          </div>
          <p className="max-w-[14rem] text-right text-xs leading-relaxed text-foreground-secondary">
            Click a pick to open full pricing
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {picks.map((pick, index) => (
            <div
              key={pick.peptideId}
              className="min-h-[420px] animate-fade-up"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <AffiliateOfferPanel
                peptideId={pick.peptideId}
                peptideName={pick.name}
                rank={pick.rank}
                reason={pick.reason}
                onExpand={() => openPick(pick.peptideId)}
                className="h-full"
              />
            </div>
          ))}
        </div>
      </section>

      {!managedExternally && active ? (
        <AffiliateModal
          open
          peptideId={active.peptideId}
          peptideName={active.name}
          rank={active.rank}
          onClose={() => setModalId(null)}
        />
      ) : null}
    </>
  );
}
