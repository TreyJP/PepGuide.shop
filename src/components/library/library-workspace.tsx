'use client';

import { useEffect, useMemo, useState } from 'react';

import { LibDesignTile } from '@/src/components/library/designs/lib-design-tile';
import '@/src/components/library/library-card-designs.css';
import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { COMING_SOON_PEPTIDES } from '@/src/data/coming-soon-peptides';
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

function compactKey(value: string): string {
  return value.replace(/[^a-z0-9]+/gi, '').toLowerCase();
}

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

function comingSoonStub(entry: (typeof COMING_SOON_PEPTIDES)[number]): Peptide {
  return {
    id: entry.id,
    name: entry.name,
    aliases: entry.aliases ?? [],
    classification: 'Coming soon',
    shortDescription: 'Catalog page coming soon.',
    researchOverview: '',
    proposedMechanism: '',
    researchCategories: [],
    humanEvidenceGrade: 'insufficient',
    preclinicalEvidenceGrade: 'insufficient',
    regulatoryStatus: 'unknown',
    studiedRoutes: [],
    humanEvidenceSummary: '',
    animalEvidenceSummary: '',
    invitroEvidenceSummary: '',
    knownAdverseEffects: [],
    reportedAdverseEffects: [],
    contraindicationCategories: [],
    interactionCategories: [],
    risks: [],
    uncertainties: [],
    ongoingTrials: [],
    references: [],
    lastReviewedAt: '',
    reviewStatus: 'draft',
    comingSoon: true,
  };
}

/** Live listing already covers this coming-soon row (same id/name/alias). */
function isCoveredByLive(
  entry: (typeof COMING_SOON_PEPTIDES)[number],
  live: Peptide[],
): boolean {
  const keys = new Set(
    [entry.id, entry.name, ...(entry.aliases ?? [])]
      .map(compactKey)
      .filter(Boolean),
  );
  return live.some((peptide) => {
    const peptideKeys = [peptide.id, peptide.name, ...peptide.aliases].map(
      compactKey,
    );
    return peptideKeys.some((key) => keys.has(key));
  });
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

  const livePeptides = useMemo(() => {
    return peptides
      .filter((peptide) => (offersById[peptide.id]?.length ?? 0) > 0)
      .filter((peptide) => matchesQuery(peptide, query));
  }, [peptides, query, offersById]);

  const comingSoonPeptides = useMemo(() => {
    return COMING_SOON_PEPTIDES.filter(
      (entry) => !isCoveredByLive(entry, livePeptides),
    )
      .map(comingSoonStub)
      .filter((peptide) => matchesQuery(peptide, query));
  }, [livePeptides, query]);

  const filtered = useMemo(() => {
    const byName = (a: Peptide, b: Peptide) => a.name.localeCompare(b.name);
    return [
      ...[...livePeptides].sort(byName),
      ...[...comingSoonPeptides].sort(byName),
    ];
  }, [livePeptides, comingSoonPeptides]);

  const pricingById = useMemo(
    () =>
      buildLibraryPricingMap(
        livePeptides.map((peptide) => peptide.id),
        partners,
      ),
    [livePeptides, partners],
  );

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
