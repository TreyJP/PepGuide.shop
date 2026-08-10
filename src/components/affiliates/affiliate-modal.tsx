'use client';

import { ArrowDownWideNarrow } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PartnerSlotList } from '@/src/components/affiliates/partner-slot-layouts';
import { ModalShell } from '@/src/components/ui/modal-shell';
import { getPartnerLabSortScore } from '@/src/data/affiliates/lab-tests';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { cn } from '@/src/lib/utils';
import { usePartnersStore } from '@/src/stores/partners-store';

export type AffiliateModalProps = {
  open: boolean;
  peptideId: string;
  peptideName: string;
  rank: number;
  onClose: () => void;
};

type SortMode = 'price_low' | 'price_high' | 'test_high';

export function AffiliateModal({
  open,
  peptideId,
  peptideName,
  rank,
  onClose,
}: AffiliateModalProps) {
  const partners = usePartnersStore((state) => state.partners);
  const loaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);
  const [sortMode, setSortMode] = useState<SortMode>('price_low');

  useEffect(() => {
    if (!open) return;
    setSortMode('price_low');
    if (!loaded) void loadPartners();
  }, [open, peptideId, loaded, loadPartners]);

  const partnerById = useMemo(
    () => new Map(partners.map((partner) => [partner.id, partner])),
    [partners],
  );

  const offers = useMemo(() => {
    if (!open) return [];
    return resolvePartnerOffers(partners, peptideId, 'lowestPerVendor');
  }, [open, partners, peptideId]);

  const visibleOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
      const aPreferred = isPreferredPartner(a.vendorId, a.vendorLabel) ? 0 : 1;
      const bPreferred = isPreferredPartner(b.vendorId, b.vendorLabel) ? 0 : 1;
      if (aPreferred !== bPreferred) return aPreferred - bPreferred;

      const aLab = getPartnerLabSortScore(
        a.vendorId,
        partnerById.get(a.vendorId)?.labTests,
      );
      const bLab = getPartnerLabSortScore(
        b.vendorId,
        partnerById.get(b.vendorId)?.labTests,
      );

      if (sortMode === 'test_high') {
        if (bLab !== aLab) return bLab - aLab;
        return a.priceUsd - b.priceUsd;
      }
      if (sortMode === 'price_high') {
        if (b.priceUsd !== a.priceUsd) return b.priceUsd - a.priceUsd;
        return bLab - aLab;
      }
      if (a.priceUsd !== b.priceUsd) return a.priceUsd - b.priceUsd;
      return bLab - aLab;
    });
  }, [offers, sortMode, partnerById]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      titleId="affiliate-modal-title"
      eyebrow={`Rank #${rank}`}
      title={peptideName}
      description="Lowest partner price for this compound. Copy the coupon on each row for checkout."
      className="max-w-xl"
      headerExtra={
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-1.5 text-foreground-secondary">
              <ArrowDownWideNarrow className="size-3.5" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em]">
                Sort
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: 'price_low', label: 'Lowest price' },
                  { id: 'price_high', label: 'Highest price' },
                  { id: 'test_high', label: 'Highest testing' },
                ] as const
              ).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSortMode(option.id)}
                  className={cn(
                    'h-8 rounded-[10px] border px-2.5 text-xs font-semibold transition-colors',
                    sortMode === option.id
                      ? 'border-accent bg-accent-muted text-accent'
                      : 'border-border bg-surface text-foreground-secondary hover:bg-surface-secondary',
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-[11px] uppercase tracking-[0.12em] text-foreground-secondary">
            <span>Partner · lowest price</span>
            <span>
              {visibleOffers.length} result
              {visibleOffers.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      }
      footer="Copy the coupon on each partner slot and paste it at checkout. Research-use framing only."
    >
      <PartnerSlotList
        offers={visibleOffers}
        peptideId={peptideId}
        peptideName={peptideName}
      />
    </ModalShell>
  );
}
