export const PRO_BILLING = {
  productName: 'PepGuide Pro',
  priceUsd: 20,
  interval: 'month' as const,
  priceLabel: '$20/mo',
  tagline: 'Video guides + goal-built peptide stacks',
  features: [
    'Skool-style video Guides by level',
    'Goal-built Protocol stacks',
    'Library links from every stack',
    'Cancel anytime',
  ],
} as const;
