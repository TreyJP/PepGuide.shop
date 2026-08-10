'use client';

import { useEffect, useMemo, useState, type ComponentProps } from 'react';

import { LibDesignDeck } from '@/src/components/library/designs/lib-design-deck';
import { LibDesignLedger } from '@/src/components/library/designs/lib-design-ledger';
import { LibDesignMarket } from '@/src/components/library/designs/lib-design-market';
import { LibDesignStack } from '@/src/components/library/designs/lib-design-stack';
import { LibDesignTile } from '@/src/components/library/designs/lib-design-tile';
import '@/src/components/library/library-card-designs.css';
import {
  LIBRARY_DESIGNS,
  type LibraryDesignId,
} from '@/src/constants/library-designs';
import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { buildLibraryPricingMap } from '@/src/lib/library-pricing';
import { peptideRepository } from '@/src/services/firestore/peptides';
import { useLibraryDesignStore } from '@/src/stores/library-design-store';
import { usePartnersStore } from '@/src/stores/partners-store';
import type { Peptide } from '@/src/types';

const QUICK_SEARCHES = [
  { label: 'Reta', query: 'reta' },
  { label: 'Tirz', query: 'tirz' },
  { label: 'Sema', query: 'sema' },
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

function DesignView({
  designId,
  ...props
}: {
  designId: LibraryDesignId;
} & ComponentProps<typeof LibDesignDeck>) {
  switch (designId) {
    case 'market':
      return <LibDesignMarket {...props} />;
    case 'stack':
      return <LibDesignStack {...props} />;
    case 'tile':
      return <LibDesignTile {...props} />;
    case 'ledger':
      return <LibDesignLedger {...props} />;
    case 'deck':
    default:
      return <LibDesignDeck {...props} />;
  }
}

export function LibraryWorkspace() {
  const designId = useLibraryDesignStore((state) => state.designId);
  const setDesignId = useLibraryDesignStore((state) => state.setDesignId);

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

  const resolvedDesignId = LIBRARY_DESIGNS.some(
    (design) => design.id === designId,
  )
    ? designId
    : 'deck';

  const activeBlurb =
    LIBRARY_DESIGNS.find((design) => design.id === resolvedDesignId)?.blurb ??
    '';

  return (
    <div className="lib-card-root">
      <div className="lib-card-picker">
        <label>
          Design
          <select
            value={resolvedDesignId}
            onChange={(event) =>
              setDesignId(event.target.value as LibraryDesignId)
            }
            aria-label="All peptides page design"
          >
            {LIBRARY_DESIGNS.map((design) => (
              <option key={design.id} value={design.id}>
                {design.label}
              </option>
            ))}
          </select>
        </label>
        <span>{activeBlurb}</span>
      </div>

      <div className="lib-card-scroll">
        <DesignView
          key={resolvedDesignId}
          designId={resolvedDesignId}
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
