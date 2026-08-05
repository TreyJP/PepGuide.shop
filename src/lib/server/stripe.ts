import Stripe from 'stripe';

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.');
  }
  return new Stripe(key, {
    apiVersion: '2026-07-29.dahlia',
  });
}

export function getStripePriceId(): string | null {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  return priceId || null;
}
