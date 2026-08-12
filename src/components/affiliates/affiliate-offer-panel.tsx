'use client';

import { ExternalLink } from 'lucide-react';
import { useEffect, useMemo } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  OfferPrice,
  OfferSizeLabel,
} from '@/src/components/affiliates/offer-price';
import { formatAffiliateUsd } from '@/src/data/affiliates/slots';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { getOfferSalePriceUsd } from '@/src/lib/offer-pricing';
import { cn } from '@/src/lib/utils';
import { trackAnalyticsEvent } from '@/src/services/firestore/analytics';
import { usePartnersStore } from '@/src/stores/partners-store';

export type AffiliateOfferPanelProps = {
  peptideId: string;
  peptideName: string;
  rank: number;
  reason?: string;
  onExpand?: () => void;
  className?: string;
};

export function AffiliateOfferPanel({
  peptideId,
  peptideName,
  rank,
  reason,
  onExpand,
  className,
}: AffiliateOfferPanelProps) {
  const partners = usePartnersStore((state) => state.partners);
  const loaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);

  useEffect(() => {
    if (!loaded) void loadPartners();
  }, [loaded, loadPartners]);

  const offers = useMemo(
    () => resolvePartnerOffers(partners, peptideId, 'lowestPerVendor'),
    [partners, peptideId],
  );
  const cheapestOffer =
    offers.length > 0
      ? offers.reduce((best, offer) =>
          getOfferSalePriceUsd(offer) < getOfferSalePriceUsd(best)
            ? offer
            : best,
        )
      : null;
  const fromPrice =
    cheapestOffer != null ? getOfferSalePriceUsd(cheapestOffer) : null;
  const featured = rank === 1;

  return (
    <div
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[20px] border bg-surface shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-transform duration-200 hover:-translate-y-0.5',
        featured
          ? 'border-accent/40 ring-1 ring-accent/20'
          : 'border-border',
        className,
      )}
    >
      <button
        type="button"
        onClick={onExpand}
        className={cn(
          'relative w-full px-4 pb-3 pt-4 text-left transition-colors',
          featured
            ? 'bg-[linear-gradient(160deg,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_70%)] hover:bg-accent-muted/25'
            : 'bg-surface-secondary/40 hover:bg-surface-secondary/70',
          onExpand && 'cursor-pointer',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className={cn(
              'inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold',
              featured
                ? 'bg-accent text-white'
                : 'bg-surface text-foreground-secondary ring-1 ring-border',
            )}
          >
            #{rank}
          </span>
          {fromPrice != null && cheapestOffer ? (
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.14em] text-foreground-secondary">
                From
              </p>
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-foreground">
                {formatAffiliateUsd(fromPrice)}
              </p>
              <OfferSizeLabel
                offer={cheapestOffer}
                className="mt-0.5 block text-[11px] font-semibold text-foreground-secondary"
              />
            </div>
          ) : null}
        </div>

        <h3 className="mt-3 font-[family-name:var(--font-display)] text-[1.35rem] font-semibold leading-tight tracking-tight text-foreground">
          {peptideName}
        </h3>
        {reason ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground-secondary">
            {reason}
          </p>
        ) : null}
        {onExpand ? (
          <p className="mt-2 text-xs font-semibold text-accent">Open pricing →</p>
        ) : null}
      </button>

      <div className="flex items-center justify-between border-y border-border px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-foreground-secondary">
        <span>Partner</span>
        <span>Lowest price</span>
      </div>

      <div className="scrollbar-theme min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {offers.length === 0 ? (
          <p className="px-1 py-3 text-center text-sm text-foreground-secondary">
            No visible vendors for this compound.
          </p>
        ) : (
          offers.map((offer) => (
            <div
              key={offer.id}
              className="flex items-center justify-between gap-3 rounded-[14px] border border-transparent bg-surface-secondary/55 px-3 py-2.5 transition-colors hover:border-border hover:bg-surface"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {offer.vendorLabel}
                </p>
                {offer.productName ? (
                  <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                    {offer.productName}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="text-right">
                  <OfferPrice offer={offer} size="sm" />
                  <OfferSizeLabel
                    offer={offer}
                    className="mt-0.5 block text-[10px] font-semibold text-foreground-secondary"
                  />
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="size-8 shrink-0 p-0"
                  onClick={(event) => {
                    event.stopPropagation();
                    void trackAnalyticsEvent({
                      name: 'affiliate_click',
                      meta: {
                        partnerId: offer.vendorId,
                        partnerLabel: offer.vendorLabel,
                        peptideId,
                        peptideName,
                        productName: offer.productName ?? null,
                        href: offer.href,
                        priceUsd: offer.priceUsd,
                      },
                    });
                    if (offer.href && offer.href !== '#') {
                      window.open(offer.href, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  aria-label={`View ${offer.vendorLabel}`}
                >
                  <ExternalLink className="size-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {onExpand ? (
        <div className="border-t border-border p-3">
          <Button
            size="sm"
            variant={featured ? 'primary' : 'secondary'}
            className="w-full"
            onClick={(event) => {
              event.stopPropagation();
              onExpand();
            }}
          >
            Compare all options
          </Button>
        </div>
      ) : null}
    </div>
  );
}
