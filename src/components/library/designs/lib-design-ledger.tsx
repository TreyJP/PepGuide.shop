'use client';

import Link from 'next/link';

import { LibDesignShell } from '@/src/components/library/designs/lib-design-shell';
import { LibVendorGrid } from '@/src/components/library/designs/lib-vendor-grid';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';

export function LibDesignLedger(props: LibraryDesignViewProps) {
  const { loading, peptides, offersById, pricingById } = props;

  return (
    <LibDesignShell {...props} className="lib-card-shell lib-ledger">
      {loading ? (
        <p className="lib-card-shell__empty">Loading compounds…</p>
      ) : peptides.length === 0 ? (
        <p className="lib-card-shell__empty">No matches. Try another search.</p>
      ) : (
        <div className="lib-ledger__list">
          {peptides.map((peptide, index) => {
            const pricing = pricingById[peptide.id];
            const offers = offersById[peptide.id] ?? [];
            return (
              <article
                key={peptide.id}
                className="lib-ledger__card lib-card-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
              >
                <header className="lib-ledger__head">
                  <Link href={`/library/${peptide.id}`}>
                    <h2>{peptide.name}</h2>
                    {peptide.aliases[0] ? (
                      <p className="lib-ledger__alias">{peptide.aliases[0]}</p>
                    ) : null}
                  </Link>
                  <div className="lib-ledger__summary">
                    <span>Lowest</span>
                    <LibraryFromPrice pricing={pricing} size="md" />
                  </div>
                </header>
                <div className="lib-ledger__board">
                  <div className="lib-ledger__cols">
                    <span>Vendor</span>
                    <span>Offer</span>
                    <span>Price</span>
                  </div>
                  <LibVendorGrid
                    variant="ledger"
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
