'use client';

import { AffiliateEnrollForm } from '@/src/components/affiliates/designs/affiliate-enroll-form';
import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';

export function AffDesignEditorial(props: AffiliateDesignViewProps) {
  const {
    affiliate,
    referredByCode,
    shareUrl,
    copied,
    onCopy,
    signupCode,
    onSignupCodeChange,
    enrolling,
    enrollError,
    onEnroll,
  } = props;

  return (
    <div className="aff-editorial">
      <div className="aff-editorial__frame">
        <p className="aff-editorial__label">The PepGuide affiliate note</p>
        <h1>Earn for every clear introduction.</h1>
        <p className="aff-editorial__lede">
          Open to every PepGuide account. Earn 50% on a referred member’s first
          paid order, then 20% on every order after.
        </p>

        <hr className="aff-editorial__rule" />

        {affiliate ? (
          <>
            <p className="aff-editorial__label">Your terms</p>
            <div className="aff-editorial__dash">
              <div className="aff-editorial__dash-row">
                <span>Partner</span>
                <strong>{affiliate.name}</strong>
              </div>
              <div className="aff-editorial__dash-row">
                <span>Code</span>
                <strong className="font-mono tracking-wide">{affiliate.code}</strong>
              </div>
              <div className="aff-editorial__dash-row">
                <span>First order</span>
                <strong>{affiliate.firstOrderCommissionPercent}%</strong>
              </div>
              <div className="aff-editorial__dash-row">
                <span>Every order after</span>
                <strong>{affiliate.recurringCommissionPercent}%</strong>
              </div>
              <div className="aff-editorial__dash-row">
                <span>Attributed signups</span>
                <strong>{affiliate.referralCount}</strong>
              </div>
            </div>
            <div className="aff-editorial__actions">
              <AffCopyButton
                label="Copy referral link"
                kind="link"
                value={shareUrl}
                copied={copied}
                onCopy={onCopy}
              />
              <AffCopyButton
                label="Copy code"
                kind="code"
                value={affiliate.code}
                copied={copied}
                onCopy={onCopy}
                variant="secondary"
              />
            </div>
          </>
        ) : (
          <AffiliateEnrollForm
            signupCode={signupCode}
            onSignupCodeChange={onSignupCodeChange}
            enrolling={enrolling}
            enrollError={enrollError}
            onEnroll={onEnroll}
          />
        )}

        <hr className="aff-editorial__rule" />

        {AFFILIATE_HOW_IT_WORKS.map((item) => (
          <section key={item.step} className="aff-editorial__chapter">
            <h2>
              <em>{item.step}</em>
              {item.title}
            </h2>
            <p>{item.description}</p>
          </section>
        ))}

        {AFFILIATE_BENEFITS.map((item, index) => (
          <section key={item.id} className="aff-editorial__chapter">
            <h2>
              <em>0{index + 4}</em>
              {item.title}
            </h2>
            <p>{item.description}</p>
          </section>
        ))}

        {referredByCode ? (
          <>
            <hr className="aff-editorial__rule" />
            <p className="text-foreground-secondary">
              Footnote: you arrived through{' '}
              <span className="font-mono font-semibold text-foreground">
                {referredByCode}
              </span>
              .
            </p>
          </>
        ) : null}

        <hr className="aff-editorial__rule" />
        <p className="aff-editorial__label">Questions</p>
        <AffFaqList className="mt-4" />
      </div>
    </div>
  );
}
