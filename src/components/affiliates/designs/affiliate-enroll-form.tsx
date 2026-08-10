'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import {
  AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  AFFILIATE_RECURRING_COMMISSION_PERCENT,
} from '@/src/constants/referral-affiliates';

export function AffiliateEnrollForm({
  signupCode,
  onSignupCodeChange,
  enrolling,
  enrollError,
  onEnroll,
  tone = 'light',
}: {
  signupCode: string;
  onSignupCodeChange: (code: string) => void;
  enrolling: boolean;
  enrollError: string | null;
  onEnroll: () => void;
  tone?: 'light' | 'dark';
}) {
  const dark = tone === 'dark';

  return (
    <div className={dark ? 'aff-enroll aff-enroll--dark' : 'aff-enroll'}>
      <p className="aff-enroll__title">Become an affiliate</p>
      <p className="aff-enroll__copy">
        Earn{' '}
        <strong>{AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}%</strong> on each
        referred member’s first paid order, then{' '}
        <strong>{AFFILIATE_RECURRING_COMMISSION_PERCENT}%</strong> on every
        order after.
      </p>

      <div className="aff-enroll__rates">
        <div>
          <span>First order</span>
          <strong>{AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT}%</strong>
        </div>
        <div>
          <span>Every order after</span>
          <strong>{AFFILIATE_RECURRING_COMMISSION_PERCENT}%</strong>
        </div>
      </div>

      <Input
        label="Your referral code"
        value={signupCode}
        onChange={(event) =>
          onSignupCodeChange(event.target.value.toUpperCase())
        }
        placeholder="OPTIONAL — auto-generated if blank"
        autoCapitalize="characters"
        autoComplete="off"
        hint="3–32 characters. Letters, numbers, _ or -"
      />

      {enrollError ? (
        <p className="aff-enroll__error">{enrollError}</p>
      ) : null}

      <Button className="w-full" loading={enrolling} onClick={onEnroll}>
        {enrolling ? 'Creating seat…' : 'Join the affiliate program'}
      </Button>
    </div>
  );
}
