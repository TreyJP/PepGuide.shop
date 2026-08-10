import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  isPreferredPartner,
  sortOffersPreferredFirst,
  TRUSTED_PARTNER_COUPON,
  TRUSTED_PARTNER_DISCOUNT_LABEL,
  TRUSTED_PARTNER_DISCOUNT_PERCENT,
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
  if (isPreferredPartner(partner.id)) return TRUSTED_PARTNER_DISCOUNT_PERCENT;
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
  if (isPreferredPartner(partner.id)) {
    return {
      couponCode: partner.couponCode || TRUSTED_PARTNER_COUPON,
      discountLabel: TRUSTED_PARTNER_DISCOUNT_LABEL,
      discountPercent: TRUSTED_PARTNER_DISCOUNT_PERCENT,
    };
  }
  return {
    couponCode: partner.couponCode || DEFAULT_AFFILIATE_COUPON.code,
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
