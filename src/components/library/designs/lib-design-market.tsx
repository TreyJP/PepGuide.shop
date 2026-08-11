'use client';

import Link from 'next/link';

import { LibDesignShell } from '@/src/components/library/designs/lib-design-shell';
import { LibVendorGrid } from '@/src/components/library/designs/lib-vendor-grid';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';

export function LibDesignMarket(props: LibraryDesignViewProps) {
  const { loading, peptides, offersById, pricingById } = props;

  return (
    <LibDesignShell {...props} className="lib-card-shell lib-market">
      {loading ? (
        <p className="lib-card-shell__empty">Loading compounds…</p>
      ) : peptides.length === 0 ? (
        <p className="lib-card-shell__empty">No matches. Try another search.</p>
      ) : (
        <div className="lib-market__grid">
          {peptides.map((peptide, index) => {
            const pricing = pricingById[peptide.id];
            const offers = offersById[peptide.id] ?? [];
            return (
              <article
                key={peptide.id}
                className="lib-market__card lib-card-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
              >
                <Link href={`/library/${peptide.id}`} className="lib-market__banner">
                  <div className="lib-market__badge">
                    {pricing?.vendorCount ?? 0} vendors
                  </div>
                  <h2>{peptide.name}</h2>
                  {pricing?.fromPriceUsd != null ? (
                    <div className="lib-market__price">
                      <LibraryFromPrice
                        pricing={pricing}
                        size="sm"
                        prefix="from"
                        className="lib-market__from-price"
                      />
                    </div>
                  ) : (
                    <p className="lib-market__price">Open for options</p>
                  )}
                </Link>
                <div className="lib-market__body">
                  <p className="lib-market__label">Vendor grid</p>
                  <LibVendorGrid
                    variant="market"
                    offers={offers}
                    peptideId={peptide.id}
                    peptideName={peptide.name}
                    previewCount={1}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </LibDesignShell>
  );
}
