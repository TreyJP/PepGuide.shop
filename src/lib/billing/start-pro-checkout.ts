'use client';

import {
  DEFAULT_PRO_PLAN_ID,
  PRO_COMING_SOON,
  type ProPlanId,
} from '@/src/constants/billing';
import { getFirebaseAuth } from '@/src/services/firebase/config';

/**
 * Starts Stripe Checkout for PepGuide Pro and opens it in a new tab.
 * Throws with a user-facing message on failure.
 */
export async function startProCheckout(
  planId: ProPlanId = DEFAULT_PRO_PLAN_ID,
): Promise<void> {
  if (PRO_COMING_SOON) {
    throw new Error('PepGuide Pro checkout is coming soon.');
  }

  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) {
    throw new Error('Sign in again to continue checkout.');
  }

  try {
    const { trackAnalyticsEvent } = await import(
      '@/src/services/firestore/analytics'
    );
    void trackAnalyticsEvent({
      name: 'checkout_started',
      meta: { plan: planId },
    });
  } catch {
    // Analytics should never block checkout.
  }

  const response = await fetch('/api/billing/checkout', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ plan: planId }),
  });
  const data = (await response.json()) as { url?: string; error?: string };
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'Unable to start checkout.');
  }

  // Prefer a new tab so PepGuide stays open; fall back if the popup is blocked.
  const checkoutTab = window.open(data.url, '_blank', 'noopener,noreferrer');
  if (!checkoutTab) {
    window.location.assign(data.url);
  }
}
