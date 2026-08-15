import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  getTrustedPartnerDiscount,
  isPreferredPartner,
  sortOffersPreferredFirst,
  TRUSTED_PARTNER_COUPON,
  withTrustedPartnerOfferFields,
} from '@/src/data/affiliates/preferred-partners';
import {
  getAffiliateOffers,
  getAllAffiliateOffers,
  pickLowestOffersByVendor,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
import {
  getOfferSalePriceUsd,
  parseDiscountPercent,
} from '@/src/lib/offer-pricing';
import type { AffiliatePartner } from '@/src/types/affiliates';

function partnerDiscountPercent(partner: AffiliatePartner): number {
  const trusted = getTrustedPartnerDiscount(partner.id, partner.label);
  if (trusted) return trusted.percent;
  return (
    parseDiscountPercent(partner.discountLabel) ||
    DEFAULT_AFFILIATE_COUPON.discountPercent
  );
}

function partnerCouponFields(partner: AffiliatePartner): {
  couponCode: string;
  discountLabel: string;
  discountPercent: number;
} {
  const trusted = getTrustedPartnerDiscount(partner.id, partner.label);
  if (trusted) {
    return {
      couponCode: TRUSTED_PARTNER_COUPON,
      discountLabel: trusted.label,
      discountPercent: trusted.percent,
    };
  }
  const code = (partner.couponCode ?? '').trim();
  // Empty string means "no copyable coupon" (e.g. Elytra aff-link tracking).
  if (!code) {
    return {
      couponCode: '',
      discountLabel: (partner.discountLabel ?? '').trim(),
      discountPercent: 0,
    };
  }
  return {
    // PepGuide partner codes are always PEPGUIDE (normalize case / variants).
    couponCode: DEFAULT_AFFILIATE_COUPON.code,
    discountLabel:
      partner.discountLabel || DEFAULT_AFFILIATE_COUPON.discountLabel,
    discountPercent: partnerDiscountPercent(partner),
  };
}

/**
 * Resolve offers for a compound.
 * When partners are loaded from admin/Firestore, only `active` vendors are shown
 * (even if every vendor is hidden → empty list). Offline catalogs are used
 * only as a bootstrapping fallback when no partners exist yet.
 */
export function resolvePartnerOffers(
  partners: AffiliatePartner[],
  peptideId: string,
  mode: 'lowestPerVendor' | 'allSkus' = 'lowestPerVendor',
): AffiliateOffer[] {
  if (partners.length > 0) {
    return mode === 'allSkus'
      ? buildAllOffersFromPartners(partners, peptideId)
      : buildOffersFromPartners(partners, peptideId);
  }
  return mode === 'allSkus'
    ? getAllAffiliateOffers(peptideId)
    : getAffiliateOffers(peptideId);
}

function collectOffersFromPartners(
  partners: AffiliatePartner[],
  peptideId: string,
): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];

  for (const partner of partners.filter((item) => item.active)) {
    const products = (partner.products ?? []).filter((product) =>
      product.peptideIds.includes(peptideId),
    );

    if (products.length > 0) {
      for (const product of products) {
        if (product.priceUsd == null) continue;
        // Prefer the product page URL so View always opens that SKU.
        const href = product.href?.trim() || partner.href || '#';
        const coupon = partnerCouponFields(partner);
        offers.push(
          withTrustedPartnerOfferFields({
            id: `${peptideId}-${partner.id}-${product.id}`,
            vendorId: partner.id,
            vendorLabel: partner.label,
            productName: product.name,
            testAmount: product.testAmount?.trim() || 'Standard',
            priceUsd: product.priceUsd,
            priceMaxUsd: null,
            href,
            ...coupon,
          }),
        );
      }
      continue;
    }

    // Legacy fallback: pick cheapest enabled size as the partner's price.
    for (const amount of partner.testAmounts ?? []) {
      if (amount.priceUsd <= 0) continue;
      const coupon = partnerCouponFields(partner);
      offers.push(
        withTrustedPartnerOfferFields({
          id: `${peptideId}-${partner.id}-${amount.testAmount.replace(/\s+/g, '-')}`,
          vendorId: partner.id,
          vendorLabel: partner.label,
          testAmount: amount.testAmount,
          priceUsd: amount.priceUsd,
          priceMaxUsd: null,
          href: partner.href || '#',
          ...coupon,
        }),
      );
    }
  }

  return offers;
}

/** Build modal offer rows from admin-managed partners (lowest price per partner). */
export function buildOffersFromPartners(
  partners: AffiliatePartner[],
  peptideId: string,
): AffiliateOffer[] {
  return pickLowestOffersByVendor(
    collectOffersFromPartners(partners, peptideId),
  );
}

/** Every matching SKU from every active partner — preferred first, then price. */
export function buildAllOffersFromPartners(
  partners: AffiliatePartner[],
  peptideId: string,
): AffiliateOffer[] {
  return sortOffersPreferredFirst(collectOffersFromPartners(partners, peptideId));
}

export function getLowestPartnerPrice(
  partners: AffiliatePartner[],
  peptideId: string,
): number | null {
  const offers = buildOffersFromPartners(partners, peptideId);
  if (offers.length === 0) return null;
  return Math.min(...offers.map((offer) => getOfferSalePriceUsd(offer)));
}

export type VendorOfferGroup = {
  vendorId: string;
  vendorLabel: string;
  couponCode: string;
  discountLabel: string;
  discountPercent?: number;
  /** Size / SKU rows for this vendor, cheapest first. */
  sizes: AffiliateOffer[];
  /** Cheapest sale price across sizes (for “Lowest” badges). */
  lowestSalePriceUsd: number;
  /** Highest sale price across sizes (for unlabeled price ranges). */
  highestSalePriceUsd: number;
  /**
   * True when at least one SKU has a real size label (e.g. "10 mg").
   * When false, UI should show a single low–high price range instead of
   * repeating generic "Standard" rows.
   */
  hasKnownSizes: boolean;
};

/** True when the label looks like a real vial / dose size. */
export function isKnownSizeLabel(
  testAmount: string | null | undefined,
): boolean {
  const label = (testAmount || '').trim();
  if (!label) return false;
  if (/^(standard|default|n\/?a|—|--|-|size|vial)$/i.test(label)) return false;
  return /\d/.test(label);
}

function vendorHasKnownSizes(sizes: AffiliateOffer[]): boolean {
  return sizes.some((offer) => isKnownSizeLabel(offer.testAmount));
}

/** Collapse SKU rows into one group per vendor, sizes sorted cheap → expensive. */
export function groupOffersByVendor(
  offers: AffiliateOffer[],
): VendorOfferGroup[] {
  const byVendor = new Map<string, AffiliateOffer[]>();
  for (const offer of offers) {
    const list = byVendor.get(offer.vendorId) ?? [];
    list.push(offer);
    byVendor.set(offer.vendorId, list);
  }

  const groups: VendorOfferGroup[] = [];
  for (const sizes of byVendor.values()) {
    const sorted = [...sizes].sort((a, b) => {
      const saleDiff = getOfferSalePriceUsd(a) - getOfferSalePriceUsd(b);
      if (saleDiff !== 0) return saleDiff;
      return a.testAmount.localeCompare(b.testAmount, undefined, {
        numeric: true,
      });
    });
    const primary = sorted[0];
    const last = sorted[sorted.length - 1];
    if (!primary || !last) continue;
    groups.push({
      vendorId: primary.vendorId,
      vendorLabel: primary.vendorLabel,
      couponCode: primary.couponCode,
      discountLabel: primary.discountLabel,
      discountPercent: primary.discountPercent,
      sizes: sorted,
      lowestSalePriceUsd: getOfferSalePriceUsd(primary),
      highestSalePriceUsd: getOfferSalePriceUsd(last),
      hasKnownSizes: vendorHasKnownSizes(sorted),
    });
  }

  return groups.sort((a, b) => {
    const aPreferred = isPreferredPartner(a.vendorId, a.vendorLabel) ? 0 : 1;
    const bPreferred = isPreferredPartner(b.vendorId, b.vendorLabel) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;
    if (a.lowestSalePriceUsd !== b.lowestSalePriceUsd) {
      return a.lowestSalePriceUsd - b.lowestSalePriceUsd;
    }
    return a.vendorLabel.localeCompare(b.vendorLabel);
  });
}

