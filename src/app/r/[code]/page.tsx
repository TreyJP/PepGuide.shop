'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

import { normalizeReferralCode } from '@/src/lib/referral-code';
import { referralAffiliatesRepository } from '@/src/services/firestore/referral-affiliates';

type ReferralRedirectPageProps = {
  params: Promise<{ code: string }>;
};

/**
 * Public tracked share URL for creator link trees / socials.
 * Records a click (best-effort), then sends visitors to signup with ?ref=.
 */
export default function ReferralRedirectPage({
  params,
}: ReferralRedirectPageProps) {
  const { code: rawCode } = use(params);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const code = normalizeReferralCode(rawCode);
      let destination = '/sign-up';

      if (code) {
        destination = `/sign-up?ref=${encodeURIComponent(code)}`;
        try {
          const affiliate =
            await referralAffiliatesRepository.resolveActiveCode(code);
          if (affiliate && !cancelled) {
            await referralAffiliatesRepository.recordReferralClick({
              affiliateId: affiliate.id,
              code: affiliate.code,
              userAgent:
                typeof navigator !== 'undefined' ? navigator.userAgent : null,
              referrer:
                typeof document !== 'undefined' ? document.referrer || null : null,
            });
          }
        } catch (error) {
          console.error('Referral click tracking failed; continuing', error);
        }
      }

      if (!cancelled) {
        router.replace(destination);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rawCode, router]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 text-center">
      <p className="text-sm text-foreground-secondary">Opening PepGuide…</p>
    </div>
  );
}
