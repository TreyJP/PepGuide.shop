'use client';

import { useEffect, useMemo } from 'react';

import { PartnerSlotList } from '@/src/components/affiliates/partner-slot-layouts';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { usePartnersStore } from '@/src/stores/partners-store';

type LibraryCompetitorPricesProps = {
  peptideId: string;
  peptideName: string;
};

/** Full vendor price board for Library lookup. */
export function LibraryCompetitorPrices({
  peptideId,
  peptideName,
}: LibraryCompetitorPricesProps) {
  const partners = usePartnersStore((state) => state.partners);
  const loaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);

  useEffect(() => {
    if (!loaded) void loadPartners();
  }, [loaded, loadPartners]);

  const offers = useMemo(
    () => resolvePartnerOffers(partners, peptideId, 'allSkus'),
    [partners, peptideId],
  );

  const vendorCount = useMemo(
    () => new Set(offers.map((offer) => offer.vendorId)).size,
    [offers],
  );

  return (
    <section className="rounded-[16px] border border-border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[-0.02em] text-foreground">
            Vendor prices
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            All PepGuide partner listings for {peptideName}. Copy the coupon
            before checkout.
          </p>
        </div>
        <p className="text-xs font-semibold text-foreground-secondary">
          {offers.length} listing{offers.length === 1 ? '' : 's'}
          {vendorCount > 0
            ? ` · ${vendorCount} vendor${vendorCount === 1 ? '' : 's'}`
            : ''}
        </p>
      </div>

      <div className="mt-4">
        <PartnerSlotList
          offers={offers}
          peptideId={peptideId}
          peptideName={peptideName}
        />
      </div>
    </section>
  );
}
