import { NextResponse } from 'next/server';

import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';
import { requireAdminUser } from '@/src/lib/server/require-admin';

export const runtime = 'nodejs';

export type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  subscriptionTier: 'free' | 'pro';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  chatCount: number;
  accountStatus: string;
};

function mapUser(id: string, data: Record<string, unknown>): AdminUserRow {
  const tierRaw = String(data.subscriptionTier ?? 'free');
  return {
    id,
    email: String(data.email ?? ''),
    displayName: String(data.displayName ?? 'Member'),
    subscriptionTier: tierRaw === 'pro' ? 'pro' : 'free',
    stripeCustomerId:
      typeof data.stripeCustomerId === 'string' && data.stripeCustomerId
        ? data.stripeCustomerId
        : null,
    stripeSubscriptionId:
      typeof data.stripeSubscriptionId === 'string' &&
      data.stripeSubscriptionId
        ? data.stripeSubscriptionId
        : null,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    chatCount: Number(data.chatCount ?? 0),
    accountStatus: String(data.accountStatus ?? 'active'),
  };
}

function sortUsers(users: AdminUserRow[]): AdminUserRow[] {
  return [...users].sort((a, b) => {
    const aTime = a.updatedAt || a.createdAt || '';
    const bTime = b.updatedAt || b.createdAt || '';
    return bTime.localeCompare(aTime);
  });
}

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

    const { searchParams } = new URL(request.url);
    const tierParam = searchParams.get('tier');
    const tier =
      tierParam === 'pro' || tierParam === 'free' || tierParam === 'all'
        ? tierParam
        : 'all';

    let users: AdminUserRow[];

    if (tier === 'pro' || tier === 'free') {
      const snap = await db
        .collection('users')
        .where('subscriptionTier', '==', tier)
        .get();
      users = sortUsers(
        snap.docs.map((doc) =>
          mapUser(doc.id, doc.data() as Record<string, unknown>),
        ),
      );
      return NextResponse.json({
        users,
        count: users.length,
        total: users.length,
        proCount: tier === 'pro' ? users.length : null,
        freeCount: tier === 'free' ? users.length : null,
        tier,
      });
    }

    const snap = await db.collection('users').get();
    users = sortUsers(
      snap.docs.map((doc) =>
        mapUser(doc.id, doc.data() as Record<string, unknown>),
      ),
    );
    const proCount = users.filter((user) => user.subscriptionTier === 'pro')
      .length;
    const freeCount = users.length - proCount;

    return NextResponse.json({
      users,
      count: users.length,
      total: users.length,
      proCount,
      freeCount,
      tier: 'all',
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load users.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
