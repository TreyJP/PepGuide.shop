'use client';

import Link from 'next/link';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';

export function LibDesignKinetic({
  query,
  onQueryChange,
  loading,
  sections,
}: LibraryDesignViewProps) {
  return (
    <div className="lib-kinetic">
      <div className="lib-kinetic__hero lib-rise">
        <div>
          <h1>Library</h1>
          <p>Bold category watermarks with a dense compound grid on top.</p>
        </div>
        <LibSearch value={query} onChange={onQueryChange} />
      </div>

      {loading ? (
        <p className="lib-empty">Loading library…</p>
      ) : sections.length === 0 ? (
        <p className="lib-empty">No peptides matched your search.</p>
      ) : (
        sections.map(({ category, items }, sectionIndex) => (
          <section
            key={category}
            className="lib-kinetic__section lib-rise"
            style={{ animationDelay: `${45 + sectionIndex * 40}ms` }}
          >
            <div className="lib-kinetic__watermark" aria-hidden>
              {category}
            </div>
            <div className="lib-kinetic__grid">
              {items.map((peptide) => (
                <Link
                  key={peptide.id}
                  href={`/library/${peptide.id}`}
                  className="lib-kinetic__card"
                >
                  <div>
                    <h3>{peptide.name}</h3>
                    <p>{peptide.shortDescription}</p>
                  </div>
                  <footer>View profile →</footer>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
