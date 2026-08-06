'use client';

import Link from 'next/link';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';
import { evidenceLabel } from '@/src/lib/evidence';

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function LibDesignSpecimen({
  query,
  onQueryChange,
  loading,
  sections,
}: LibraryDesignViewProps) {
  return (
    <div className="lib-specimen">
      <div className="lib-specimen__hero lib-rise">
        <h1>Library</h1>
        <p>Specimen plates for each research compound — quiet, clear, archival.</p>
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
            className="lib-specimen__section lib-rise"
            style={{ animationDelay: `${50 + sectionIndex * 40}ms` }}
          >
            <h2>{category}</h2>
            <div className="lib-specimen__grid">
              {items.map((peptide) => (
                <Link
                  key={peptide.id}
                  href={`/library/${peptide.id}`}
                  className="lib-specimen__plate"
                >
                  <header>
                    <div>
                      <h3>{peptide.name}</h3>
                      {peptide.aliases[0] ? (
                        <div className="alias">{peptide.aliases[0]}</div>
                      ) : null}
                    </div>
                    <span className="lib-mono">{initial(peptide.name)}</span>
                  </header>
                  <p>{peptide.shortDescription}</p>
                  <div className="lib-specimen__caption">
                    {evidenceLabel(peptide.humanEvidenceGrade)}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
