export const PRO_BILLING = {
  productName: 'PepGuide Pro',
  priceUsd: 20,
  interval: 'month' as const,
  priceLabel: '$20/mo',
  tagline: 'Education & Research lessons and goal-built Protocol stacks',
  features: [
    'Education & Research video lessons',
    'Goal-built Protocol stacks',
    'Cancel anytime',
  ],
  /**
   * Explainer shown when a locked Pro feature opens the subscribe modal.
   * YouTube, Vimeo, or a public path like `/pro/explainer.mp4`.
   */
  explainerVideoUrl:
    process.env.NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_URL?.trim() || '',
  /** Optional poster image for direct mp4/webm sources. */
  explainerVideoPoster:
    process.env.NEXT_PUBLIC_PRO_EXPLAINER_VIDEO_POSTER?.trim() || '',
} as const;
