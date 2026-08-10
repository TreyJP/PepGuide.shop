'use client';

import { AffiliateEnrollForm } from '@/src/components/affiliates/designs/affiliate-enroll-form';
import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import { Badge } from '@/src/components/ui/badge';

export function AffDesignConsole(props: AffiliateDesignViewProps) {
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
    <div className="aff-console">
      <header className="aff-console__bar">
        <div>
          <h1>Affiliate console</h1>
          <p>50% first order · 20% every order after</p>
        </div>
        {affiliate ? (
          <Badge variant={affiliate.active ? 'success' : 'critical'}>
            {affiliate.active ? 'Live' : 'Paused'}
          </Badge>
        ) : (
          <Badge variant="accent">Open enrollment</Badge>
        )}
      </header>

      <div className="aff-console__shell">
        <section className="aff-console__card">
          <h2>{affiliate ? 'Performance' : 'Join'}</h2>
          {affiliate ? (
            <>
              <div className="aff-console__kpis">
                <div className="aff-console__kpi">
                  <span>Code</span>
                  <strong className="font-mono text-base tracking-wide">
                    {affiliate.code}
                  </strong>
                </div>
                <div className="aff-console__kpi">
                  <span>First order</span>
                  <strong>{affiliate.firstOrderCommissionPercent}%</strong>
                </div>
                <div className="aff-console__kpi">
                  <span>After</span>
                  <strong>{affiliate.recurringCommissionPercent}%</strong>
                </div>
              </div>
              <p className="mt-3 text-sm text-foreground-secondary">
                {affiliate.referralCount} attributed signup
                {affiliate.referralCount === 1 ? '' : 's'}
              </p>
            </>
          ) : (
            <div className="mt-3">
              <AffiliateEnrollForm
                signupCode={signupCode}
                onSignupCodeChange={onSignupCodeChange}
                enrolling={enrolling}
                enrollError={enrollError}
                onEnroll={onEnroll}
              />
            </div>
          )}
        </section>

        <section className="aff-console__card aff-console__share">
          <h2>Share</h2>
          {affiliate ? (
            <>
              <code>{shareUrl}</code>
              <div className="flex flex-wrap gap-2">
                <AffCopyButton
                  label="Copy link"
                  kind="link"
                  value={shareUrl}
                  copied={copied}
                  onCopy={onCopy}
                  size="sm"
                />
                <AffCopyButton
                  label="Copy code"
                  kind="code"
                  value={affiliate.code}
                  copied={copied}
                  onCopy={onCopy}
                  size="sm"
                  variant="secondary"
                />
              </div>
            </>
          ) : (
            <div className="aff-console__placeholder">
              Your `/sign-up?ref=CODE` link appears here after you join.
            </div>
          )}
        </section>

        <section className="aff-console__card">
          <h2>Workflow</h2>
          <ol className="aff-console__list">
            {AFFILIATE_HOW_IT_WORKS.map((item) => (
              <li key={item.step}>
                <span className="aff-console__num">
                  {item.step.replace('0', '')}
                </span>
                <div>
                  <b>{item.title}</b>
                  {item.description}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="aff-console__card">
          <h2>Why it works</h2>
          <ol className="aff-console__list">
            {AFFILIATE_BENEFITS.map((item, index) => (
              <li key={item.id}>
                <span className="aff-console__num">{index + 1}</span>
                <div>
                  <b>{item.title}</b>
                  {item.description}
                </div>
              </li>
            ))}
          </ol>
          {referredByCode ? (
            <p className="mt-4 rounded-[10px] border border-border bg-slate-50 px-3 py-2 text-xs text-foreground-secondary">
              Joined via{' '}
              <span className="font-mono font-semibold text-foreground">
                {referredByCode}
              </span>
            </p>
          ) : null}
        </section>

        <section className="aff-console__card aff-console__faq">
          <h2>FAQ</h2>
          <AffFaqList className="mt-1" />
        </section>
      </div>
    </div>
  );
}
