import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requireAdminUser } from '@/src/lib/server/require-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

type Context = { params: Promise<{ campaignId: string }> };

const patchSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  slug: z.string().min(2).max(64).optional(),
  description: z.string().min(1).max(4000).optional(),
  imageUrl: z.string().url().optional().nullable(),
  prizePoolUsd: z.number().min(0).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z
    .enum(['draft', 'active', 'paused', 'ending_review', 'finalized'])
    .optional(),
  attributionWindowDays: z.number().int().min(1).max(90).optional(),
  maxParticipants: z.number().int().min(1).optional().nullable(),
  leaderboardPublic: z.boolean().optional(),
  termsMarkdown: z.string().optional(),
  rulesMarkdown: z.string().optional(),
  payoutStructure: z.any().optional(),
  qualificationRules: z.record(z.any()).optional(),
  action: z
    .enum([
      'launch',
      'pause',
      'end_review',
      'finalize',
      'run_fraud_audit',
      'recalculate_ranks',
    ])
    .optional(),
});

export async function GET(request: Request, context: Context) {
  try {
    await requireAdminUser(request);
    const { campaignId } = await context.params;
    const campaign = await campaignsAdminService.getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const [participants, leaderboard, fraudQueue] = await Promise.all([
      campaignsAdminService.listParticipants(campaign.id),
      campaignsAdminService.getLeaderboard(campaign.id),
      campaignsAdminService.listFraudQueue(campaign.id),
    ]);
    return NextResponse.json({
      campaign,
      participants,
      leaderboard,
      fraudQueue,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load campaign.';
    const status =
      message.includes('token') || message.includes('Admin') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const admin = await requireAdminUser(request);
    const { campaignId } = await context.params;
    const body = patchSchema.parse(await request.json());

    if (body.action === 'finalize') {
      const campaign = await campaignsAdminService.finalizeCampaign(
        campaignId,
        { uid: admin.uid, email: admin.email ?? null },
      );
      return NextResponse.json({ campaign });
    }
    if (body.action === 'run_fraud_audit') {
      const changed =
        await campaignsAdminService.runPendingQualificationSweep(campaignId);
      await campaignsAdminService.recalculateRanks(campaignId);
      return NextResponse.json({ ok: true, reevaluated: changed });
    }
    if (body.action === 'recalculate_ranks') {
      await campaignsAdminService.recalculateRanks(campaignId);
      return NextResponse.json({ ok: true });
    }

    const statusMap = {
      launch: 'active',
      pause: 'paused',
      end_review: 'ending_review',
    } as const;

    const status =
      body.action && body.action in statusMap
        ? statusMap[body.action as keyof typeof statusMap]
        : body.status;

    const campaign = await campaignsAdminService.updateCampaign(
      campaignId,
      { ...body, status },
      { uid: admin.uid, email: admin.email ?? null },
    );
    return NextResponse.json({ campaign });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to update campaign.';
    const status =
      message.includes('token') || message.includes('Admin') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
