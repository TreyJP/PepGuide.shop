import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  NEUROLABS_CATALOG,
  NEUROLABS_PARTNER,
} from '@/src/data/affiliates/neurolabs-catalog';
import {
  PRISTINE_PEPTIDE_CATALOG,
  PRISTINE_PEPTIDE_PARTNER,
} from '@/src/data/affiliates/pristine-peptide-catalog';
import {
  sortOffersPreferredFirst,
  withTrustedPartnerOfferFields,
} from '@/src/data/affiliates/preferred-partners';
import {
  REFINED_BIOLABS_CATALOG,
  REFINED_BIOLABS_PARTNER,
} from '@/src/data/affiliates/refined-biolabs-catalog';
import {
  SOMACHEMS_CATALOG,
  SOMACHEMS_PARTNER,
} from '@/src/data/affiliates/somachems-catalog';
import {
  VITALCHEMS_CATALOG,
  VITALCHEMS_PARTNER,
} from '@/src/data/affiliates/vitalchems-catalog';
import {
  ELYTRA_LABS_CATALOG,
  ELYTRA_LABS_PARTNER,
} from '@/src/data/affiliates/elytra-labs-catalog';
import {
  AMP_PEPTIDES_CATALOG,
  AMP_PEPTIDES_PARTNER,
} from '@/src/data/affiliates/amp-peptides-catalog';
import {
  ALASKA_LABS_CATALOG,
  ALASKA_LABS_PARTNER,
} from '@/src/data/affiliates/alaska-labs-catalog';
import { getOfferSalePriceUsd } from '@/src/lib/offer-pricing';
import type { PartnerProduct } from '@/src/types/affiliates';

export type AffiliateOffer = {
  id: string;
  vendorId: string;
  vendorLabel: string;
  /** Optional SKU / product title from a real catalog. */
  productName?: string;
  testAmount: string;
  /** List / catalog price before coupon. */
  priceUsd: number;
  priceMaxUsd?: number | null;
  href: string;
  couponCode: string;
  discountLabel: string;
  /** Numeric coupon percent used for sale-price display. */
  discountPercent?: number;
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
  couponCode: string;
  discountLabel: string;
  discountPercent?: number;
  products: PartnerProduct[];
};

const OFFLINE_CATALOGS: OfflineCatalog[] = [
  {
    id: REFINED_BIOLABS_PARTNER.id,
    label: REFINED_BIOLABS_PARTNER.label,
    href: REFINED_BIOLABS_PARTNER.href,
    couponCode: REFINED_BIOLABS_PARTNER.couponCode,
    discountLabel: REFINED_BIOLABS_PARTNER.discountLabel,
    discountPercent: REFINED_BIOLABS_PARTNER.discountPercent,
    products: REFINED_BIOLABS_CATALOG,
  },
  {
    id: SOMACHEMS_PARTNER.id,
    label: SOMACHEMS_PARTNER.label,
    href: SOMACHEMS_PARTNER.href,
    couponCode: SOMACHEMS_PARTNER.couponCode,
    discountLabel: SOMACHEMS_PARTNER.discountLabel,
    discountPercent: 10,
    products: SOMACHEMS_CATALOG,
  },
  {
    id: NEUROLABS_PARTNER.id,
    label: NEUROLABS_PARTNER.label,
    href: NEUROLABS_PARTNER.href,
    couponCode: NEUROLABS_PARTNER.couponCode,
    discountLabel: NEUROLABS_PARTNER.discountLabel,
    discountPercent: 10,
    products: NEUROLABS_CATALOG,
  },
  {
    id: PRISTINE_PEPTIDE_PARTNER.id,
    label: PRISTINE_PEPTIDE_PARTNER.label,
    href: PRISTINE_PEPTIDE_PARTNER.href,
    couponCode: PRISTINE_PEPTIDE_PARTNER.couponCode,
    discountLabel: PRISTINE_PEPTIDE_PARTNER.discountLabel,
    discountPercent: 10,
    products: PRISTINE_PEPTIDE_CATALOG,
  },
  {
    id: VITALCHEMS_PARTNER.id,
    label: VITALCHEMS_PARTNER.label,
    href: VITALCHEMS_PARTNER.href,
    couponCode: VITALCHEMS_PARTNER.couponCode,
    discountLabel: VITALCHEMS_PARTNER.discountLabel,
    discountPercent: VITALCHEMS_PARTNER.discountPercent,
    products: VITALCHEMS_CATALOG,
  },
  {
    id: ELYTRA_LABS_PARTNER.id,
    label: ELYTRA_LABS_PARTNER.label,
    href: ELYTRA_LABS_PARTNER.href,
    couponCode: ELYTRA_LABS_PARTNER.couponCode,
    discountLabel: ELYTRA_LABS_PARTNER.discountLabel,
    discountPercent: ELYTRA_LABS_PARTNER.discountPercent,
    products: ELYTRA_LABS_CATALOG,
  },
  {
    id: AMP_PEPTIDES_PARTNER.id,
    label: AMP_PEPTIDES_PARTNER.label,
    href: AMP_PEPTIDES_PARTNER.href,
    couponCode: AMP_PEPTIDES_PARTNER.couponCode,
    discountLabel: AMP_PEPTIDES_PARTNER.discountLabel,
    discountPercent: AMP_PEPTIDES_PARTNER.discountPercent,
    products: AMP_PEPTIDES_CATALOG,
  },
  {
    id: ALASKA_LABS_PARTNER.id,
    label: ALASKA_LABS_PARTNER.label,
    href: ALASKA_LABS_PARTNER.href,
    couponCode: ALASKA_LABS_PARTNER.couponCode,
    discountLabel: ALASKA_LABS_PARTNER.discountLabel,
    discountPercent: ALASKA_LABS_PARTNER.discountPercent,
    products: ALASKA_LABS_CATALOG,
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
  return sortOffersPreferredFirst([...byVendor.values()]);
}

function collectOfflineOffers(peptideId: string): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];

  for (const catalog of OFFLINE_CATALOGS) {
    for (const product of catalog.products) {
      if (!product.peptideIds.includes(peptideId) || product.priceUsd == null) {
        continue;
      }
      offers.push(
        withTrustedPartnerOfferFields({
          id: `${peptideId}-${catalog.id}-${product.id}`,
          vendorId: catalog.id,
          vendorLabel: catalog.label,
          productName: product.name,
          testAmount: product.testAmount?.trim() || 'Standard',
          priceUsd: product.priceUsd,
          priceMaxUsd: null,
          href: product.href || catalog.href,
          ...offlineCouponFields(catalog),
        }),
      );
    }
  }

  return offers;
}

function offlineCouponFields(catalog: OfflineCatalog): {
  couponCode: string;
  discountLabel: string;
  discountPercent: number;
} {
  const code = (catalog.couponCode ?? '').trim();
  if (!code) {
    return {
      couponCode: '',
      discountLabel: (catalog.discountLabel ?? '').trim(),
      discountPercent: 0,
    };
  }
  return {
    couponCode: DEFAULT_AFFILIATE_COUPON.code,
    discountLabel:
      catalog.discountLabel || DEFAULT_AFFILIATE_COUPON.discountLabel,
    discountPercent:
      catalog.discountPercent ?? DEFAULT_AFFILIATE_COUPON.discountPercent,
  };
}

/** Offline fallback — one lowest-priced listing per partner. */
export function getAffiliateOffers(peptideId: string): AffiliateOffer[] {
  return pickLowestOffersByVendor(collectOfflineOffers(peptideId));
}

/** Offline fallback — preferred partner first, then cheapest. */
export function getAllAffiliateOffers(peptideId: string): AffiliateOffer[] {
  return sortOffersPreferredFirst(collectOfflineOffers(peptideId));
}

export function getLowestAffiliatePrice(peptideId: string): number | null {
  const offers = getAffiliateOffers(peptideId);
  if (offers.length === 0) return null;
  return Math.min(...offers.map((offer) => getOfferSalePriceUsd(offer)));
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
