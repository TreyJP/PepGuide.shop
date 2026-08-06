'use client';

import { useEffect, useMemo, useState, type ComponentProps } from 'react';

import '@/src/components/library/library-designs.css';
import { LibDesignBloom } from '@/src/components/library/designs/lib-design-bloom';
import { LibDesignHarbor } from '@/src/components/library/designs/lib-design-harbor';
import { LibDesignKinetic } from '@/src/components/library/designs/lib-design-kinetic';
import { LibDesignRelay } from '@/src/components/library/designs/lib-design-relay';
import { LibDesignSpecimen } from '@/src/components/library/designs/lib-design-specimen';
import {
  LIBRARY_DESIGNS,
  type LibraryDesignId,
} from '@/src/constants/library-designs';
import { LIBRARY_CATEGORY_ORDER } from '@/src/data/peptides';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { useLibraryDesignStore } from '@/src/stores/library-design-store';
import type { Peptide } from '@/src/types';

function categorySortIndex(category: string): number {
  const index = LIBRARY_CATEGORY_ORDER.indexOf(category);
  return index === -1 ? LIBRARY_CATEGORY_ORDER.length : index;
}

function DesignView({
  designId,
  ...props
}: {
  designId: LibraryDesignId;
} & ComponentProps<typeof LibDesignRelay>) {
  switch (designId) {
    case 'specimen':
      return <LibDesignSpecimen {...props} />;
    case 'harbor':
      return <LibDesignHarbor {...props} />;
    case 'kinetic':
      return <LibDesignKinetic {...props} />;
    case 'bloom':
      return <LibDesignBloom {...props} />;
    case 'relay':
    default:
      return <LibDesignRelay {...props} />;
  }
}

export function LibraryWorkspace() {
  const designId = useLibraryDesignStore((state) => state.designId);
  const setDesignId = useLibraryDesignStore((state) => state.setDesignId);

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
        peptide.aliases.some((alias) =>
          alias.toLowerCase().includes(normalized),
        ) ||
        peptide.shortDescription.toLowerCase().includes(normalized) ||
        peptide.researchCategories.some((category) =>
          category.toLowerCase().includes(normalized),
        ),
    );
  }, [peptides, query]);

  const sections = useMemo(() => {
    const map = new Map<string, Peptide[]>();

    for (const peptide of filtered) {
      const categories =
        peptide.researchCategories.length > 0
          ? peptide.researchCategories
          : ['General research'];
      const primary = [...categories].sort(
        (a, b) => categorySortIndex(a) - categorySortIndex(b),
      )[0]!;
      const list = map.get(primary) ?? [];
      list.push(peptide);
      map.set(primary, list);
    }

    return [...map.entries()]
      .sort(([a], [b]) => categorySortIndex(a) - categorySortIndex(b))
      .map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [filtered]);

  const resolvedDesignId = LIBRARY_DESIGNS.some(
    (design) => design.id === designId,
  )
    ? designId
    : 'relay';

  const activeBlurb =
    LIBRARY_DESIGNS.find((design) => design.id === resolvedDesignId)?.blurb ??
    '';

  return (
    <div className="lib-root">
      <div className="lib-picker-bar">
        <label>
          Design
          <select
            value={resolvedDesignId}
            onChange={(event) =>
              setDesignId(event.target.value as LibraryDesignId)
            }
            aria-label="Library page design"
          >
            {LIBRARY_DESIGNS.map((design) => (
              <option key={design.id} value={design.id}>
                {design.label}
              </option>
            ))}
          </select>
        </label>
        <span className="max-w-sm text-right text-xs text-foreground-secondary">
          {activeBlurb}
        </span>
      </div>

      <div className="lib-scroll">
        <DesignView
          key={resolvedDesignId}
          designId={resolvedDesignId}
          query={query}
          onQueryChange={setQuery}
          loading={loading}
          sections={sections}
          totalCount={filtered.length}
        />
      </div>
    </div>
  );
}
