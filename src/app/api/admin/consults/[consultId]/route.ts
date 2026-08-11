import { NextResponse } from 'next/server';
import { z } from 'zod';

import { tryGetAdminDb } from '@/src/lib/server/firebase-admin';
import { requireAdminUser } from '@/src/lib/server/require-admin';
import type { ProConsultMessage } from '@/src/types/consults';
import { createId } from '@/src/utils/dates';

export const runtime = 'nodejs';

const replySchema = z.object({
  body: z.string().trim().min(1).max(8000),
});

function mapMessage(
  id: string,
  consultId: string,
  data: Record<string, unknown>,
): ProConsultMessage {
  return {
    id,
    consultId,
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'PepGuide Staff'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ consultId: string }> },
) {
  try {
    await requireAdminUser(request);
    const { consultId } = await context.params;
    const db = tryGetAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase Admin is not configured.' },
        { status: 503 },
      );
    }

    const snap = await db
      .collection('proConsults')
      .doc(consultId)
      .collection('messages')
      .orderBy('createdAt', 'asc')
      .limit(200)
      .get();

    const messages = snap.docs.map((doc) =>
      mapMessage(doc.id, consultId, doc.data() as Record<string, unknown>),
    );
    return NextResponse.json({ messages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load messages.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ consultId: string }> },
) {
  try {
    const admin = await requireAdminUser(request);
    const { consultId } = await context.params;
    const db = tryGetAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase Admin is not configured.' },
        { status: 503 },
      );
    }

    const parsed = replySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid reply.' }, { status: 400 });
    }

    const consultRef = db.collection('proConsults').doc(consultId);
    const consultSnap = await consultRef.get();
    if (!consultSnap.exists) {
      return NextResponse.json({ error: 'Consult not found.' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const messageId = createId('cmsg');
    const body = parsed.data.body;
    const message = {
      body,
      authorId: admin.uid,
      authorDisplayName: 'PepGuide Staff',
      authorIsAdmin: true,
      createdAt: now,
    };

    await consultRef.collection('messages').doc(messageId).set(message);
    await consultRef.set(
      {
        status: 'answered',
        updatedAt: now,
        lastMessagePreview: body.slice(0, 160),
        messageCount: (Number(consultSnap.data()?.messageCount) || 0) + 1,
      },
      { merge: true },
    );

    return NextResponse.json({
      message: mapMessage(messageId, consultId, message),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to send reply.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ consultId: string }> },
) {
  try {
    await requireAdminUser(request);
    const { consultId } = await context.params;
    const db = tryGetAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: 'Firebase Admin is not configured.' },
        { status: 503 },
      );
    }

    const body = (await request.json()) as { status?: string };
    if (
      body.status !== 'open' &&
      body.status !== 'answered' &&
      body.status !== 'closed'
    ) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }

    await db
      .collection('proConsults')
      .doc(consultId)
      .set(
        {
          status: body.status,
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

    return NextResponse.json({ ok: true, status: body.status });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update consult.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
