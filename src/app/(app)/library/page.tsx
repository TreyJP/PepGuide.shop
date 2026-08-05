'use client';

import Link from 'next/link';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/src/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { LIBRARY_CATEGORY_ORDER } from '@/src/data/peptides';
import { evidenceLabel, evidenceTone } from '@/src/lib/evidence';
import { peptideRepository } from '@/src/services/firestore/peptides';
import type { Peptide } from '@/src/types';

function categorySortIndex(category: string): number {
  const index = LIBRARY_CATEGORY_ORDER.indexOf(category);
  return index === -1 ? LIBRARY_CATEGORY_ORDER.length : index;
}

export default function LibraryPage() {
  const [query, setQuery] = useState('');
  const [peptides, setPeptides] = useState<Peptide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      setLoading(true);
      const results = await peptideRepository.list();
      setPeptides(results);
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return peptides;
    return peptides.filter(
      (peptide) =>
        peptide.name.toLowerCase().includes(normalized) ||
        peptide.aliases.some((alias) => alias.toLowerCase().includes(normalized)) ||
        peptide.shortDescription.toLowerCase().includes(normalized) ||
        peptide.researchCategories.some((category) =>
          category.toLowerCase().includes(normalized),
        ),
    );
  }, [peptides, query]);

  const grouped = useMemo(() => {
    const sections = new Map<string, Peptide[]>();

    for (const peptide of filtered) {
      const categories =
        peptide.researchCategories.length > 0
          ? peptide.researchCategories
          : ['General research'];

      // Place each peptide under its primary function category.
      const primary = [...categories].sort(
        (a, b) => categorySortIndex(a) - categorySortIndex(b),
      )[0]!;

      const list = sections.get(primary) ?? [];
      list.push(peptide);
      sections.set(primary, list);
    }

    return [...sections.entries()]
      .sort(([a], [b]) => categorySortIndex(a) - categorySortIndex(b))
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filtered]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Library
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Browse peptides by what they are researched for.
        </p>
        <div className="relative mt-4 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search peptides, aliases, categories…"
            className="pl-10"
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <p className="text-foreground-secondary">Loading library…</p>
        ) : grouped.length === 0 ? (
          <p className="text-foreground-secondary">No peptides matched your search.</p>
        ) : (
          <div className="space-y-10">
            {grouped.map(({ category, items }) => (
              <section key={category} className="space-y-4">
                <div className="flex items-baseline justify-between gap-3 border-b border-border pb-2">
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
                    {category}
                  </h2>
                  <span className="text-xs text-foreground-secondary">
                    {items.length} {items.length === 1 ? 'compound' : 'compounds'}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {items.map((peptide) => (
                    <Card key={peptide.id} className="flex flex-col">
                      <CardHeader>
                        <CardTitle>{peptide.name}</CardTitle>
                        <CardDescription>{peptide.shortDescription}</CardDescription>
                      </CardHeader>
                      <CardContent className="mt-auto space-y-4">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant={evidenceTone(peptide.humanEvidenceGrade)}>
                            {evidenceLabel(peptide.humanEvidenceGrade)}
                          </Badge>
                          {peptide.researchCategories
                            .filter((item) => item !== category)
                            .slice(0, 2)
                            .map((item) => (
                              <Badge key={item} variant="muted">
                                {item}
                              </Badge>
                            ))}
                        </div>
                        <Link
                          href={`/library/${peptide.id}`}
                          className="text-sm font-medium text-accent hover:underline"
                        >
                          View profile
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
