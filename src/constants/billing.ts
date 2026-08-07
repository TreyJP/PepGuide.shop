export const PRO_BILLING = {
  productName: 'PepGuide Pro',
  priceUsd: 20,
  interval: 'month' as const,
  priceLabel: '$20/mo',
  tagline: 'Education, protocols, questions & discussion, and member ranking',
  features: [
    'Education & Research video lessons',
    'Goal-built Protocol stacks',
    'Questions & Discussion (post, search, reply)',
    'Member activity ranks from chat count',
    'Cancel anytime',
  ],
} as const;
