'use client';

import { getFirebaseAuth } from '@/src/services/firebase/config';

/**
 * Starts Stripe Checkout for PepGuide Pro and redirects the browser.
 * Throws with a user-facing message on failure.
 */
export async function startProCheckout(): Promise<void> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Sign in again to continue checkout.');
  }

  try {
    const { trackAnalyticsEvent } = await import(
      '@/src/services/firestore/analytics'
    );
    void trackAnalyticsEvent({ name: 'checkout_started' });
  } catch {
    // Analytics should never block checkout.
  }

  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Unable to start checkout.');
  }

  window.location.assign(data.url);
}
