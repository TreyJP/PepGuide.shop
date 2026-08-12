'use client';

import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { isKnownSizeLabel } from '@/src/lib/affiliate-offers';
import { formatOfferPriceParts } from '@/src/lib/offer-pricing';
import { cn } from '@/src/lib/utils';

export function OfferPrice({
  offer,
  className,
  size = 'md',
}: {
  offer: AffiliateOffer;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const parts = formatOfferPriceParts(offer);

  if (!parts.hasDiscount) {
    return (
      <span
        className={cn(
          'font-[family-name:var(--font-display)] font-semibold tabular-nums text-foreground',
          size === 'sm' ? 'text-sm' : 'text-base',
          className,
        )}
      >
        {parts.listLabel}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'lib-offer-price inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5',
        className,
      )}
    >
      <span
        className={cn(
          'lib-offer-price__sale font-[family-name:var(--font-display)] font-semibold tabular-nums',
          size === 'sm' ? 'text-sm' : 'text-base',
        )}
      >
        {parts.saleLabel}
      </span>
      <span
        className={cn(
          'lib-offer-price__list font-semibold tabular-nums text-foreground-secondary line-through decoration-foreground-secondary/80',
          size === 'sm' ? 'text-[0.7rem]' : 'text-xs',
        )}
      >
        {parts.listLabel}
      </span>
      <span
        className={cn(
          'lib-offer-price__badge rounded-[5px] px-1 py-0.5 font-bold uppercase tracking-[0.04em]',
          parts.discountPercent >= 30
            ? 'bg-teal-700/12 text-teal-800'
            : 'bg-accent-muted text-accent',
          size === 'sm' ? 'text-[0.58rem]' : 'text-[0.62rem]',
        )}
      >
        -{parts.discountPercent}%
      </span>
    </span>
  );
}

/** Compact size caption for stacked price layouts (avoids inline clipping). */
export function OfferSizeLabel({
  offer,
  className,
}: {
  offer: Pick<AffiliateOffer, 'testAmount'>;
  className?: string;
}) {
  if (!isKnownSizeLabel(offer.testAmount)) return null;
  return (
    <span className={cn('offer-size-label', className)}>
      {offer.testAmount.trim()}
    </span>
  );
}
