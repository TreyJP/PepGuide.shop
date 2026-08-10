'use client';

import { Loader2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AffDesignConsole } from '@/src/components/affiliates/designs/aff-design-console';
import { AffDesignEditorial } from '@/src/components/affiliates/designs/aff-design-editorial';
import { AffDesignHorizon } from '@/src/components/affiliates/designs/aff-design-horizon';
import { AffDesignSplit } from '@/src/components/affiliates/designs/aff-design-split';
import { AffDesignWelcome } from '@/src/components/affiliates/designs/aff-design-welcome';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import '@/src/components/affiliates/affiliates-designs.css';
import {
  AFFILIATE_DESIGNS,
  type AffiliateDesignId,
} from '@/src/constants/affiliate-designs';
import { normalizeReferralCode } from '@/src/lib/referral-code';
import {
  referralAffiliatesRepository,
  suggestAffiliateCode,
} from '@/src/services/firestore/referral-affiliates';
import { useAffiliateDesignStore } from '@/src/stores/affiliate-design-store';
import { useAuthStore } from '@/src/stores/auth-store';
import type { ReferralAffiliate } from '@/src/types/referral-affiliates';

function DesignView({
  designId,
  ...props
}: { designId: AffiliateDesignId } & AffiliateDesignViewProps) {
  switch (designId) {
    case 'horizon':
      return <AffDesignHorizon {...props} />;
    case 'split':
      return <AffDesignSplit {...props} />;
    case 'editorial':
      return <AffDesignEditorial {...props} />;
    case 'console':
      return <AffDesignConsole {...props} />;
    case 'welcome':
    default:
      return <AffDesignWelcome {...props} />;
  }
}

export function AffiliatesWorkspace() {
  const user = useAuthStore((state) => state.user);
  const designId = useAffiliateDesignStore((state) => state.designId);
  const setDesignId = useAffiliateDesignStore((state) => state.setDesignId);

  const [affiliate, setAffiliate] = useState<ReferralAffiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'link' | 'code' | null>(null);
  const [signupCode, setSignupCode] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAffiliate(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const linked = await referralAffiliatesRepository.getByLinkedUserId(
          user.id,
        );
        if (!cancelled) {
          setAffiliate(linked);
          if (!linked) {
            setSignupCode(suggestAffiliateCode(user.displayName));
          }
        }
      } catch {
        if (!cancelled) setAffiliate(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const shareUrl = useMemo(() => {
    if (!affiliate || typeof window === 'undefined') return '';
    return `${window.location.origin}/sign-up?ref=${encodeURIComponent(affiliate.code)}`;
  }, [affiliate]);

  const onCopy = async (value: string, kind: 'link' | 'code') => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1400);
    } catch {
      // ignore
    }
  };

  const onEnroll = async () => {
    if (!user) {
      setEnrollError('Sign in to join the affiliate program.');
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    try {
      const created = await referralAffiliatesRepository.enrollSelf({
        userId: user.id,
        displayName: user.displayName,
        email: user.email,
        code: normalizeReferralCode(signupCode) || undefined,
      });
      setAffiliate(created);
    } catch (error) {
      setEnrollError(
        error instanceof Error
          ? error.message
          : 'Unable to create your affiliate seat.',
      );
    } finally {
      setEnrolling(false);
    }
  };

  const resolvedDesignId = AFFILIATE_DESIGNS.some(
    (design) => design.id === designId,
  )
    ? designId
    : 'split';

  const activeBlurb =
    AFFILIATE_DESIGNS.find((design) => design.id === resolvedDesignId)?.blurb ??
    '';

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Loading affiliate…
      </div>
    );
  }

  const viewProps: AffiliateDesignViewProps = {
    affiliate,
    referredByCode: user?.referredByCode ?? null,
    shareUrl,
    copied,
    onCopy,
    signupCode,
    onSignupCodeChange: setSignupCode,
    enrolling,
    enrollError,
    onEnroll,
  };

  return (
    <div className="aff-root">
      <div className="aff-picker">
        <label>
          Design
          <select
            value={resolvedDesignId}
            onChange={(event) =>
              setDesignId(event.target.value as AffiliateDesignId)
            }
            aria-label="Affiliates page design"
          >
            {AFFILIATE_DESIGNS.map((design) => (
              <option key={design.id} value={design.id}>
                {design.label}
              </option>
            ))}
          </select>
        </label>
        <span>{activeBlurb}</span>
      </div>

      <div className="aff-scroll">
        <DesignView
          key={resolvedDesignId}
          designId={resolvedDesignId}
          {...viewProps}
        />
      </div>
    </div>
  );
}
