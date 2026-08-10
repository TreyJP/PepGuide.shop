'use client';

import { LibraryFromPrice } from '@/src/components/library/library-from-price';
import type { LibraryPricingInfo } from '@/src/components/library/designs/types';

export function LibraryPriceChip({
  pricing,
}: {
  pricing?: LibraryPricingInfo;
}) {
  if (!pricing || pricing.fromPriceUsd == null) {
    return (
      <span className="lib-price-chip lib-price-chip--empty">No partner price</span>
    );
  }

  return (
    <span className="lib-price-chip">
      <span className="lib-price-chip__from">From</span>
      <LibraryFromPrice pricing={pricing} size="sm" />
      {pricing.vendorCount > 0 ? (
        <span className="lib-price-chip__vendors">
          {pricing.vendorCount} vendor{pricing.vendorCount === 1 ? '' : 's'}
        </span>
      ) : null}
    </span>
  );
}
