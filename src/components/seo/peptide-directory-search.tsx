'use client';

import { useMemo, useState } from 'react';

type PeptideOption = {
  id: string;
  name: string;
  summary: string;
  categoryLabel: string;
};

export function PeptideDirectorySearch({ peptides }: { peptides: PeptideOption[] }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return peptides.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.id.includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q),
    );
  }, [peptides, query]);

  return (
    <div className="mb-8 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <label htmlFor="peptide-search" className="block text-sm font-medium text-foreground">
        Search the directory
      </label>
      <input
        id="peptide-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="e.g. BPC-157, GHK-Cu, metabolic…"
        className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none ring-accent focus:ring-2"
        autoComplete="off"
      />
      {query.trim() ? (
        <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm">
          {filtered.length === 0 ? (
            <li className="text-foreground-secondary">No matches. Browse categories below.</li>
          ) : (
            filtered.map((p) => (
              <li key={p.id}>
                <a href={`/peptides/${p.id}`} className="text-accent hover:underline">
                  {p.name}
                </a>
                <span className="text-foreground-secondary"> · {p.categoryLabel}</span>
              </li>
            ))
          )}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-foreground-secondary">
          Jump to a peptide below — every profile is linked in plain HTML for discovery.
        </p>
      )}
    </div>
  );
}
