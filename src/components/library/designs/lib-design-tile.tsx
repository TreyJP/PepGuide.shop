'use client';

import Link from 'next/link';

import { LibDesignShell } from '@/src/components/library/designs/lib-design-shell';
import { LibVendorGrid } from '@/src/components/library/designs/lib-vendor-grid';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';

export function LibDesignTile(props: LibraryDesignViewProps) {
  const { loading, peptides, offersById, pricingById } = props;

  return (
    <LibDesignShell {...props} className="lib-card-shell lib-tile">
      {loading ? (
        <p className="lib-card-shell__empty">Loading compounds…</p>
      ) : peptides.length === 0 ? (
        <p className="lib-card-shell__empty">No matches. Try another search.</p>
      ) : (
        <div className="lib-tile__grid">
          {peptides.map((peptide, index) => {
            const pricing = pricingById[peptide.id];
            const offers = offersById[peptide.id] ?? [];
            return (
              <article
                key={peptide.id}
                className="lib-tile__card lib-card-rise"
                style={{ animationDelay: `${Math.min(index, 16) * 28}ms` }}
              >
                <Link href={`/library/${peptide.id}`} className="lib-tile__top">
                  <h2>{peptide.name}</h2>
                  <LibraryFromPrice
                    pricing={pricing}
                    size="sm"
                    className="lib-tile__from"
                  />
                </Link>
                <LibVendorGrid
                  variant="tile"
                  offers={offers}
                  peptideId={peptide.id}
                  peptideName={peptide.name}
                  previewCount={2}
                />
              </article>
            );
          })}
        </div>
      )}
    </LibDesignShell>
  );
}
