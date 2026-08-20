import { NextResponse } from 'next/server';

import { buildCampaignReferralUrl, toPublicReferralLabel } from '@/src/lib/campaigns/payouts';
import { verifyBearerToken } from '@/src/lib/server/firebase-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

type Context = { params: Promise<{ campaignId: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const { campaignId } = await context.params;
    const campaign = await campaignsAdminService.getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    const leaderboard = campaign.leaderboardPublic
      ? await campaignsAdminService.getLeaderboard(campaign.id)
      : [];

    let me = null as null | {
      participantId: string;
      referralCode: string;
      vanityHandle: string;
      referralUrl: string;
      vanityUrl: string;
      rank: number | null;
      qualifiedReferrals: number;
      pendingReferrals: number;
      rejectedReferrals: number;
      estimatedPayoutUsd: number | null;
      status: string;
    };

    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const user = await verifyBearerToken(request);
        const participant = await campaignsAdminService.getParticipantByUser(
          campaign.id,
          user.uid,
        );
        if (participant) {
          const origin = new URL(request.url).origin;
          me = {
            participantId: participant.id,
            referralCode: participant.referralCode,
            vanityHandle: participant.vanityHandle,
            referralUrl: buildCampaignReferralUrl({
              origin,
              code: participant.referralCode,
              campaignId: campaign.id,
              vanityHandle: participant.vanityHandle,
            }),
            vanityUrl: `${origin}/ref/${participant.vanityHandle}`,
            rank: participant.rank,
            qualifiedReferrals: participant.qualifiedReferrals,
            pendingReferrals: participant.pendingReferrals,
            rejectedReferrals: participant.rejectedReferrals,
            estimatedPayoutUsd: participant.estimatedPayoutUsd,
            status: participant.status,
          };
        }
      } catch {
        // anonymous ok
      }
    }

    return NextResponse.json({
      campaign: {
        id: campaign.id,
        name: campaign.name,
        slug: campaign.slug,
        description: campaign.description,
        imageUrl: campaign.imageUrl,
        status: campaign.status,
        prizePoolUsd: campaign.prizePoolUsd,
        payoutStructure: campaign.payoutStructure,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        participantCount: campaign.participantCount,
        qualifiedReferralCount: campaign.qualifiedReferralCount,
        termsVersion: campaign.termsVersion,
        rulesMarkdown: campaign.rulesMarkdown,
        termsMarkdown: campaign.termsMarkdown,
        leaderboardPublic: campaign.leaderboardPublic,
        finalizedAt: campaign.finalizedAt,
      },
      leaderboard: leaderboard.slice(0, 100).map((row) => ({
        rank: row.rank,
        publicName: row.publicName,
        qualifiedReferrals: row.qualifiedReferrals,
        status: row.status,
        participantId: row.participantId,
        userId: row.userId,
      })),
      me,
      // label helper available for clients
      statusLabels: {
        pending: toPublicReferralLabel('pending'),
        qualified: toPublicReferralLabel('qualified'),
        fraud_review: toPublicReferralLabel('fraud_review'),
        rejected: toPublicReferralLabel('rejected'),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to load campaign.',
      },
      { status: 500 },
    );
  }
}
