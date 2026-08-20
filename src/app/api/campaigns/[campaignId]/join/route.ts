import { NextResponse } from 'next/server';

import { CAMPAIGN_TERMS_VERSION } from '@/src/constants/campaigns';
import { buildCampaignReferralUrl } from '@/src/lib/campaigns/payouts';
import { verifyBearerToken } from '@/src/lib/server/firebase-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

type Context = { params: Promise<{ campaignId: string }> };

export async function POST(request: Request, context: Context) {
  try {
    const user = await verifyBearerToken(request);
    const { campaignId } = await context.params;
    const body = (await request.json().catch(() => ({}))) as {
      termsVersion?: string;
      publicName?: string;
      vanityHandle?: string;
      acceptedRules?: boolean;
    };

    if (!body.acceptedRules) {
      return NextResponse.json(
        { error: 'You must accept the campaign rules to join.' },
        { status: 400 },
      );
    }

    if (!body.vanityHandle?.trim()) {
      return NextResponse.json(
        { error: 'Choose a creator handle for your share link (e.g. rylan).' },
        { status: 400 },
      );
    }

    const campaign = await campaignsAdminService.getCampaign(campaignId);
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found.' }, { status: 404 });
    }

    const termsVersion = body.termsVersion || campaign.termsVersion;
    const participant = await campaignsAdminService.joinCampaign({
      campaignId: campaign.id,
      userId: user.uid,
      displayName: user.email?.split('@')[0] || 'Creator',
      publicName: body.publicName,
      vanityHandle: body.vanityHandle,
      termsVersion,
    });

    const origin = new URL(request.url).origin;
    return NextResponse.json({
      participant: {
        id: participant.id,
        referralCode: participant.referralCode,
        vanityHandle: participant.vanityHandle,
        referralUrl: buildCampaignReferralUrl({
          origin,
          code: participant.referralCode,
          campaignId: campaign.id,
          vanityHandle: participant.vanityHandle,
        }),
        vanityUrl: `${origin}/ref/${participant.vanityHandle}`,
        joinedAt: participant.joinedAt,
        status: participant.status,
      },
      termsVersion: CAMPAIGN_TERMS_VERSION,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to join campaign.';
    const status =
      message.includes('token') || message.includes('Authorization')
        ? 401
        : message.includes('accept') || message.includes('not open')
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
