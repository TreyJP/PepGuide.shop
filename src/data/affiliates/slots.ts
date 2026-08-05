import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  NEUROLABS_CATALOG,
  NEUROLABS_PARTNER,
} from '@/src/data/affiliates/neurolabs-catalog';
import {
  SOMACHEMS_CATALOG,
  SOMACHEMS_PARTNER,
} from '@/src/data/affiliates/somachems-catalog';
import type { PartnerProduct } from '@/src/types/affiliates';

export type AffiliateOffer = {
  id: string;
  vendorId: string;
  vendorLabel: string;
  /** Optional SKU / product title from a real catalog. */
  productName?: string;
  testAmount: string;
  priceUsd: number;
  priceMaxUsd?: number | null;
  href: string;
  couponCode: string;
  discountLabel: string;
};

/** Common peptide vial / test sizes (legacy filter chips). */
export const VIAL_TEST_AMOUNTS = [
  '2 mg',
  '5 mg',
  '10 mg',
  '15 mg',
  '20 mg',
  '30 mg',
] as const;

export type VialTestAmount = (typeof VIAL_TEST_AMOUNTS)[number];

export function parseTestAmountMg(testAmount: string): number {
  const match = testAmount.match(/([\d.]+)/);
  return match ? Number(match[1]) : 0;
}

type OfflineCatalog = {
  id: string;
  label: string;
  href: string;
  products: PartnerProduct[];
};

const OFFLINE_CATALOGS: OfflineCatalog[] = [
  {
    id: SOMACHEMS_PARTNER.id,
    label: SOMACHEMS_PARTNER.label,
    href: SOMACHEMS_PARTNER.href,
    products: SOMACHEMS_CATALOG,
  },
  {
    id: NEUROLABS_PARTNER.id,
    label: NEUROLABS_PARTNER.label,
    href: NEUROLABS_PARTNER.href,
    products: NEUROLABS_CATALOG,
  },
];

/** Keep one row per partner — cheapest listing only (no vial-size variants). */
export function pickLowestOffersByVendor(
  offers: AffiliateOffer[],
): AffiliateOffer[] {
  const byVendor = new Map<string, AffiliateOffer>();
  for (const offer of offers) {
    const existing = byVendor.get(offer.vendorId);
    if (!existing || offer.priceUsd < existing.priceUsd) {
      byVendor.set(offer.vendorId, {
        ...offer,
        // Show a single lowest price for now (ignore vial ranges).
        priceMaxUsd: null,
      });
    }
  }
  return [...byVendor.values()].sort((a, b) => a.priceUsd - b.priceUsd);
}

/** Offline fallback from seeded partner catalogs when partners haven’t loaded. */
export function getAffiliateOffers(peptideId: string): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];

  for (const catalog of OFFLINE_CATALOGS) {
    for (const product of catalog.products) {
      if (!product.peptideIds.includes(peptideId) || product.priceUsd == null) {
        continue;
      }
      offers.push({
        id: `${peptideId}-${catalog.id}-${product.id}`,
        vendorId: catalog.id,
        vendorLabel: catalog.label,
        productName: product.name,
        testAmount: product.testAmount?.trim() || 'Standard',
        priceUsd: product.priceUsd,
        priceMaxUsd: null,
        href: product.href || catalog.href,
        couponCode: DEFAULT_AFFILIATE_COUPON.code,
        discountLabel: DEFAULT_AFFILIATE_COUPON.discountLabel,
      });
    }
  }

  return pickLowestOffersByVendor(offers);
}

export function getLowestAffiliatePrice(peptideId: string): number | null {
  const offers = getAffiliateOffers(peptideId);
  if (offers.length === 0) return null;
  return offers[0]!.priceUsd;
}

export function formatAffiliateUsd(
  amount: number,
  _priceMaxUsd?: number | null,
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
