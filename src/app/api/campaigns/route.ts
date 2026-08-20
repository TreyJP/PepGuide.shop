import { NextResponse } from 'next/server';

import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

/** Public list of joinable / visible campaigns. */
export async function GET() {
  try {
    const campaigns = await campaignsAdminService.listPublicActiveCampaigns();
    return NextResponse.json({
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        status: c.status,
        prizePoolUsd: c.prizePoolUsd,
        payoutStructure: c.payoutStructure,
        startDate: c.startDate,
        endDate: c.endDate,
        participantCount: c.participantCount,
        qualifiedReferralCount: c.qualifiedReferralCount,
        leaderboardPublic: c.leaderboardPublic,
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to load campaigns.',
      },
      { status: 500 },
    );
  }
}
