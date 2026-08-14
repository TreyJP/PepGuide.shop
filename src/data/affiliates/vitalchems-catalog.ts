import type { PartnerProduct } from '@/src/types/affiliates';

const VC_BASE = 'https://vitalchems.co';
const VC_REF = 'pepguide';

/** Build a VitalChems product URL with PepGuide referral tracking. */
function vcProduct(slug: string): string {
  return `${VC_BASE}/${slug}?ref=${VC_REF}`;
}

/**
 * VitalChems Research catalog.
 * `peptideIds` controls which compound pricing cards/modals show each row.
 * Prices are regular/list; sitewide 25% is applied via partner discount fields.
 */
export const VITALCHEMS_CATALOG: PartnerProduct[] = [
  {
    id: 'vc-bpc-157-10',
    name: 'BPC-157',
    peptideIds: ['bpc-157'],
    priceUsd: 39.99,
    testAmount: '10 mg',
    href: vcProduct('bpc-157'),
  },
  {
    id: 'vc-ghk-cu-50',
    name: 'GHK-Cu',
    peptideIds: ['ghk-cu'],
    priceUsd: 34.99,
    testAmount: '50 mg',
    href: vcProduct('ghk-cu'),
  },
  {
    id: 'vc-glp-3-rt-10',
    name: 'GL3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 79.99,
    testAmount: '10 mg',
    href: vcProduct('glp-3-rt'),
  },
  {
    id: 'vc-tb-500-10',
    name: 'TB-500',
    peptideIds: ['tb-500'],
    priceUsd: 49.99,
    testAmount: '10 mg',
    href: vcProduct('tb-500'),
  },
  {
    id: 'vc-bpc-tb-10',
    name: 'BPC-157 + TB-500',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 64.99,
    testAmount: '10 mg',
    href: vcProduct('bpc-tb-blend'),
  },
  {
    id: 'vc-hgh-191aa-10iu',
    name: 'HGH (191aa)',
    peptideIds: [],
    priceUsd: 24.99,
    testAmount: '10 IU',
    href: vcProduct('hgh-191aa'),
  },
  {
    id: 'vc-tesamorelin-10',
    name: 'Tesamorelin',
    peptideIds: ['tesamorelin'],
    priceUsd: 69.99,
    testAmount: '10 mg',
    href: vcProduct('tesamorelin'),
  },
  {
    id: 'vc-ipamorelin-10',
    name: 'Ipamorelin',
    peptideIds: ['ipamorelin'],
    priceUsd: 54.99,
    testAmount: '10 mg',
    href: vcProduct('ipamorelin'),
  },
  {
    id: 'vc-cjc-1295-dac-5',
    name: 'CJC-1295 DAC',
    peptideIds: ['cjc-1295-dac', 'cjc-1295'],
    priceUsd: 54.99,
    testAmount: '5 mg',
    href: vcProduct('cjc-1295-dac'),
  },
  {
    id: 'vc-cjc-ipa-10',
    name: 'CJC-1295 + Ipamorelin',
    peptideIds: ['cjc-1295', 'ipamorelin'],
    priceUsd: 59.99,
    testAmount: '10 mg',
    href: vcProduct('cjc-ipa-blend'),
  },
  {
    id: 'vc-glow-70',
    name: 'GLOW Blend',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    priceUsd: 74.99,
    testAmount: '70 mg',
    href: vcProduct('glow-blend'),
  },
  {
    id: 'vc-klow-80',
    name: 'KLOW Blend',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu', 'kpv'],
    priceUsd: 96.67,
    testAmount: '80 mg',
    href: vcProduct('klow-blend'),
  },
  {
    id: 'vc-semax-10',
    name: 'Semax',
    peptideIds: ['semax'],
    priceUsd: 54.99,
    testAmount: '10 mg',
    href: vcProduct('semax'),
  },
  {
    id: 'vc-igf-1-lr3-1',
    name: 'IGF-1 LR3',
    peptideIds: ['igf-1-lr3'],
    priceUsd: 64.99,
    testAmount: '1 mg',
    href: vcProduct('igf-1-lr3'),
  },
  {
    id: 'vc-selank-10',
    name: 'Selank',
    peptideIds: ['selank'],
    priceUsd: 44.99,
    testAmount: '10 mg',
    href: vcProduct('selank'),
  },
  {
    id: 'vc-mots-c-10',
    name: 'MOTS-c',
    peptideIds: ['mots-c'],
    priceUsd: 44.99,
    testAmount: '10 mg',
    href: vcProduct('mots-c'),
  },
  {
    id: 'vc-epithalon-10',
    name: 'Epithalon',
    peptideIds: ['epitalon'],
    priceUsd: 39.99,
    testAmount: '10 mg',
    href: vcProduct('epithalon'),
  },
  {
    id: 'vc-nad-plus-100',
    name: 'NAD+',
    peptideIds: ['nad-plus'],
    priceUsd: 39.99,
    testAmount: '100 mg',
    href: vcProduct('nad-plus'),
  },
  {
    id: 'vc-hcg-5000',
    name: 'HCG',
    peptideIds: ['hcg'],
    priceUsd: 49.99,
    testAmount: '5000 IU',
    href: vcProduct('hcg'),
  },
  {
    id: 'vc-melanotan-2-10',
    name: 'Melanotan-2',
    peptideIds: ['melanotan-ii'],
    priceUsd: 32.99,
    testAmount: '10 mg',
    href: vcProduct('melanotan-2'),
  },
  {
    id: 'vc-glp1-sema-10',
    name: 'GL1SM',
    peptideIds: ['semaglutide'],
    priceUsd: 44.99,
    testAmount: '10 mg',
    href: vcProduct('glp1-sema'),
  },
  {
    id: 'vc-glp2-tirz-10',
    name: 'GL2TZ',
    peptideIds: ['tirzepatide'],
    priceUsd: 54.99,
    testAmount: '10 mg',
    href: vcProduct('glp2-tirz'),
  },
  {
    id: 'vc-cagrilintide-10',
    name: 'Cagrilintide',
    peptideIds: ['cagrilintide'],
    priceUsd: 79.99,
    testAmount: '10 mg',
    href: vcProduct('cagrilintide'),
  },
  {
    id: 'vc-dsip-10',
    name: 'DSIP',
    peptideIds: ['dsip'],
    priceUsd: 49.99,
    testAmount: '10 mg',
    href: vcProduct('dsip'),
  },
  {
    id: 'vc-melanotan-1-10',
    name: 'Melanotan-1',
    peptideIds: ['melanotan-i'],
    priceUsd: 39.99,
    testAmount: '10 mg',
    href: vcProduct('melanotan-1'),
  },
  {
    id: 'vc-bac-water-10',
    name: 'BAC Water',
    peptideIds: ['bac-water'],
    priceUsd: 14.65,
    testAmount: '10 mL',
    href: vcProduct('bacteriostatic-water'),
  },
  {
    id: 'vc-vitamin-b12-10',
    name: 'Vitamin B12',
    peptideIds: [],
    priceUsd: 26.65,
    testAmount: '10 mL',
    href: vcProduct('vitamin-b12'),
  },
];

export const VITALCHEMS_PARTNER = {
  id: 'vitalchems',
  label: 'VitalChems',
  href: `${VC_BASE}/?ref=${VC_REF}`,
  couponCode: 'PEPGUIDE',
  /** Sitewide sale is auto-applied at checkout. */
  discountLabel: '25% off',
  discountPercent: 25,
} as const;
