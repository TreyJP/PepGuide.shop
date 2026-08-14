import type { AffiliateOffer } from '@/src/data/affiliates/slots';

/** PepGuide trusted partners — pinned first + Trusted Source badge. */
export const PREFERRED_PARTNER_ID = 'refined-biolabs';

export const TRUSTED_PARTNER_IDS = new Set([
  PREFERRED_PARTNER_ID,
  'alaska-labs',
]);

export const TRUSTED_PARTNER_DISCOUNT_PERCENT = 20;
export const TRUSTED_PARTNER_DISCOUNT_LABEL = '20% off';
export const TRUSTED_PARTNER_COUPON = 'PEPGUIDE';

export function isPreferredPartner(
  vendorId: string | null | undefined,
  vendorLabel?: string | null,
): boolean {
  const id = (vendorId ?? '').trim().toLowerCase();
  if (TRUSTED_PARTNER_IDS.has(id)) return true;
  if (id.includes('refined') || id.includes('alaska')) return true;
  const label = (vendorLabel ?? '').trim().toLowerCase();
  return (
    label.includes('refined biolabs') ||
    label === 'refined' ||
    label.includes('alaska labs') ||
    label === 'alaskalabs'
  );
}

/** Force trusted-partner coupon/discount even if Firestore still has old values. */
export function withTrustedPartnerOfferFields<
  T extends {
    vendorId: string;
    vendorLabel?: string;
    couponCode: string;
    discountLabel: string;
    discountPercent?: number;
  },
>(offer: T): T {
  if (!isPreferredPartner(offer.vendorId, offer.vendorLabel)) return offer;
  return {
    ...offer,
    couponCode: offer.couponCode || TRUSTED_PARTNER_COUPON,
    discountLabel: TRUSTED_PARTNER_DISCOUNT_LABEL,
    discountPercent: TRUSTED_PARTNER_DISCOUNT_PERCENT,
  };
}

/** Preferred vendors first, then ascending list price. */
export function sortOffersPreferredFirst(
  offers: AffiliateOffer[],
): AffiliateOffer[] {
  return [...offers].sort((a, b) => {
    const aPreferred = isPreferredPartner(a.vendorId, a.vendorLabel) ? 0 : 1;
    const bPreferred = isPreferredPartner(b.vendorId, b.vendorLabel) ? 0 : 1;
    if (aPreferred !== bPreferred) return aPreferred - bPreferred;
    if (a.priceUsd !== b.priceUsd) return a.priceUsd - b.priceUsd;
    return a.vendorLabel.localeCompare(b.vendorLabel);
  });
}
