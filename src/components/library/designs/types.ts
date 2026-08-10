import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import type { Peptide } from '@/src/types';

export type LibraryPricingInfo = {
  /** Lowest effective price (sale price when trusted discount applies). */
  fromPriceUsd: number | null;
  /** Offer that produced the lowest effective price (for slash/sale UI). */
  fromOffer: AffiliateOffer | null;
  vendorCount: number;
  listingCount: number;
};

export type LibraryDesignViewProps = {
  query: string;
  onQueryChange: (value: string) => void;
  loading: boolean;
  peptides: Peptide[];
  totalCount: number;
  offersById: Record<string, AffiliateOffer[]>;
  pricingById: Record<string, LibraryPricingInfo>;
  quickSearches: ReadonlyArray<{ label: string; query: string }>;
};
