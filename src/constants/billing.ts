/** When true, Pro nav/pages show Coming soon — no checkout. Flip to false to sell. */
export const PRO_COMING_SOON = true;

export type ProPlanId = 'monthly' | 'yearly';

export type ProPlan = {
  id: ProPlanId;
  priceUsd: number;
  interval: 'month' | 'year';
  priceLabel: string;
  /** Short cadence label shown under the price (e.g. "/month"). */
  cadenceLabel: string;
  /** Optional badge on the plan picker. */
  badge?: string;
  /** Pre-discount / compare-at price shown struck through next to `priceUsd`. */
  compareAtUsd?: number;
};

export const PRO_PLANS: Record<ProPlanId, ProPlan> = {
  monthly: {
    id: 'monthly',
    priceUsd: 20,
    interval: 'month',
    priceLabel: '$20/mo',
    cadenceLabel: '/month',
  },
  yearly: {
    id: 'yearly',
    priceUsd: 120,
    interval: 'year',
    priceLabel: '$120/yr',
    cadenceLabel: '/year',
    badge: 'Best value',
    /** 12 × monthly — shown as the struck-through “was” price. */
    compareAtUsd: 20 * 12,
  },
} as const;

export const DEFAULT_PRO_PLAN_ID: ProPlanId = 'monthly';

export function getProPlan(planId: string | null | undefined): ProPlan {
  if (planId === 'yearly') return PRO_PLANS.yearly;
  return PRO_PLANS.monthly;
}

export function isProPlanId(value: unknown): value is ProPlanId {
  return value === 'monthly' || value === 'yearly';
}

/** Effective daily rate from a plan’s billed amount (365-day year). */
export function getProPlanDailyUsd(plan: ProPlan): number {
  const yearly =
    plan.interval === 'year' ? plan.priceUsd : plan.priceUsd * 12;
  return yearly / 365;
}

/** Daily rate for the compare-at / pre-discount amount, when present. */
export function getProPlanCompareDailyUsd(plan: ProPlan): number | null {
  if (plan.compareAtUsd == null) return null;
  const yearly =
    plan.interval === 'year' ? plan.compareAtUsd : plan.compareAtUsd * 12;
  return yearly / 365;
}

export function formatProDailyUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** e.g. "Billed $20/month" / "Billed $120/year". */
export function getProPlanBilledLabel(plan: ProPlan): string {
  return plan.interval === 'year'
    ? `Billed $${plan.priceUsd}/year`
    : `Billed $${plan.priceUsd}/month`;
}

export const PRO_BILLING = {
  productName: 'PepGuide Pro',
  /** @deprecated Prefer PRO_PLANS.monthly — kept for older call sites. */
  priceUsd: PRO_PLANS.monthly.priceUsd,
  interval: PRO_PLANS.monthly.interval,
  priceLabel: PRO_PLANS.monthly.priceLabel,
  tagline:
    'Education & Research and Protocols',
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
