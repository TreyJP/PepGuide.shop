import { getTrustedPartnerDiscount } from '@/src/data/affiliates/preferred-partners';
import { formatAffiliateUsd, type AffiliateOffer } from '@/src/data/affiliates/slots';

export function parseDiscountPercent(discountLabel: string | null | undefined): number {
  if (!discountLabel) return 0;
  const match = discountLabel.match(/(\d+)\s*%/);
  return match ? Number(match[1]) : 0;
}

type DiscountableOffer = Pick<
  AffiliateOffer,
  'priceUsd' | 'discountLabel' | 'discountPercent'
> & {
  vendorId?: string;
  vendorLabel?: string;
};

export function getOfferDiscountPercent(offer: DiscountableOffer): number {
  const trusted = getTrustedPartnerDiscount(offer.vendorId, offer.vendorLabel);
  if (trusted) return trusted.percent;
  if (typeof offer.discountPercent === 'number' && offer.discountPercent > 0) {
    return offer.discountPercent;
  }
  return parseDiscountPercent(offer.discountLabel);
}

export function getSalePriceUsd(
  listPriceUsd: number,
  discountPercent: number,
): number {
  if (discountPercent <= 0) return listPriceUsd;
  // Round to cents: e.g. $39.99 at 30% off → $27.99
  return Math.round((listPriceUsd * (100 - discountPercent)) / 100 * 100) / 100;
}

export function getOfferSalePriceUsd(offer: DiscountableOffer): number {
  return getSalePriceUsd(offer.priceUsd, getOfferDiscountPercent(offer));
}

export function formatOfferPriceParts(offer: AffiliateOffer): {
  listPriceUsd: number;
  salePriceUsd: number;
  discountPercent: number;
  hasDiscount: boolean;
  listLabel: string;
  saleLabel: string;
} {
  const discountPercent = getOfferDiscountPercent(offer);
  const salePriceUsd = getSalePriceUsd(offer.priceUsd, discountPercent);
  return {
    listPriceUsd: offer.priceUsd,
    salePriceUsd,
    discountPercent,
    hasDiscount: discountPercent > 0 && salePriceUsd < offer.priceUsd,
    listLabel: formatAffiliateUsd(offer.priceUsd),
    saleLabel: formatAffiliateUsd(salePriceUsd),
  };
}
