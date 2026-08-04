export type AffiliateVendorSlot = {
  id: string;
  label: string;
  /** Placeholder until real affiliate partners are wired. */
  placeholder: true;
};

export type AffiliateOffer = {
  id: string;
  vendorId: string;
  vendorLabel: string;
  testAmount: string;
  priceUsd: number;
  /** Placeholder affiliate destination. */
  href: string;
};

export type PeptideAffiliateListing = {
  peptideId: string;
  offers: AffiliateOffer[];
};

export const AFFILIATE_VENDOR_SLOTS: AffiliateVendorSlot[] = [
  { id: 'slot-a', label: 'Partner Slot A', placeholder: true },
  { id: 'slot-b', label: 'Partner Slot B', placeholder: true },
  { id: 'slot-c', label: 'Partner Slot C', placeholder: true },
  { id: 'slot-d', label: 'Partner Slot D', placeholder: true },
];

/** Common peptide vial / test sizes shown in the partner modal. */
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

function buildOffers(
  peptideId: string,
  basePrice: number,
): AffiliateOffer[] {
  const offers: AffiliateOffer[] = [];
  let index = 0;

  for (const vendor of AFFILIATE_VENDOR_SLOTS) {
    for (const [amountIndex, testAmount] of VIAL_TEST_AMOUNTS.entries()) {
      const multiplier = 1 + amountIndex * 0.55 + (index % 3) * 0.08;
      const priceUsd = Math.round(basePrice * multiplier);
      offers.push({
        id: `${peptideId}-${vendor.id}-${testAmount.replace(/\s+/g, '-')}`,
        vendorId: vendor.id,
        vendorLabel: vendor.label,
        testAmount,
        priceUsd,
        href: '#',
      });
    }
    index += 1;
  }

  return offers.sort((a, b) => a.priceUsd - b.priceUsd);
}

const BASE_PRICES: Record<string, number> = {
  retatrutide: 89,
  tirzepatide: 79,
  semaglutide: 69,
  cagrilintide: 74,
  mazdutide: 72,
  survodutide: 76,
  orforglipron: 64,
  amycretin: 82,
  tesamorelin: 58,
  tesofensine: 42,
  'mots-c': 48,
  '5-amino-1mq': 36,
  'aod-9604': 34,
  'bpc-157': 39,
  'tb-500': 44,
  ipamorelin: 46,
  'cjc-1295': 52,
  sermorelin: 49,
  'mk-677': 38,
  'igf-1-lr3': 68,
  'peg-mgf': 54,
};

function defaultBasePrice(peptideId: string): number {
  let hash = 0;
  for (const char of peptideId) hash = (hash * 31 + char.charCodeAt(0)) % 1000;
  return 35 + (hash % 50);
}

export function getAffiliateOffers(peptideId: string): AffiliateOffer[] {
  const base = BASE_PRICES[peptideId] ?? defaultBasePrice(peptideId);
  return buildOffers(peptideId, base);
}

export function getLowestAffiliatePrice(peptideId: string): number | null {
  const offers = getAffiliateOffers(peptideId);
  if (offers.length === 0) return null;
  return offers[0]!.priceUsd;
}
