import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requireAdminUser } from '@/src/lib/server/require-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

type Context = { params: Promise<{ campaignId: string }> };

const actionSchema = z.object({
  action: z.enum([
    'approve_referral',
    'reject_referral',
    'ban_participant',
    'remove_participant',
    'mark_safe_participant',
  ]),
  referralId: z.string().optional(),
  participantId: z.string().optional(),
  reason: z.string().max(500).optional(),
});

export async function GET(request: Request, context: Context) {
  try {
    await requireAdminUser(request);
    const { campaignId } = await context.params;
    const fraudQueue = await campaignsAdminService.listFraudQueue(campaignId);
    return NextResponse.json({ fraudQueue });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load fraud queue.';
    const status =
      message.includes('token') || message.includes('Admin') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const admin = await requireAdminUser(request);
    const { campaignId } = await context.params;
    const body = actionSchema.parse(await request.json());
    const adminUser = { uid: admin.uid, email: admin.email ?? null };

    if (body.action === 'approve_referral') {
      if (!body.referralId) {
        return NextResponse.json(
          { error: 'referralId required' },
          { status: 400 },
        );
      }
      const referral = await campaignsAdminService.approveReferral(
        body.referralId,
        adminUser,
      );
      return NextResponse.json({ referral });
    }

    if (body.action === 'reject_referral') {
      if (!body.referralId) {
        return NextResponse.json(
          { error: 'referralId required' },
          { status: 400 },
        );
      }
      const referral = await campaignsAdminService.markRejected(
        body.referralId,
        adminUser,
        body.reason,
      );
      return NextResponse.json({ referral });
    }

    if (!body.participantId) {
      return NextResponse.json(
        { error: 'participantId required' },
        { status: 400 },
      );
    }

    const status =
      body.action === 'ban_participant'
        ? 'banned'
        : body.action === 'remove_participant'
          ? 'removed'
          : 'active';

    const participant = await campaignsAdminService.setParticipantStatus(
      body.participantId,
      status,
      adminUser,
    );
    void campaignId;
    return NextResponse.json({ participant });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to process action.';
    const status =
      message.includes('token') || message.includes('Admin') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
