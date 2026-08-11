'use client';

import Link from 'next/link';

import { LibDesignShell } from '@/src/components/library/designs/lib-design-shell';
import { LibVendorGrid } from '@/src/components/library/designs/lib-vendor-grid';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';

export function LibDesignDeck(props: LibraryDesignViewProps) {
  const { loading, peptides, offersById, pricingById } = props;

  return (
    <LibDesignShell {...props} className="lib-card-shell lib-deck">
      {loading ? (
        <p className="lib-card-shell__empty">Loading compounds…</p>
      ) : peptides.length === 0 ? (
        <p className="lib-card-shell__empty">No matches. Try another search.</p>
      ) : (
        <div className="lib-deck__grid">
          {peptides.map((peptide, index) => {
            const pricing = pricingById[peptide.id];
            const offers = offersById[peptide.id] ?? [];
            return (
              <article
                key={peptide.id}
                className="lib-deck__card lib-card-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}
              >
                <Link href={`/library/${peptide.id}`} className="lib-deck__top">
                  <div>
                    <h2>{peptide.name}</h2>
                    {peptide.aliases[0] ? <p>{peptide.aliases[0]}</p> : null}
                  </div>
                  <div className="lib-deck__from">
                    {pricing?.fromPriceUsd != null ? (
                      <>
                        <span>From</span>
                        <LibraryFromPrice pricing={pricing} size="sm" />
                      </>
                    ) : (
                      <strong>Compare</strong>
                    )}
                  </div>
                </Link>
                <LibVendorGrid
                  variant="deck"
                  offers={offers}
                  peptideId={peptide.id}
                  peptideName={peptide.name}
                  previewCount={1}
                />
              </article>
            );
          })}
        </div>
      )}
    </LibDesignShell>
  );
}
