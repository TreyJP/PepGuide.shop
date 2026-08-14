'use client';

import type { ReactNode } from 'react';

import { LibSearch } from '@/src/components/library/designs/lib-search';
import type { LibraryDesignViewProps } from '@/src/components/library/designs/types';

export function LibDesignShell({
  query,
  onQueryChange,
  totalCount,
  loading,
  quickSearches,
  children,
  className,
}: LibraryDesignViewProps & {
  children: ReactNode;
  className: string;
}) {
  return (
    <div className={className}>
      <header className="lib-card-shell__header">
        <div className="lib-card-shell__intro">
          <h1>All peptides</h1>
          <p>Compounds with vendor pricing — compare options in each card.</p>
        </div>
        <div className="lib-card-shell__search">
          <LibSearch
            value={query}
            onChange={onQueryChange}
            placeholder="Search peptides (GL3RT, bpc, GL2TZ…)"
          />
        </div>
        <div className="lib-card-shell__chips" aria-label="Quick searches">
          {quickSearches.map((item) => (
            <button
              key={item.query}
              type="button"
              data-active={query.toLowerCase() === item.query}
              onClick={() => onQueryChange(item.query)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="lib-card-shell__toolbar">
          <p>
            {loading
              ? 'Loading…'
              : `${totalCount} compound${totalCount === 1 ? '' : 's'} with vendors`}
          </p>
        </div>
      </header>
      {children}
    </div>
  );
}
