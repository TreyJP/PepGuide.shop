'use client';

import { ArrowDownWideNarrow, ExternalLink } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { PartnerLabScore } from '@/src/components/affiliates/partner-lab-score';
import { ModalShell } from '@/src/components/ui/modal-shell';
import { getPartnerLabSortScore } from '@/src/data/affiliates/lab-tests';
import {
  getAffiliateOffers,
  VIAL_TEST_AMOUNTS,
  type VialTestAmount,
} from '@/src/data/affiliates/slots';
import { buildOffersFromPartners } from '@/src/lib/affiliate-offers';
import { cn } from '@/src/lib/utils';
import { usePartnersStore } from '@/src/stores/partners-store';

export type AffiliateModalProps = {
  open: boolean;
  peptideId: string;
  peptideName: string;
  rank: number;
  onClose: () => void;
};

type SortMode = 'test_high' | 'price_low' | 'price_high';

function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

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
  const [selectedSize, setSelectedSize] = useState<VialTestAmount | 'all'>(
    'all',
  );
  const [sortMode, setSortMode] = useState<SortMode>('test_high');

  useEffect(() => {
    if (!open) return;
    setSelectedSize('all');
    setSortMode('test_high');
    if (!loaded) void loadPartners();
  }, [open, peptideId, loaded, loadPartners]);

  const partnerById = useMemo(
    () => new Map(partners.map((partner) => [partner.id, partner])),
    [partners],
  );

  const offers = useMemo(() => {
    if (!open) return [];
    const active = partners.filter((partner) => partner.active);
    if (active.length > 0) {
      return buildOffersFromPartners(active, peptideId);
    }
    return getAffiliateOffers(peptideId);
  }, [open, partners, peptideId]);

  const visibleOffers = useMemo(() => {
    const filtered =
      selectedSize === 'all'
        ? offers
        : offers.filter((offer) => offer.testAmount === selectedSize);

    return [...filtered].sort((a, b) => {
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
  }, [offers, selectedSize, sortMode, partnerById]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      titleId="affiliate-modal-title"
      eyebrow={`Rank #${rank}`}
      title={peptideName}
      description="Filter by vial size and compare partner test amounts"
      className="max-w-xl"
      headerExtra={
        <div className="mt-4 space-y-3">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
              Vial size
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedSize('all')}
                className={cn(
                  'h-8 rounded-[10px] border px-2.5 text-xs font-semibold transition-colors',
                  selectedSize === 'all'
                    ? 'border-accent bg-accent text-white'
                    : 'border-border bg-surface text-foreground-secondary hover:bg-surface-secondary',
                )}
              >
                All
              </button>
              {VIAL_TEST_AMOUNTS.map((size) => {
                const active = selectedSize === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      'h-8 rounded-[10px] border px-2.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-accent bg-accent text-white'
                        : 'border-border bg-surface text-foreground-secondary hover:bg-surface-secondary',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

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
                  { id: 'test_high', label: 'Highest testing' },
                  { id: 'price_low', label: 'Lowest price' },
                  { id: 'price_high', label: 'Highest price' },
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
            <span>Partner · test amount</span>
            <span>
              {visibleOffers.length} result
              {visibleOffers.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      }
      footer="Partner sources and lab scores are managed in Admin. Research use framing only."
    >
      <div className="space-y-2">
        {visibleOffers.length === 0 ? (
          <p className="rounded-[14px] border border-border bg-surface-secondary px-4 py-6 text-center text-sm text-foreground-secondary">
            No partner slots match the selected vial size.
          </p>
        ) : (
          visibleOffers.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-3 rounded-[14px] border border-border bg-surface-secondary px-4 py-3"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {offer.vendorLabel}
                  </p>
                  <PartnerLabScore vendorId={offer.vendorId} />
                </div>
                <span className="mt-1.5 inline-flex rounded-[8px] bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground-secondary ring-1 ring-border">
                  {offer.testAmount}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <p className="font-[family-name:var(--font-display)] text-lg font-semibold tabular-nums text-foreground">
                  {formatUsd(offer.priceUsd)}
                </p>
                <button
                  type="button"
                  className="inline-flex h-8 items-center gap-1.5 rounded-[10px] bg-accent px-3 text-sm font-medium text-white"
                  onClick={() => {
                    if (offer.href && offer.href !== '#') {
                      window.open(offer.href, '_blank', 'noopener,noreferrer');
                    }
                  }}
                >
                  View
                  <ExternalLink className="size-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </ModalShell>
  );
}
