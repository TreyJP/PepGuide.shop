import { NextResponse } from 'next/server';

import {
  getProPlan,
  isProPlanId,
  PRO_BILLING,
  PRO_COMING_SOON,
  type ProPlanId,
} from '@/src/constants/billing';
import { verifyBearerToken } from '@/src/lib/server/firebase-admin';
import { getStripe, getStripePriceIdForPlan } from '@/src/lib/server/stripe';

function appUrl(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  return 'http://localhost:3000';
}

export async function POST(request: Request) {
  try {
    if (PRO_COMING_SOON) {
      return NextResponse.json(
        { error: 'PepGuide Pro checkout is coming soon.' },
        { status: 503 },
      );
    }

    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            'Payments are not configured yet. Add Stripe keys to enable checkout.',
        },
        { status: 503 },
      );
    }

    const decoded = await verifyBearerToken(request);
    const stripe = getStripe();
    const base = appUrl(request);

    let planId: ProPlanId = 'monthly';
    try {
      const body = (await request.json()) as { plan?: unknown };
      if (isProPlanId(body.plan)) planId = body.plan;
    } catch {
      // Empty body → monthly (legacy clients).
    }

    const plan = getProPlan(planId);
    const priceId = getStripePriceIdForPlan(planId);

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: decoded.email ?? undefined,
      client_reference_id: decoded.uid,
      metadata: {
        firebaseUid: decoded.uid,
        product: 'pepguide_pro',
        plan: planId,
      },
      subscription_data: {
        metadata: {
          firebaseUid: decoded.uid,
          product: 'pepguide_pro',
          plan: planId,
        },
      },
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              quantity: 1,
              price_data: {
                currency: 'usd',
                unit_amount: plan.priceUsd * 100,
                recurring: { interval: plan.interval },
                product_data: {
                  name: PRO_BILLING.productName,
                  description: PRO_BILLING.tagline,
                },
              },
            },
          ],
      success_url: `${base}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/pro/guides?checkout=canceled`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Unable to start checkout.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error', error);
    const message =
      error instanceof Error ? error.message : 'Unable to start checkout.';
    const status = message.includes('auth') || message.includes('token')
      ? 401
      : message.includes('Firebase Admin')
        ? 503
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
