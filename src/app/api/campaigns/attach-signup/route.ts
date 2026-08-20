import { NextResponse } from 'next/server';

import {
  CAMPAIGN_ID_COOKIE,
  CAMPAIGN_REF_COOKIE,
} from '@/src/constants/campaigns';
import {
  isResolvableCampaignRef,
  normalizeCampaignRef,
} from '@/src/lib/campaigns/handles';
import { verifyBearerToken } from '@/src/lib/server/firebase-admin';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [k, ...rest] = part.trim().split('=');
      return [k ?? '', decodeURIComponent(rest.join('=') || '')];
    }),
  );
}

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return request.headers.get('x-real-ip');
}

/**
 * Called after account creation to attach campaign referral attribution.
 * Accepts PG-XXXXXX or vanity handles (rylan, trey, …).
 */
export async function POST(request: Request) {
  try {
    const user = await verifyBearerToken(request);
    const body = (await request.json().catch(() => ({}))) as {
      email?: string;
      emailVerified?: boolean;
      ref?: string;
      campaignId?: string;
      visitId?: string;
      visitorId?: string;
    };

    const cookies = parseCookies(request.headers.get('cookie'));
    const code = normalizeCampaignRef(
      body.ref || cookies[CAMPAIGN_REF_COOKIE],
    );
    if (!isResolvableCampaignRef(code)) {
      return NextResponse.json({ ok: false, reason: 'no_campaign_ref' });
    }

    const referral = await campaignsAdminService.attributeSignup({
      referredUserId: user.uid,
      email: body.email ?? user.email ?? null,
      emailVerified: Boolean(body.emailVerified),
      referralCode: code,
      campaignId: body.campaignId ?? cookies[CAMPAIGN_ID_COOKIE] ?? null,
      visitorId: body.visitorId ?? cookies.pepguide_visitor_id ?? null,
      visitId: body.visitId ?? cookies.pepguide_campaign_visit ?? null,
      ip: clientIp(request),
      userAgent: request.headers.get('user-agent'),
    });

    return NextResponse.json({
      ok: Boolean(referral),
      referralId: referral?.id ?? null,
      status: referral?.status ?? null,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to attach referral.';
    const status = message.includes('token') ? 401 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
