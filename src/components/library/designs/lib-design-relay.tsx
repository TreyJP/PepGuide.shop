'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function LibDesignRelay({
  query,
  onQueryChange,
  loading,
  sections,
}: LibraryDesignViewProps) {
  const categories = useMemo(
    () => sections.map((section) => section.category),
    [sections],
  );
  const [active, setActive] = useState(categories[0] ?? '');

  useEffect(() => {
    if (!categories.includes(active)) {
      setActive(categories[0] ?? '');
    }
  }, [active, categories]);

  const items =
    sections.find((section) => section.category === active)?.items ??
    sections[0]?.items ??
    [];

  return (
    <div className="lib-relay">
      <div className="lib-relay__top lib-rise">
        <h1>Library</h1>
        <p>Pick a research lane, then open a compound.</p>
        <LibSearch value={query} onChange={onQueryChange} />
      </div>

      {loading ? (
        <p className="lib-empty">Loading library…</p>
      ) : sections.length === 0 ? (
        <p className="lib-empty">No peptides matched your search.</p>
      ) : (
        <div className="lib-relay__body">
          <nav className="lib-relay__nav" aria-label="Research categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                data-active={category === active}
                onClick={() => setActive(category)}
              >
                {category}
              </button>
            ))}
          </nav>
          <div className="lib-relay__stream">
            {items.map((peptide, index) => (
              <Link
                key={peptide.id}
                href={`/library/${peptide.id}`}
                className="lib-relay__item lib-rise"
                style={{ animationDelay: `${40 + index * 30}ms` }}
              >
                <span className="lib-mono">{initial(peptide.name)}</span>
                <div className="min-w-0">
                  <h3>{peptide.name}</h3>
                  <p>{peptide.shortDescription}</p>
                </div>
                <span className="lib-relay__go">Open</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
