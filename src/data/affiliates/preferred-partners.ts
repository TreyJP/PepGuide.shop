import type { AffiliateOffer } from '@/src/data/affiliates/slots';

/** PepGuide trusted partners — pinned first + Trusted Source badge. */
export const PREFERRED_PARTNER_ID = 'refined-biolabs';

export const TRUSTED_PARTNER_IDS = new Set([
  PREFERRED_PARTNER_ID,
  'alaska-labs',
]);

/** Default trusted discount (Refined). Alaska uses its own percent below. */
export const TRUSTED_PARTNER_DISCOUNT_PERCENT = 20;
export const TRUSTED_PARTNER_DISCOUNT_LABEL = '20% off';
export const TRUSTED_PARTNER_COUPON = 'PEPGUIDE';

const TRUSTED_PARTNER_DISCOUNTS: Record<
  string,
  { percent: number; label: string }
> = {
  'refined-biolabs': { percent: 20, label: '20% off' },
  'alaska-labs': { percent: 30, label: '30% off' },
};

function trustedPartnerKey(
  vendorId: string | null | undefined,
  vendorLabel?: string | null,
): string | null {
  const id = (vendorId ?? '').trim().toLowerCase();
  if (TRUSTED_PARTNER_IDS.has(id)) return id;
  if (id.includes('alaska') || (vendorLabel ?? '').toLowerCase().includes('alaska')) {
    return 'alaska-labs';
  }
  if (id.includes('refined') || (vendorLabel ?? '').toLowerCase().includes('refined')) {
    return 'refined-biolabs';
  }
  return null;
}

export function getTrustedPartnerDiscount(vendorId: string | null | undefined, vendorLabel?: string | null): {
  percent: number;
  label: string;
} | null {
  const key = trustedPartnerKey(vendorId, vendorLabel);
  if (!key) return null;
  return (
    TRUSTED_PARTNER_DISCOUNTS[key] ?? {
      percent: TRUSTED_PARTNER_DISCOUNT_PERCENT,
      label: TRUSTED_PARTNER_DISCOUNT_LABEL,
    }
  );
}

export function isPreferredPartner(
  vendorId: string | null | undefined,
  vendorLabel?: string | null,
): boolean {
  return trustedPartnerKey(vendorId, vendorLabel) != null;
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
  const trusted = getTrustedPartnerDiscount(offer.vendorId, offer.vendorLabel);
  if (!trusted) return offer;
  return {
    ...offer,
    couponCode: offer.couponCode || TRUSTED_PARTNER_COUPON,
    discountLabel: trusted.label,
    discountPercent: trusted.percent,
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
