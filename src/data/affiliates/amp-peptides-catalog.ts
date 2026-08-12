import type { PartnerProduct } from '@/src/types/affiliates';

const AMP_BASE = 'https://amp-peptides.com';
const AMP_REF = 'xiwggiom';

/** Build an Amp Peptides product URL with PepGuide referral tracking. */
function ampProduct(slug: string): string {
  const path = slug.replace(/^\/+|\/+$/g, '');
  return `${AMP_BASE}/product/${path}/?ref=${AMP_REF}`;
}

/**
 * Amp Peptides catalog (amp-peptides.com/shop).
 * Prices are current storefront sale / display prices.
 * `peptideIds` controls which compound pricing cards/modals show each row.
 * Multi-month GLP3RT supply packs are catalogued without peptideIds so they
 * do not flood retatrutide offer lists.
 */
export const AMP_PEPTIDES_CATALOG: PartnerProduct[] = [
  {
    id: 'amp-bpc-157-10',
    name: 'BPC-157',
    peptideIds: ['bpc-157'],
    priceUsd: 50,
    testAmount: '10 mg',
    href: ampProduct('bpc-157-10mg'),
  },
  {
    id: 'amp-bpc-157-20',
    name: 'BPC-157',
    peptideIds: ['bpc-157'],
    priceUsd: 90,
    testAmount: '20 mg',
    href: ampProduct('bpc-157-10mg'),
  },
  {
    id: 'amp-bpc-tb-5-5',
    name: 'BPC-157 & TB500',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 65,
    testAmount: '5/5 mg',
    href: ampProduct('bpc-157-tb500'),
  },
  {
    id: 'amp-bpc-tb-10-10',
    name: 'BPC-157 & TB500',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 95,
    testAmount: '10/10 mg',
    href: ampProduct('bpc-157-tb500'),
  },
  {
    id: 'amp-bpc-tb-20-20',
    name: 'BPC-157 & TB500',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 170,
    testAmount: '20/20 mg',
    href: ampProduct('bpc-157-tb500'),
  },
  {
    id: 'amp-cjc-ipa-5-5',
    name: 'CJC-1295/IPAMORELIN',
    peptideIds: ['cjc-1295', 'ipamorelin'],
    priceUsd: 70,
    testAmount: '5/5 mg',
    href: ampProduct('cjc-ipamorelin'),
  },
  {
    id: 'amp-cjc-ipa-10-10',
    name: 'CJC-1295/IPAMORELIN',
    peptideIds: ['cjc-1295', 'ipamorelin'],
    priceUsd: 120,
    testAmount: '10/10 mg',
    href: ampProduct('cjc-ipamorelin'),
  },
  {
    id: 'amp-epithalon-10',
    name: 'EPITHALON',
    peptideIds: ['epitalon'],
    priceUsd: 45,
    testAmount: '10 mg',
    href: ampProduct('epithalon'),
  },
  {
    id: 'amp-ghk-cu-100',
    name: 'GHK-CU',
    peptideIds: ['ghk-cu'],
    priceUsd: 65,
    testAmount: '100 mg',
    href: ampProduct('ghk-cu'),
  },
  {
    id: 'amp-ghk-cu-200',
    name: 'GHK-CU',
    peptideIds: ['ghk-cu'],
    priceUsd: 120,
    testAmount: '200 mg',
    href: ampProduct('ghk-cu'),
  },
  {
    id: 'amp-glow-70',
    name: 'GLOW',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    priceUsd: 90,
    testAmount: '50/10/10 mg',
    href: ampProduct('glow'),
  },
  {
    id: 'amp-glp3rt-10',
    name: 'GLP3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 125,
    testAmount: '10 mg',
    href: ampProduct('glp3rt'),
  },
  {
    id: 'amp-glp3rt-20',
    name: 'GLP3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 145,
    testAmount: '20 mg',
    href: ampProduct('glp3rt'),
  },
  {
    id: 'amp-glp3rt-bimonthly',
    name: 'GLP3RT — Bi-Monthly Supply (2-Month)',
    peptideIds: [],
    priceUsd: 200,
    priceMaxUsd: 313.5,
    testAmount: '2-month supply',
    href: ampProduct('glp3rt-bi-monthly-supply-2-month'),
  },
  {
    id: 'amp-glp3rt-quarterly',
    name: 'GLP3RT — Quarterly Supply (3-Month)',
    peptideIds: [],
    priceUsd: 262.5,
    priceMaxUsd: 420.75,
    testAmount: '3-month supply',
    href: ampProduct('glp3rt-quarterly-supply-3-month'),
  },
  {
    id: 'amp-glp3rt-biannual',
    name: 'GLP3RT — Biannual Supply (6-Month)',
    peptideIds: [],
    priceUsd: 450,
    priceMaxUsd: 742.5,
    testAmount: '6-month supply',
    href: ampProduct('glp3rt-biannual-supply-6-month'),
  },
  {
    id: 'amp-glutathione-20ml',
    name: 'GLUTATHIONE',
    peptideIds: ['glutathione'],
    priceUsd: 55,
    testAmount: '200 mg/mL | 20 mL',
    href: ampProduct('glutathione'),
  },
  {
    id: 'amp-igf-1-lr3-1',
    name: 'IGF-1 LR3',
    peptideIds: ['igf-1-lr3'],
    priceUsd: 90,
    testAmount: '1 mg',
    href: ampProduct('igf-1-lr3'),
  },
  {
    id: 'amp-mots-c-10',
    name: 'MOTS-C',
    peptideIds: ['mots-c'],
    priceUsd: 50,
    testAmount: '10 mg',
    href: ampProduct('mots-c'),
  },
  {
    id: 'amp-mots-c-40',
    name: 'MOTS-C',
    peptideIds: ['mots-c'],
    priceUsd: 80,
    testAmount: '40 mg',
    href: ampProduct('mots-c'),
  },
  {
    id: 'amp-mt2-10',
    name: 'MT-2',
    peptideIds: ['melanotan-ii'],
    priceUsd: 35,
    testAmount: '10 mg',
    href: ampProduct('mt-2'),
  },
  {
    id: 'amp-nad-500',
    name: 'NAD+',
    peptideIds: ['nad-plus'],
    priceUsd: 70,
    testAmount: '500 mg',
    href: ampProduct('nad'),
  },
  {
    id: 'amp-nad-1000',
    name: 'NAD+',
    peptideIds: ['nad-plus'],
    priceUsd: 80,
    testAmount: '1000 mg',
    href: ampProduct('nad'),
  },
  {
    id: 'amp-selank-10',
    name: 'SELANK',
    peptideIds: ['selank'],
    priceUsd: 50,
    testAmount: '10 mg',
    href: ampProduct('selank'),
  },
  {
    id: 'amp-semax-10',
    name: 'SEMAX',
    peptideIds: ['semax'],
    priceUsd: 50,
    testAmount: '10 mg',
    href: ampProduct('semax'),
  },
  {
    id: 'amp-tb-500-5',
    name: 'TB-500',
    peptideIds: ['tb-500'],
    priceUsd: 40,
    testAmount: '5 mg',
    href: ampProduct('tb-500'),
  },
  {
    id: 'amp-tb-500-10',
    name: 'TB-500',
    peptideIds: ['tb-500'],
    priceUsd: 90,
    testAmount: '10 mg',
    href: ampProduct('tb-500'),
  },
  {
    id: 'amp-tesamorelin-10',
    name: 'TESAMORELIN',
    peptideIds: ['tesamorelin'],
    priceUsd: 100,
    testAmount: '10 mg',
    href: ampProduct('tesamorelin'),
  },
  {
    id: 'amp-tesamorelin-20',
    name: 'TESAMORELIN',
    peptideIds: ['tesamorelin'],
    priceUsd: 165,
    testAmount: '20 mg',
    href: ampProduct('tesamorelin'),
  },
];

export const AMP_PEPTIDES_PARTNER = {
  id: 'amp-peptides',
  label: 'Amp Peptides',
  href: `${AMP_BASE}/?ref=${AMP_REF}`,
  couponCode: 'PEPGUIDE',
  discountLabel: '15% off',
  discountPercent: 15,
} as const;
