import type { PartnerProduct } from '@/src/types/affiliates';

const PRISTINE_COUPON = 'PEPGUIDE';
const PRISTINE_SHOP = `https://pristinepeptide.com/?coupon=${PRISTINE_COUPON}`;

/** Build a Pristine Peptide product URL with PepGuide coupon. */
function ppProduct(slug: string): string {
  return `https://pristinepeptide.com/product/${slug}/?coupon=${PRISTINE_COUPON}`;
}

/**
 * Pristine Peptide catalog.
 * `peptideIds` controls which compound pricing modals show each row.
 * Product hrefs point at real shop pages (not the homepage).
 */
export const PRISTINE_PEPTIDE_CATALOG: PartnerProduct[] = [
  {
    id: 'pp-glp3-ret',
    name: 'GL3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 50,
    testAmount: 'GLP',
    href: ppProduct('glp-3r'),
  },
  {
    id: 'pp-glp2-trz',
    name: 'GL2TZ',
    peptideIds: ['tirzepatide'],
    priceUsd: 30,
    testAmount: 'GLP',
    href: ppProduct('glp-2t'),
  },
  {
    id: 'pp-glp1-sem',
    name: 'GL1SM',
    peptideIds: ['semaglutide'],
    priceUsd: 30,
    testAmount: 'GLP',
    href: ppProduct('glp-1s'),
  },
  {
    id: 'pp-bpc-157',
    name: 'BPC-157',
    peptideIds: ['bpc-157'],
    priceUsd: 35,
    testAmount: 'Regeneration',
    href: ppProduct('bpc-157'),
  },
  {
    id: 'pp-tb-500',
    name: 'TB-500',
    peptideIds: ['tb-500'],
    priceUsd: 45,
    testAmount: 'Regeneration',
    href: ppProduct('tb-500'),
  },
  {
    id: 'pp-ghk-cu',
    name: 'GHK-Cu',
    peptideIds: ['ghk-cu'],
    priceUsd: 50,
    testAmount: 'Regeneration',
    href: ppProduct('ghk-cu'),
  },
  {
    id: 'pp-glow-blend',
    name: 'GLOW Blend',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    priceUsd: 115,
    testAmount: 'Regeneration',
    href: ppProduct('glow'),
  },
  {
    id: 'pp-klow-blend',
    name: 'KLOW Blend',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu', 'kpv'],
    priceUsd: 135,
    testAmount: 'Regeneration',
    href: ppProduct('klow'),
  },
  {
    id: 'pp-regen-blend',
    name: 'Regen Blend',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 80,
    testAmount: 'Regeneration',
    href: ppProduct('regen-blend'),
  },
  {
    id: 'pp-tesamorelin',
    name: 'Tesamorelin',
    peptideIds: ['tesamorelin'],
    priceUsd: 50,
    testAmount: 'GHRH/GHRP',
    href: ppProduct('tesamorelin'),
  },
  {
    id: 'pp-sermorelin',
    name: 'Sermorelin',
    peptideIds: ['sermorelin'],
    priceUsd: 55,
    testAmount: 'GHRH/GHRP',
    href: ppProduct('sermorelin'),
  },
  {
    id: 'pp-ipamorelin',
    name: 'Ipamorelin',
    peptideIds: ['ipamorelin'],
    priceUsd: 45,
    testAmount: 'GHRH/GHRP',
    href: ppProduct('ipamorelin'),
  },
  {
    id: 'pp-cjc-1295',
    name: 'CJC-1295',
    peptideIds: ['cjc-1295'],
    priceUsd: 25,
    testAmount: 'GHRH/GHRP',
    href: ppProduct('cjc-1295'),
  },
  {
    id: 'pp-nad-plus',
    name: 'NAD+',
    peptideIds: ['nad-plus'],
    priceUsd: 40,
    testAmount: 'Longevity Research',
    href: ppProduct('nad-plus'),
  },
  {
    id: 'pp-mots-c',
    name: 'MOTS-c',
    peptideIds: ['mots-c'],
    priceUsd: 50,
    testAmount: 'Longevity Research',
    href: ppProduct('mots-c'),
  },
  {
    id: 'pp-glutathione',
    name: 'Glutathione',
    peptideIds: ['glutathione'],
    priceUsd: 50,
    testAmount: 'Longevity Research',
    href: ppProduct('glutathione'),
  },
  {
    id: 'pp-gh-stack',
    name: 'GH Stack',
    peptideIds: ['cjc-1295', 'ipamorelin'],
    priceUsd: 90,
    testAmount: 'GHRH/GHRP',
    href: ppProduct('gh-stack'),
  },
  {
    id: 'pp-epithalon',
    name: 'Epithalon',
    peptideIds: ['epitalon'],
    priceUsd: 50,
    testAmount: 'Longevity Research',
    href: ppProduct('epithalon'),
  },
  {
    id: 'pp-bac-water',
    name: 'Bacteriostatic Water',
    peptideIds: ['bac-water'],
    priceUsd: 15,
    testAmount: 'Reconstitution Solutions',
    href: ppProduct('bacteriostatic-water'),
  },
  {
    id: 'pp-sterile-water',
    name: 'Sterile Water',
    peptideIds: ['bac-water'],
    priceUsd: 15,
    testAmount: 'Reconstitution Solutions',
    href: ppProduct('sterile-water'),
  },
];

export const PRISTINE_PEPTIDE_PARTNER = {
  id: 'pristine-peptide',
  label: 'Pristine Peptide',
  href: PRISTINE_SHOP,
  couponCode: 'PEPGUIDE',
  discountLabel: '10% off',
} as const;
