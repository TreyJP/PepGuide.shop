import Stripe from 'stripe';

import type { ProPlanId } from '@/src/constants/billing';

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  return new Stripe(key, {
    apiVersion: '2026-07-29.dahlia',
  });
}

/** Monthly Stripe Price ID (legacy env name). */
export function getStripePriceId(): string | null {
  return getStripePriceIdForPlan('monthly');
}

export function getStripePriceIdForPlan(planId: ProPlanId): string | null {
  if (planId === 'yearly') {
    return process.env.STRIPE_PRICE_ID_YEARLY?.trim() || null;
  }
  return process.env.STRIPE_PRICE_ID?.trim() || null;
}
