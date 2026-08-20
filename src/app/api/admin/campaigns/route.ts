import { NextResponse } from 'next/server';

import { z } from 'zod';

import { requireAdminUser } from '@/src/lib/server/require-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';
import { DEFAULT_PAYOUT_STRUCTURE } from '@/src/constants/campaigns';

export const runtime = 'nodejs';

const createSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(64),
  description: z.string().min(1).max(4000),
  imageUrl: z.string().url().optional().nullable(),
  prizePoolUsd: z.number().min(0).max(1_000_000),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
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
});

export async function GET(request: Request) {
  try {
    await requireAdminUser(request);
    const campaigns = await campaignsAdminService.listCampaigns();
    return NextResponse.json({ campaigns });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to load campaigns.';
    const status =
      message.includes('token') || message.includes('Admin') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdminUser(request);
    const body = createSchema.parse(await request.json());
    const campaign = await campaignsAdminService.createCampaign(
      {
        ...body,
        payoutStructure: body.payoutStructure ?? DEFAULT_PAYOUT_STRUCTURE,
      },
      { uid: admin.uid, email: admin.email ?? null },
    );
    return NextResponse.json({ campaign });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to create campaign.';
    const status =
      message.includes('token') || message.includes('Admin')
        ? 401
        : message.includes('slug')
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
