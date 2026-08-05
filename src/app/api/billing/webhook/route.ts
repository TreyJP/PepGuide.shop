import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { recordAnalyticsEventAdmin } from '@/src/lib/server/analytics';
import {
  getAdminDb,
  isFirebaseAdminConfigured,
  setUserSubscriptionTier,
} from '@/src/lib/server/firebase-admin';
import { getStripe } from '@/src/lib/server/stripe';
import { PRO_BILLING } from '@/src/constants/billing';

export const runtime = 'nodejs';

function uidFromObject(
  obj: { metadata?: Stripe.Metadata | null; client_reference_id?: string | null },
) {
  return (
    obj.metadata?.firebaseUid?.trim() ||
    obj.client_reference_id?.trim() ||
    null
  );
}

async function markPro(
  uid: string,
  extras: Record<string, unknown>,
) {
  await setUserSubscriptionTier(uid, 'pro', extras);
}

async function markFree(
  uid: string,
  extras: Record<string, unknown>,
) {
  await setUserSubscriptionTier(uid, 'free', extras);
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { error: 'STRIPE_WEBHOOK_SECRET is not configured.' },
      { status: 503 },
    );
  }

  try {
    const stripe = getStripe();
    const signature = request.headers.get('stripe-signature');
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature.' }, { status: 400 });
    }

    const rawBody = await request.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, secret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const uid = uidFromObject(session);
        if (uid && session.mode === 'subscription') {
          await markPro(uid, {
            stripeCustomerId:
              typeof session.customer === 'string' ? session.customer : null,
            stripeSubscriptionId:
              typeof session.subscription === 'string'
                ? session.subscription
                : null,
          });
          if (isFirebaseAdminConfigured()) {
            await recordAnalyticsEventAdmin(getAdminDb(), {
              name: 'checkout_completed',
              userId: uid,
              email:
                typeof session.customer_details?.email === 'string'
                  ? session.customer_details.email
                  : null,
              path: '/billing/success',
              meta: {
                amountUsd: PRO_BILLING.priceUsd,
                sessionId: session.id,
                product: 'pepguide_pro',
              },
            });
          }
        }
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = uidFromObject(subscription);
        if (!uid) break;
        const active = ['active', 'trialing'].includes(subscription.status);
        if (active) {
          await markPro(uid, {
            stripeCustomerId:
              typeof subscription.customer === 'string'
                ? subscription.customer
                : null,
            stripeSubscriptionId: subscription.id,
          });
        } else {
          await markFree(uid, {
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const uid = uidFromObject(subscription);
        if (uid) {
          await markFree(uid, {
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error', error);
    return NextResponse.json(
      { error: 'Webhook handler failed.' },
      { status: 400 },
    );
  }
}
