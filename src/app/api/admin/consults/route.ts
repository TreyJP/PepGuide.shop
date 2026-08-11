import { NextResponse } from 'next/server';

import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';
import { requireAdminUser } from '@/src/lib/server/require-admin';
import type { ProConsult, ProConsultStatus } from '@/src/types/consults';

export const runtime = 'nodejs';

function mapConsult(id: string, data: Record<string, unknown>): ProConsult {
  const statusRaw = String(data.status ?? 'open');
  const status: ProConsultStatus =
    statusRaw === 'answered' || statusRaw === 'closed' ? statusRaw : 'open';
  return {
    id,
    userId: String(data.userId ?? ''),
    userDisplayName: String(data.userDisplayName ?? 'Member'),
    subject: String(data.subject ?? ''),
    status,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(
      data.updatedAt ?? data.createdAt ?? new Date().toISOString(),
    ),
    lastMessagePreview: String(data.lastMessagePreview ?? ''),
    messageCount: Number(data.messageCount ?? 0),
    searchText: String(data.searchText ?? ''),
  };
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
    const statusParam = searchParams.get('status');

    const snap = await db
      .collection('proConsults')
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();

    let consults = snap.docs.map((doc) =>
      mapConsult(doc.id, doc.data() as Record<string, unknown>),
    );
    if (
      statusParam === 'open' ||
      statusParam === 'answered' ||
      statusParam === 'closed'
    ) {
      consults = consults.filter((item) => item.status === statusParam);
    }

    return NextResponse.json({ consults });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load consults.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
