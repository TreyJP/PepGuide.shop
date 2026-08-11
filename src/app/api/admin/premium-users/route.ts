import { NextResponse } from 'next/server';

import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';
import { requireAdminUser } from '@/src/lib/server/require-admin';

export const runtime = 'nodejs';

/** @deprecated Use GET /api/admin/users?tier=pro — kept for older clients. */
export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    const db = tryGetAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase Admin is not configured.' },
        { status: 503 },
      );
    }

    const url = new URL(request.url);
    url.pathname = '/api/admin/users';
    url.searchParams.set('tier', 'pro');

    const snap = await db
      .collection('users')
      .where('subscriptionTier', '==', 'pro')
      .get();

    const users = snap.docs
      .map((doc) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          id: doc.id,
          email: String(data.email ?? ''),
          displayName: String(data.displayName ?? 'Member'),
          subscriptionTier: 'pro' as const,
          stripeCustomerId:
            typeof data.stripeCustomerId === 'string' && data.stripeCustomerId
              ? data.stripeCustomerId
              : null,
          stripeSubscriptionId:
            typeof data.stripeSubscriptionId === 'string' &&
            data.stripeSubscriptionId
              ? data.stripeSubscriptionId
              : null,
          createdAt:
            typeof data.createdAt === 'string' ? data.createdAt : null,
          updatedAt:
            typeof data.updatedAt === 'string' ? data.updatedAt : null,
          chatCount: Number(data.chatCount ?? 0),
          accountStatus: String(data.accountStatus ?? 'active'),
        };
      })
      .sort((a, b) => {
        const aTime = a.updatedAt || a.createdAt || '';
        const bTime = b.updatedAt || b.createdAt || '';
        return bTime.localeCompare(aTime);
      });

    return NextResponse.json({ users, count: users.length });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load premium users.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
