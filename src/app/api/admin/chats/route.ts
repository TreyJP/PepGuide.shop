import { NextResponse } from 'next/server';

import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';
import { requireAdminUser } from '@/src/lib/server/require-admin';

export const runtime = 'nodejs';

export type AdminChatRow = {
  chatId: string;
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName: string;
  title: string;
  lastMessagePreview: string;
  messageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  archived: boolean;
  temporary: boolean;
};

function ownerUidFromPath(path: string): string | null {
  // users/{uid}/chats/{chatId}
  const parts = path.split('/');
  if (parts.length >= 4 && parts[0] === 'users' && parts[2] === 'chats') {
    return parts[1] || null;
  }
  return null;
}

function mapChat(
  chatId: string,
  ownerUid: string,
  data: Record<string, unknown>,
  owner: { email: string; displayName: string },
): AdminChatRow {
  return {
    chatId,
    ownerUid,
    ownerEmail: owner.email,
    ownerDisplayName: owner.displayName,
    title: String(data.title ?? 'Research chat').trim() || 'Research chat',
    lastMessagePreview: String(data.lastMessagePreview ?? '').trim(),
    messageCount: Number(data.messageCount ?? 0) || 0,
    createdAt: typeof data.createdAt === 'string' ? data.createdAt : null,
    updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : null,
    archived: Boolean(data.archived),
    temporary: Boolean(data.temporary),
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
    const limitParam = Number(searchParams.get('limit') ?? 400);
    const limit = Number.isFinite(limitParam)
      ? Math.min(1000, Math.max(50, Math.round(limitParam)))
      : 400;

    const snap = await db.collectionGroup('chats').get();
    const ownerCache = new Map<
      string,
      { email: string; displayName: string }
    >();

    async function resolveOwner(uid: string) {
      const cached = ownerCache.get(uid);
      if (cached) return cached;
      try {
        const userSnap = await db!.collection('users').doc(uid).get();
        const data = (userSnap.data() ?? {}) as Record<string, unknown>;
        const owner = {
          email: String(data.email ?? ''),
          displayName: String(data.displayName ?? 'Member'),
        };
        ownerCache.set(uid, owner);
        return owner;
      } catch {
        const owner = { email: '', displayName: 'Member' };
        ownerCache.set(uid, owner);
        return owner;
      }
    }

    const rows: AdminChatRow[] = [];
    const shareWrites: Array<{
      chatId: string;
      ownerUid: string;
      title: string;
      updatedAt: string;
    }> = [];

    for (const doc of snap.docs) {
      const ownerUid = ownerUidFromPath(doc.ref.path);
      if (!ownerUid) continue;
      const data = doc.data() as Record<string, unknown>;
      const owner = await resolveOwner(ownerUid);
      const row = mapChat(doc.id, ownerUid, data, owner);
      rows.push(row);
      shareWrites.push({
        chatId: doc.id,
        ownerUid,
        title: row.title,
        updatedAt: row.updatedAt ?? new Date().toISOString(),
      });
    }

    // Ensure /chat/{id} opens for admins via existing share-by-link rules.
    const BATCH_SIZE = 400;
    for (let i = 0; i < shareWrites.length; i += BATCH_SIZE) {
      const chunk = shareWrites.slice(i, i + BATCH_SIZE);
      const shareBatch = db.batch();
      for (const item of chunk) {
        shareBatch.set(
          db.collection('sharedChatRefs').doc(item.chatId),
          {
            ownerUid: item.ownerUid,
            title: item.title,
            updatedAt: item.updatedAt,
          },
          { merge: true },
        );
      }
      try {
        await shareBatch.commit();
      } catch (error) {
        console.error('Admin chat share-ref sync failed', error);
      }
    }

    rows.sort((a, b) => {
      const aTime = a.updatedAt || a.createdAt || '';
      const bTime = b.updatedAt || b.createdAt || '';
      return bTime.localeCompare(aTime);
    });

    const chats = rows.slice(0, limit);

    return NextResponse.json({
      chats,
      count: chats.length,
      total: rows.length,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load chats.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
