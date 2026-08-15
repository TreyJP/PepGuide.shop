import type { PartnerProduct } from '@/src/types/affiliates';

const AL_BASE = 'https://alaskalabs.is';
const AL_REF = 'PEPGUIDE';

/** Build an Alaska Labs product URL with PepGuide referral tracking. */
function alProduct(slug: string): string {
  return `${AL_BASE}/shop/${slug}?ref=${AL_REF}`;
}

/**
 * Alaska Labs catalog (https://alaskalabs.is/shop).
 * Prices are current storefront sale prices (before stacked promo codes).
 * `peptideIds` controls which compound pricing cards/modals show each row.
 * RT-3 → GL3RT (retatrutide), TZ-2 → GL2TZ (tirzepatide).
 */
export const ALASKA_LABS_CATALOG: PartnerProduct[] = [
  {
    id: 'al-rt-3-10',
    name: 'GL3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 59.98,
    testAmount: '10 mg',
    href: alProduct('rt-3-10mg'),
  },
  {
    id: 'al-rt-3-20',
    name: 'GL3RT',
    peptideIds: ['retatrutide'],
    priceUsd: 119.98,
    testAmount: '20 mg',
    href: alProduct('rt-3-20mg'),
  },
  {
    id: 'al-tz-2-20',
    name: 'GL2TZ',
    peptideIds: ['tirzepatide'],
    priceUsd: 99.98,
    testAmount: '20 mg',
    href: alProduct('tz-2-20mg'),
  },
  {
    id: 'al-tz-2-30',
    name: 'GL2TZ',
    peptideIds: ['tirzepatide'],
    priceUsd: 139.98,
    testAmount: '30 mg',
    href: alProduct('tz-2-30mg'),
  },
  {
    id: 'al-bpc-157-10',
    name: 'BPC-157',
    peptideIds: ['bpc-157'],
    priceUsd: 99.98,
    testAmount: '10 mg',
    href: alProduct('bpc-157-10mg'),
  },
  {
    id: 'al-mots-c-10',
    name: 'MOTS-c',
    peptideIds: ['mots-c'],
    priceUsd: 99.98,
    testAmount: '10 mg',
    href: alProduct('mots-c-10mg'),
  },
  {
    id: 'al-tesamorelin-10',
    name: 'Tesamorelin',
    peptideIds: ['tesamorelin'],
    priceUsd: 99.98,
    testAmount: '10 mg',
    href: alProduct('tesamorelin-10mg'),
  },
  {
    id: 'al-cagrilintide-10',
    name: 'Cagrilintide',
    peptideIds: ['cagrilintide'],
    priceUsd: 99.98,
    testAmount: '10 mg',
    href: alProduct('cagrilintide-10mg'),
  },
  {
    id: 'al-nad-plus-1000',
    name: 'NAD+',
    peptideIds: ['nad-plus'],
    priceUsd: 109.98,
    testAmount: '1000 mg',
    href: alProduct('nad-plus-1000mg'),
  },
  {
    id: 'al-slu-pp-332-5',
    name: 'SLU-PP-332',
    peptideIds: [],
    priceUsd: 39.99,
    testAmount: '5 mg',
    href: alProduct('slu-pp-332-5mg'),
  },
  {
    id: 'al-ipamorelin-10',
    name: 'Ipamorelin',
    peptideIds: ['ipamorelin'],
    priceUsd: 79.98,
    testAmount: '10 mg',
    href: alProduct('ipamorelin-10mg'),
  },
  {
    id: 'al-cjc-1295-10',
    name: 'CJC-1295',
    peptideIds: ['cjc-1295'],
    priceUsd: 79.98,
    testAmount: '10 mg',
    href: alProduct('cjc-1295-10mg'),
  },
  {
    id: 'al-ghk-cu-100',
    name: 'GHK-Cu',
    peptideIds: ['ghk-cu'],
    priceUsd: 79.98,
    testAmount: '100 mg',
    href: alProduct('ghk-cu-100mg'),
  },
  {
    id: 'al-tb-500-10',
    name: 'TB-500',
    peptideIds: ['tb-500'],
    priceUsd: 89.98,
    testAmount: '10 mg',
    href: alProduct('tb-500-10mg'),
  },
  {
    id: 'al-semax-10',
    name: 'Semax',
    peptideIds: ['semax'],
    priceUsd: 79.98,
    testAmount: '10 mg',
    href: alProduct('semax-10mg'),
  },
  {
    id: 'al-selank-10',
    name: 'Selank',
    peptideIds: ['selank'],
    priceUsd: 79.98,
    testAmount: '10 mg',
    href: alProduct('selank-10mg'),
  },
  {
    id: 'al-melanotan-ii-10',
    name: 'Melanotan II',
    peptideIds: ['melanotan-ii'],
    priceUsd: 70,
    testAmount: '10 mg',
    href: alProduct('melanotan-ii-10mg'),
  },
  {
    id: 'al-bpc-tb-20',
    name: 'BPC-157 + TB-500',
    peptideIds: ['bpc-157', 'tb-500'],
    priceUsd: 129.98,
    testAmount: '20 mg',
    href: alProduct('bpc-157-tb-500-blend-20mg'),
  },
  {
    id: 'al-glow-70',
    name: 'GLOW',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu'],
    priceUsd: 119.98,
    testAmount: '70 mg',
    href: alProduct('bpc157-tb500-ghkcu-70mg'),
  },
  {
    id: 'al-klow-80',
    name: 'KLOW',
    peptideIds: ['bpc-157', 'tb-500', 'ghk-cu', 'kpv'],
    priceUsd: 139.98,
    testAmount: '80 mg',
    href: alProduct('bpc157-tb500-kpv-ghkcu-80mg'),
  },
  {
    id: 'al-epithalon-50',
    name: 'Epithalon',
    peptideIds: ['epitalon'],
    priceUsd: 160,
    testAmount: '50 mg',
    href: alProduct('epithalon-50mg'),
  },
  {
    id: 'al-dsip-10',
    name: 'DSIP',
    peptideIds: ['dsip'],
    priceUsd: 89.98,
    testAmount: '10 mg',
    href: alProduct('dsip-10mg'),
  },
  {
    id: 'al-bac-water-3',
    name: 'BAC Water',
    peptideIds: ['bac-water'],
    priceUsd: 9.99,
    testAmount: '3 mL',
    href: alProduct('bac-water-3ml'),
  },
];

export const ALASKA_LABS_PARTNER = {
  id: 'alaska-labs',
  label: 'Alaska Labs',
  href: `${AL_BASE}/?ref=${AL_REF}`,
  couponCode: AL_REF,
  discountLabel: '30% off',
  discountPercent: 30,
} as const;
