'use client';

import { OfferPrice } from '@/src/components/affiliates/offer-price';
import type { LibraryPricingInfo } from '@/src/components/library/designs/types';
import { formatAffiliateUsd } from '@/src/data/affiliates/slots';
import { cn } from '@/src/lib/utils';

export function LibraryFromPrice({
  pricing,
  className,
  size = 'sm',
  prefix,
  emptyLabel = 'View',
}: {
  pricing?: LibraryPricingInfo;
  className?: string;
  size?: 'sm' | 'md';
  prefix?: string;
  emptyLabel?: string;
}) {
  if (!pricing?.fromOffer && pricing?.fromPriceUsd == null) {
    return (
      <span className={cn('text-foreground-secondary', className)}>
        {emptyLabel}
      </span>
    );
  }

  if (pricing.fromOffer) {
    return (
      <span className={cn('inline-flex flex-wrap items-baseline gap-1', className)}>
        {prefix ? (
          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-foreground-secondary">
            {prefix}
          </span>
        ) : null}
        <OfferPrice offer={pricing.fromOffer} size={size} />
      </span>
    );
  }

  return (
    <span className={cn('inline-flex items-baseline gap-1', className)}>
      {prefix ? (
        <span className="text-[0.68rem] font-semibold uppercase tracking-[0.06em] text-foreground-secondary">
          {prefix}
        </span>
      ) : null}
      <span
        className={cn(
          'font-[family-name:var(--font-display)] font-semibold tabular-nums text-foreground',
          size === 'sm' ? 'text-sm' : 'text-base',
        )}
      >
        {formatAffiliateUsd(pricing.fromPriceUsd!)}
      </span>
    </span>
  );
}
