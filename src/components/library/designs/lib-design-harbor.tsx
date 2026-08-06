'use client';

import Link from 'next/link';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { evidenceLabel } from '@/src/lib/evidence';

export function LibDesignHarbor({
  query,
  onQueryChange,
  loading,
  sections,
}: LibraryDesignViewProps) {
  return (
    <div className="lib-harbor">
      <div className="lib-harbor__hero lib-rise">
        <h1>Research library</h1>
        <p>Wide, calm compound bands — built for scanning, not clutter.</p>
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
            className="lib-harbor__section lib-rise"
            style={{ animationDelay: `${40 + sectionIndex * 35}ms` }}
          >
            <h2>{category}</h2>
            {items.map((peptide) => (
              <Link
                key={peptide.id}
                href={`/library/${peptide.id}`}
                className="lib-harbor__band"
              >
                <h3>{peptide.name}</h3>
                <p>{peptide.shortDescription}</p>
                <div className="lib-harbor__meta">
                  <span>{evidenceLabel(peptide.humanEvidenceGrade)}</span>
                  {peptide.aliases.slice(0, 1).map((alias) => (
                    <span key={alias}>{alias}</span>
                  ))}
                </div>
              </Link>
            ))}
          </section>
        ))
      )}
    </div>
  );
}
