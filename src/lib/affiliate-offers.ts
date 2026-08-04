import type { AffiliateOffer } from '@/src/data/affiliates/slots';
import type { AffiliatePartner } from '@/src/types/affiliates';

/** Build modal offer rows from admin-managed partners. */
export function buildOffersFromPartners(
  partners: AffiliatePartner[],
  peptideId: string,
): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];

  for (const partner of partners.filter((item) => item.active)) {
    for (const amount of partner.testAmounts) {
      offers.push({
        id: `${peptideId}-${partner.id}-${amount.testAmount.replace(/\s+/g, '-')}`,
        vendorId: partner.id,
        vendorLabel: partner.label,
        testAmount: amount.testAmount,
        priceUsd: amount.priceUsd,
        href: partner.href || '#',
      });
    }
  }

  return offers.sort((a, b) => a.priceUsd - b.priceUsd);
}
