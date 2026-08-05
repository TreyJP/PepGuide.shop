import { DEFAULT_AFFILIATE_COUPON } from '@/src/constants/affiliates';
import {
  pickLowestOffersByVendor,
  type AffiliateOffer,
} from '@/src/data/affiliates/slots';
import type { AffiliatePartner } from '@/src/types/affiliates';

/** Build modal offer rows from admin-managed partners (lowest price per partner). */
export function buildOffersFromPartners(
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
        offers.push({
          id: `${peptideId}-${partner.id}-${product.id}`,
          vendorId: partner.id,
          vendorLabel: partner.label,
          productName: product.name,
          testAmount: product.testAmount?.trim() || 'Standard',
          priceUsd: product.priceUsd,
          priceMaxUsd: null,
          href,
          couponCode: partner.couponCode || DEFAULT_AFFILIATE_COUPON.code,
          discountLabel:
            partner.discountLabel || DEFAULT_AFFILIATE_COUPON.discountLabel,
        });
      }
      continue;
    }

    // Legacy fallback: pick cheapest enabled size as the partner's price.
    for (const amount of partner.testAmounts ?? []) {
      if (amount.priceUsd <= 0) continue;
      offers.push({
        id: `${peptideId}-${partner.id}-${amount.testAmount.replace(/\s+/g, '-')}`,
        vendorId: partner.id,
        vendorLabel: partner.label,
        testAmount: amount.testAmount,
        priceUsd: amount.priceUsd,
        priceMaxUsd: null,
        href: partner.href || '#',
        couponCode: partner.couponCode || DEFAULT_AFFILIATE_COUPON.code,
        discountLabel:
          partner.discountLabel || DEFAULT_AFFILIATE_COUPON.discountLabel,
      });
    }
  }

  return pickLowestOffersByVendor(offers);
}

export function getLowestPartnerPrice(
  partners: AffiliatePartner[],
  peptideId: string,
): number | null {
  const offers = buildOffersFromPartners(partners, peptideId);
  if (offers.length === 0) return null;
  return offers[0]!.priceUsd;
}
