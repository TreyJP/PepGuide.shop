'use client';

import {
  isResolvableCampaignRef,
  normalizeCampaignRef,
} from '@/src/lib/campaigns/handles';

const LOCAL_REF_KEY = 'pepguide_campaign_ref_local';
const LOCAL_CAMPAIGN_KEY = 'pepguide_campaign_id_local';

/** Capture ?ref=rylan / ?ref=PG-…&campaign=… on landing and record a click. */
export async function captureCampaignReferralFromUrl(
  searchParams: URLSearchParams,
): Promise<void> {
  if (typeof window === 'undefined') return;
  const ref = normalizeCampaignRef(
    searchParams.get('ref') || searchParams.get('code'),
  );
  if (!isResolvableCampaignRef(ref)) return;

  const campaign = searchParams.get('campaign');
  // First-touch local backup (server cookie is authoritative).
  if (!window.localStorage.getItem(LOCAL_REF_KEY)) {
    window.localStorage.setItem(LOCAL_REF_KEY, ref);
    if (campaign) window.localStorage.setItem(LOCAL_CAMPAIGN_KEY, campaign);
  }

  const utm: Record<string, string> = {};
  for (const key of [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
  ]) {
    const value = searchParams.get(key);
    if (value) utm[key] = value;
  }

  try {
    await fetch('/api/campaigns/attribute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ref,
        campaign,
        landingPage: window.location.pathname,
        utm,
      }),
      credentials: 'same-origin',
    });
  } catch {
    // best-effort
  }
}

export function peekLocalCampaignRef(): {
  ref: string | null;
  campaignId: string | null;
} {
  if (typeof window === 'undefined') {
    return { ref: null, campaignId: null };
  }
  return {
    ref: window.localStorage.getItem(LOCAL_REF_KEY),
    campaignId: window.localStorage.getItem(LOCAL_CAMPAIGN_KEY),
  };
}

/** After signup, attach campaign referral via authenticated API. */
export async function attachCampaignSignup(input: {
  idToken: string;
  email?: string;
  emailVerified?: boolean;
}): Promise<void> {
  const local = peekLocalCampaignRef();
  try {
    await fetch('/api/campaigns/attach-signup', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.idToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        email: input.email,
        emailVerified: input.emailVerified,
        ref: local.ref,
        campaignId: local.campaignId,
      }),
    });
  } catch {
    // best-effort
  }
}

/** Best-effort qualification engagement signal (meaningful PepGuide action). */
export async function recordCampaignMeaningfulAction(): Promise<void> {
  try {
    const { getFirebaseAuth } = await import('@/src/services/firebase/config');
    const token = await getFirebaseAuth()?.currentUser?.getIdToken();
    if (!token) return;
    await fetch('/api/campaigns/engagement', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ kind: 'meaningful' }),
    });
  } catch {
    // best-effort
  }
}
