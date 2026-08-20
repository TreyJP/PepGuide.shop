'use client';

import { useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

import {
  isResolvableCampaignRef,
  normalizeCampaignRef,
} from '@/src/lib/campaigns/handles';

type Props = {
  params: Promise<{ handle: string }>;
};

/**
 * Clean creator share URL: /ref/rylan → home with attribution.
 * Records the click server-side via /api/campaigns/attribute.
 */
function RefRedirectInner({ handle }: { handle: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ref = normalizeCampaignRef(handle);
      const campaign = searchParams.get('campaign');

      if (isResolvableCampaignRef(ref)) {
        try {
          await fetch('/api/campaigns/attribute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({
              ref,
              campaign,
              landingPage: `/ref/${ref}`,
            }),
          });
        } catch {
          // best-effort click tracking
        }

        if (!cancelled) {
          // First-touch local backup for signup attach.
          if (!window.localStorage.getItem('pepguide_campaign_ref_local')) {
            window.localStorage.setItem('pepguide_campaign_ref_local', ref);
            if (campaign) {
              window.localStorage.setItem(
                'pepguide_campaign_id_local',
                campaign,
              );
            }
          }
        }
      }

      if (!cancelled) {
        const dest = new URLSearchParams();
        if (ref) dest.set('ref', ref);
        if (campaign) dest.set('campaign', campaign);
        const qs = dest.toString();
        router.replace(qs ? `/?${qs}` : '/');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [handle, router, searchParams]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
      <p className="text-sm text-foreground-secondary">Opening PepGuide…</p>
    </div>
  );
}

export default function CreatorRefRedirectPage({ params }: Props) {
  const { handle } = use(params);
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
          <p className="text-sm text-foreground-secondary">Opening PepGuide…</p>
        </div>
      }
    >
      <RefRedirectInner handle={handle} />
    </Suspense>
  );
}
