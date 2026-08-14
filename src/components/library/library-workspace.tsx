'use client';

import { useEffect, useMemo, useState } from 'react';

import { LibDesignTile } from '@/src/components/library/designs/lib-design-tile';
import '@/src/components/library/library-card-designs.css';
import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { buildLibraryPricingMap } from '@/src/lib/library-pricing';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { usePartnersStore } from '@/src/stores/partners-store';
import type { Peptide } from '@/src/types';

const QUICK_SEARCHES = [
  { label: 'GL3RT', query: 'gl3rt' },
  { label: 'GL2TZ', query: 'gl2tz' },
  { label: 'GL1SM', query: 'gl1sm' },
  { label: 'BPC', query: 'bpc' },
  { label: 'Cag', query: 'cag' },
  { label: 'TB-500', query: 'tb-500' },
] as const;

function matchesQuery(peptide: Peptide, query: string): boolean {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  const compactQuery = normalized.replace(/[^a-z0-9]+/g, '');
  const compactId = peptide.id.replace(/[^a-z0-9]+/gi, '').toLowerCase();
  return (
    peptide.id.toLowerCase().includes(normalized) ||
    (compactQuery.length >= 2 && compactId.includes(compactQuery)) ||
    peptide.name.toLowerCase().includes(normalized) ||
    peptide.aliases.some((alias) => alias.toLowerCase().includes(normalized)) ||
    peptide.shortDescription.toLowerCase().includes(normalized)
  );
}

export function LibraryWorkspace() {
  const partners = usePartnersStore((state) => state.partners);
  const partnersLoaded = usePartnersStore((state) => state.loaded);
  const loadPartners = usePartnersStore((state) => state.loadPartners);

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

  useEffect(() => {
    if (!partnersLoaded) void loadPartners();
  }, [partnersLoaded, loadPartners]);

  const pricingById = useMemo(
    () =>
      buildLibraryPricingMap(
        peptides.map((peptide) => peptide.id),
        partners,
      ),
    [peptides, partners],
  );

  const offersById = useMemo(() => {
    const map: Record<string, AffiliateOffer[]> = {};
    for (const peptide of peptides) {
      map[peptide.id] = resolvePartnerOffers(
        partners,
        peptide.id,
        'lowestPerVendor',
      );
    }
    return map;
  }, [peptides, partners]);

  const filtered = useMemo(() => {
    return peptides
      .filter((peptide) => (offersById[peptide.id]?.length ?? 0) > 0)
      .filter((peptide) => matchesQuery(peptide, query))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [peptides, query, offersById]);

  return (
    <div className="lib-card-root">
      <div className="lib-card-scroll">
        <LibDesignTile
          query={query}
          onQueryChange={setQuery}
          loading={loading}
          peptides={filtered}
          totalCount={filtered.length}
          offersById={offersById}
          pricingById={pricingById}
          quickSearches={QUICK_SEARCHES}
        />
      </div>
    </div>
  );
}
