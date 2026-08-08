import { NextResponse } from 'next/server';

import {
  getAdminDb,
  isFirebaseAdminConfigured,
  verifyBearerToken,
} from '@/src/lib/server/firebase-admin';
import { getStripe } from '@/src/lib/server/stripe';

function appUrl(request: Request) {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  const origin = request.headers.get('origin');
  if (origin) return origin;
  return 'http://localhost:3000';
}

/** Stripe Customer Portal — cancel / update payment method. */
export async function POST(request: Request) {
  try {
    if (!process.env.STRIPE_SECRET_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            'Payments are not configured yet. Add Stripe keys to enable billing management.',
        },
        { status: 503 },
      );
    }

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        { error: 'Firebase Admin is required to open the billing portal.' },
        { status: 503 },
      );
    }

    const decoded = await verifyBearerToken(request);
    const snap = await getAdminDb().collection('users').doc(decoded.uid).get();
    const customerId = snap.data()?.stripeCustomerId;

    if (typeof customerId !== 'string' || !customerId.trim()) {
      return NextResponse.json(
        {
          error:
            'No Stripe customer on this account yet. Subscribe to PepGuide Pro first.',
        },
        { status: 404 },
      );
    }

    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId.trim(),
      return_url: `${appUrl(request)}/settings`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: 'Unable to open billing portal.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal error', error);
    const message =
      error instanceof Error ? error.message : 'Unable to open billing portal.';
    const status =
      message.includes('auth') || message.includes('token')
        ? 401
        : message.includes('Firebase Admin')
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
