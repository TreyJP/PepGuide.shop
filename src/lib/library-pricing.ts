import type { LibraryPricingInfo } from '@/src/components/library/designs/types';
import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import { resolvePartnerOffers } from '@/src/lib/affiliate-offers';
import { getOfferSalePriceUsd } from '@/src/lib/offer-pricing';
import type { AffiliatePartner } from '@/src/types/affiliates';

export function getLibraryPricingForId(
  peptideId: string,
  partners: AffiliatePartner[],
): LibraryPricingInfo {
  const offers = resolvePartnerOffers(partners, peptideId, 'lowestPerVendor');

  if (offers.length === 0) {
    return {
      fromPriceUsd: null,
      fromOffer: null,
      vendorCount: 0,
      listingCount: 0,
    };
  }

  let fromOffer: AffiliateOffer = offers[0]!;
  let fromPriceUsd = getOfferSalePriceUsd(fromOffer);
  for (const offer of offers.slice(1)) {
    const price = getOfferSalePriceUsd(offer);
    if (price < fromPriceUsd) {
      fromPriceUsd = price;
      fromOffer = offer;
    }
  }

  return {
    fromPriceUsd,
    fromOffer,
    vendorCount: new Set(offers.map((offer) => offer.vendorId)).size,
    listingCount: offers.length,
  };
}

export function buildLibraryPricingMap(
  peptideIds: string[],
  partners: AffiliatePartner[],
): Record<string, LibraryPricingInfo> {
  const map: Record<string, LibraryPricingInfo> = {};
  for (const id of peptideIds) {
    map[id] = getLibraryPricingForId(id, partners);
  }
  return map;
}
