'use client';

import Link from 'next/link';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';

export function LibDesignBloom({
  query,
  onQueryChange,
  loading,
  sections,
}: LibraryDesignViewProps) {
  return (
    <div className="lib-bloom">
      <div className="lib-bloom__hero lib-rise">
        <h1>Library</h1>
        <p>Soft research pods grouped under navy category ribbons.</p>
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
            className="lib-bloom__pod lib-rise"
            style={{ animationDelay: `${50 + sectionIndex * 40}ms` }}
          >
            <div className="lib-bloom__ribbon">
              {category}
              <span>
                {items.length} {items.length === 1 ? 'compound' : 'compounds'}
              </span>
            </div>
            <div className="lib-bloom__cloud">
              {items.map((peptide) => (
                <Link
                  key={peptide.id}
                  href={`/library/${peptide.id}`}
                  className="lib-bloom__pill"
                >
                  <h3>{peptide.name}</h3>
                  <p>{peptide.shortDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
