export const AFFILIATE_DESIGN_IDS = [
  'welcome',
  'horizon',
  'split',
  'editorial',
  'console',
] as const;

export type AffiliateDesignId = (typeof AFFILIATE_DESIGN_IDS)[number];

export const AFFILIATE_DESIGNS: Array<{
  id: AffiliateDesignId;
  label: string;
  blurb: string;
}> = [
  {
    id: 'welcome',
    label: 'Welcome',
    blurb: 'Centered marketing landing — badges, soft bands, FAQ accordion',
  },
  {
    id: 'horizon',
    label: 'Horizon',
    blurb: 'Full-bleed navy hero with cinematic title and light content below',
  },
  {
    id: 'split',
    label: 'Split',
    blurb: 'Luxury asymmetric hero — navy partner seat, refined typography',
  },
  {
    id: 'editorial',
    label: 'Editorial',
    blurb: 'Magazine-style long form with large numerals and quiet rules',
  },
  {
    id: 'console',
    label: 'Console',
    blurb: 'Product dashboard first — metrics toolbar, then compact explainer',
  },
];

export const DEFAULT_AFFILIATE_DESIGN: AffiliateDesignId = 'split';
