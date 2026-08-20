import { NextResponse } from 'next/server';

import {
  CAMPAIGN_ID_COOKIE,
  CAMPAIGN_REF_COOKIE,
  CAMPAIGN_VISITOR_COOKIE,
  DEFAULT_ATTRIBUTION_WINDOW_DAYS,
} from '@/src/constants/campaigns';
import { createVisitorId } from '@/src/lib/campaigns/codes';
import {
  isResolvableCampaignRef,
  normalizeCampaignRef,
} from '@/src/lib/campaigns/handles';
import { campaignsAdminService } from '@/src/services/firestore/campaigns-admin';

export const runtime = 'nodejs';

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]?.trim() || null;
  return request.headers.get('x-real-ip');
}

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [k, ...rest] = part.trim().split('=');
      return [k ?? '', decodeURIComponent(rest.join('=') || '')];
    }),
  );
}

/**
 * Records a campaign referral click (analytics only) and sets first-party
 * attribution cookies. Accepts PG-XXXXXX or vanity handles (?ref=rylan).
 * Does NOT count toward the leaderboard.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      ref?: string;
      campaign?: string;
      landingPage?: string;
      utm?: Record<string, string>;
      visitorId?: string;
    };

    const code = normalizeCampaignRef(body.ref);
    if (!isResolvableCampaignRef(code)) {
      return NextResponse.json({ ok: false, reason: 'invalid_code' });
    }

    const cookies = parseCookies(request.headers.get('cookie'));
    const visitorId =
      body.visitorId ||
      cookies[CAMPAIGN_VISITOR_COOKIE] ||
      createVisitorId();

    // First-touch: do not overwrite an existing attribution cookie within window.
    const existingRef = cookies[CAMPAIGN_REF_COOKIE];
    const shouldSetAttribution = !existingRef;

    const result = await campaignsAdminService.recordVisit({
      code,
      campaignId: body.campaign ?? null,
      visitorId,
      landingPage: body.landingPage ?? null,
      ip: clientIp(request),
      userAgent: request.headers.get('user-agent'),
      country: request.headers.get('x-vercel-ip-country'),
      utm: body.utm ?? {},
    });

    const response = NextResponse.json({
      ok: true,
      visitId: result?.visitId ?? null,
      campaignId: result?.participant.campaignId ?? null,
      vanityHandle: result?.participant.vanityHandle || null,
      referralCode: result?.participant.referralCode ?? null,
      attributed: shouldSetAttribution && Boolean(result),
    });

    const maxAge = DEFAULT_ATTRIBUTION_WINDOW_DAYS * 24 * 60 * 60;
    response.cookies.set(CAMPAIGN_VISITOR_COOKIE, visitorId, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge,
    });

    if (shouldSetAttribution && result) {
      // Prefer vanity handle in cookie when present (matches share links).
      const cookieRef =
        result.participant.vanityHandle || result.participant.referralCode;
      response.cookies.set(CAMPAIGN_REF_COOKIE, cookieRef, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge,
      });
      response.cookies.set(CAMPAIGN_ID_COOKIE, result.participant.campaignId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge,
      });
      if (result.visitId) {
        response.cookies.set('pepguide_campaign_visit', result.visitId, {
          httpOnly: true,
          sameSite: 'lax',
          secure: true,
          path: '/',
          maxAge,
        });
      }
    }

    return response;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Unable to attribute visit.',
      },
      { status: 500 },
    );
  }
}
