import { NextResponse } from 'next/server';

import { z } from 'zod';

import { verifyBearerToken } from '@/src/lib/server/firebase-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

const bodySchema = z.object({
  kind: z.enum(['session', 'meaningful']),
});

/** Authenticated engagement pings for campaign qualification (server-only counters). */
export async function POST(request: Request) {
  try {
    const user = await verifyBearerToken(request);
    const body = bodySchema.parse(await request.json());
    await campaignsAdminService.recordEngagement(user.uid, body.kind);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to record engagement.';
    const status =
      message.includes('token') || message.includes('Authorization')
        ? 401
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
