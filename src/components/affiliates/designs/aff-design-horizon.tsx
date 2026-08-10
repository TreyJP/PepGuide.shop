'use client';

import { AffiliateEnrollForm } from '@/src/components/affiliates/designs/affiliate-enroll-form';
import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';

export function AffDesignHorizon(props: AffiliateDesignViewProps) {
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
    <div className="aff-horizon">
      <section className="aff-horizon__hero">
        <div className="aff-horizon__hero-inner">
          <p className="aff-horizon__kicker">PepGuide · Affiliates</p>
          <h1>Partner with clarity.</h1>
          <p>
            Join instantly. Earn 50% on a referred member’s first paid order,
            then 20% on every order after.
          </p>
          {affiliate ? (
            <div className="aff-horizon__actions">
              <AffCopyButton
                label="Copy referral link"
                kind="link"
                value={shareUrl}
                copied={copied}
                onCopy={onCopy}
                size="lg"
              />
              <AffCopyButton
                label="Copy code"
                kind="code"
                value={affiliate.code}
                copied={copied}
                onCopy={onCopy}
                size="lg"
                variant="secondary"
              />
            </div>
          ) : null}
        </div>
      </section>

      <div className="aff-horizon__body">
        <div className="aff-horizon__inner">
          {affiliate ? (
            <div className="aff-horizon__stats">
              <div className="aff-horizon__stat">
                <span>Code</span>
                <strong className="font-mono tracking-wide">
                  {affiliate.code}
                </strong>
              </div>
              <div className="aff-horizon__stat">
                <span>First order</span>
                <strong>{affiliate.firstOrderCommissionPercent}%</strong>
              </div>
              <div className="aff-horizon__stat">
                <span>Every order after</span>
                <strong>{affiliate.recurringCommissionPercent}%</strong>
              </div>
            </div>
          ) : (
            <div className="mx-auto mt-[-1.5rem] max-w-lg rounded-[18px] border border-border bg-white p-5 shadow-lg relative z-2">
              <AffiliateEnrollForm
                signupCode={signupCode}
                onSignupCodeChange={onSignupCodeChange}
                enrolling={enrolling}
                enrollError={enrollError}
                onEnroll={onEnroll}
              />
            </div>
          )}

          <div className="aff-horizon__rows">
            {AFFILIATE_HOW_IT_WORKS.map((item) => (
              <article key={item.step} className="aff-horizon__row">
                <em>Step {item.step}</em>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
            {AFFILIATE_BENEFITS.map((item, index) => (
              <article key={item.id} className="aff-horizon__row">
                <em>Value 0{index + 1}</em>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>

          {referredByCode ? (
            <p className="mt-8 text-sm text-foreground-secondary">
              You signed up with{' '}
              <span className="font-mono font-semibold text-foreground">
                {referredByCode}
              </span>
              .
            </p>
          ) : null}

          <div className="mt-12 max-w-2xl">
            <h2 className="mb-2 font-[family-name:var(--font-display)] text-2xl font-semibold">
              FAQ
            </h2>
            <AffFaqList />
          </div>
        </div>
      </div>
    </div>
  );
}
