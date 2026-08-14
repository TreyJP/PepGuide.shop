import { NextResponse } from 'next/server';
import { z } from 'zod';

import { generateAdminReplyDraft } from '@/src/lib/server/admin-reply-draft';
import { requireAdminUser } from '@/src/lib/server/require-admin';

export const runtime = 'nodejs';

const messageSchema = z.object({
  role: z.enum(['member', 'admin']),
  authorLabel: z.string().trim().max(120).optional(),
  content: z.string().trim().min(1).max(8000),
});

const bodySchema = z.object({
  title: z.string().trim().max(300).optional(),
  body: z.string().trim().max(8000).optional(),
  messages: z.array(messageSchema).max(40).optional(),
  focusLabel: z.string().trim().max(200).optional(),
});

export async function POST(request: Request) {
  try {
    await requireAdminUser(request);
    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request for AI reply draft.' },
        { status: 400 },
      );
    }

    const { title, body, messages, focusLabel } = parsed.data;
    if (!title?.trim() && !body?.trim() && !(messages && messages.length > 0)) {
      return NextResponse.json(
        { error: 'Provide discussion context to draft a reply.' },
        { status: 400 },
      );
    }

    const draft = await generateAdminReplyDraft({
      title,
      body,
      messages,
      focusLabel,
    });
    return NextResponse.json({ draft });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to generate AI reply.';
    const statusCode =
      message.includes('token') || message.includes('Admin access')
        ? 401
        : message.includes('OpenAI')
          ? 503
          : 500;
    return NextResponse.json({ error: message }, { status: statusCode });
  }
}
