'use client';

import {
  OfferPrice,
  OfferSizeLabel,
} from '@/src/components/affiliates/offer-price';
import type { LibraryPricingInfo } from '@/src/components/library/designs/types';
import { formatAffiliateUsd } from '@/src/data/affiliates/slots';
import { cn } from '@/src/lib/utils';

export function LibraryFromPrice({
  pricing,
  className,
  size = 'sm',
  prefix,
  emptyLabel = 'View',
  showSize = true,
}: {
  pricing?: LibraryPricingInfo;
  className?: string;
  size?: 'sm' | 'md';
  prefix?: string;
  emptyLabel?: string;
  /** Show vial size on its own line under the price. */
  showSize?: boolean;
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
      <span className={cn('lib-from-price', className)}>
        {prefix ? (
          <span className="lib-from-price__prefix">{prefix}</span>
        ) : null}
        <OfferPrice offer={pricing.fromOffer} size={size} />
        {showSize ? (
          <OfferSizeLabel
            offer={pricing.fromOffer}
            className="lib-from-price__size"
          />
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn('lib-from-price', className)}>
      {prefix ? <span className="lib-from-price__prefix">{prefix}</span> : null}
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
