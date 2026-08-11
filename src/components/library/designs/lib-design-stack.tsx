'use client';

import Link from 'next/link';

import { LibDesignShell } from '@/src/components/library/designs/lib-design-shell';
import { LibVendorGrid } from '@/src/components/library/designs/lib-vendor-grid';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { LibraryFromPrice } from '@/src/components/library/library-from-price';

export function LibDesignStack(props: LibraryDesignViewProps) {
  const { loading, peptides, offersById, pricingById } = props;

  return (
    <LibDesignShell {...props} className="lib-card-shell lib-stack">
      {loading ? (
        <p className="lib-card-shell__empty">Loading compounds…</p>
      ) : peptides.length === 0 ? (
        <p className="lib-card-shell__empty">No matches. Try another search.</p>
      ) : (
        <div className="lib-stack__list">
          {peptides.map((peptide, index) => {
            const pricing = pricingById[peptide.id];
            const offers = offersById[peptide.id] ?? [];
            return (
              <article
                key={peptide.id}
                className="lib-stack__card lib-card-rise"
                style={{ animationDelay: `${Math.min(index, 12) * 30}ms` }}
              >
                <div className="lib-stack__head">
                  <Link href={`/library/${peptide.id}`}>
                    <h2>{peptide.name}</h2>
                    {peptide.aliases[0] ? <p>{peptide.aliases[0]}</p> : null}
                  </Link>
                  <div className="lib-stack__meta">
                    {pricing?.fromPriceUsd != null ? (
                      <LibraryFromPrice pricing={pricing} size="md" />
                    ) : (
                      <strong>—</strong>
                    )}
                    <span>
                      {pricing?.vendorCount ?? 0} vendor
                      {(pricing?.vendorCount ?? 0) === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>
                <LibVendorGrid
                  variant="stack"
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
