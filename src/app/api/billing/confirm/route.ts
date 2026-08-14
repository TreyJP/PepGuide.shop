import { NextResponse } from 'next/server';
import { z } from 'zod';

import { PRO_BILLING } from '@/src/constants/billing';
import { recordAnalyticsEventAdmin } from '@/src/lib/server/analytics';
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  setUserSubscriptionTier,
  verifyBearerToken,
} from '@/src/lib/server/firebase-admin';
import { getStripe } from '@/src/lib/server/stripe';

const bodySchema = z.object({
  sessionId: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const decoded = await verifyBearerToken(request);
    const json: unknown = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(parsed.data.sessionId);

    const sessionUid =
      session.metadata?.firebaseUid?.trim() ||
      session.client_reference_id?.trim();

    if (!sessionUid || sessionUid !== decoded.uid) {
      return NextResponse.json({ error: 'Session mismatch.' }, { status: 403 });
    }

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed.', tier: 'free' },
        { status: 402 },
      );
    }

    await setUserSubscriptionTier(decoded.uid, 'pro', {
      stripeCustomerId:
        typeof session.customer === 'string' ? session.customer : null,
      stripeSubscriptionId:
        typeof session.subscription === 'string' ? session.subscription : null,
    });

    if (isFirebaseAdminConfigured()) {
      await recordAnalyticsEventAdmin(getAdminDb(), {
        name: 'checkout_completed',
        userId: decoded.uid,
        email: decoded.email ?? null,
        path: '/billing/success',
        meta: {
          amountUsd:
            typeof session.amount_total === 'number'
              ? session.amount_total / 100
              : PRO_BILLING.priceUsd,
          plan: session.metadata?.plan ?? 'monthly',
          sessionId: session.id,
          product: 'pepguide_pro',
          source: 'confirm',
        },
      }).catch(() => undefined);
    }

    return NextResponse.json({ tier: 'pro' });
  } catch (error) {
    console.error('Confirm billing error', error);
    const message =
      error instanceof Error ? error.message : 'Unable to confirm payment.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
