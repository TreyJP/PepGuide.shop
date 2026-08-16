'use client';

import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import { Badge } from '@/src/components/ui/badge';

export function AffDesignConsole(props: AffiliateDesignViewProps) {
  const { affiliate, referredByCode, shareUrl, copied, onCopy } = props;

  if (!affiliate) {
    return (
      <div className="aff-console">
        <header className="aff-console__bar">
          <div>
            <h1>Affiliate console</h1>
            <p>Tracked referral links for PepGuide creators</p>
          </div>
        </header>
        <div className="aff-console__shell">
          <section className="aff-console__card">
            <p className="text-sm text-foreground-secondary">
              No affiliate seat is linked to this account yet.
            </p>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="aff-console">
      <header className="aff-console__bar">
        <div>
          <h1>Affiliate console</h1>
          <p>
            {affiliate.firstOrderCommissionPercent}% first order ·{' '}
            {affiliate.recurringCommissionPercent}% every order after
          </p>
        </div>
        <Badge variant={affiliate.active ? 'success' : 'critical'}>
          {affiliate.active ? 'Live' : 'Paused'}
        </Badge>
      </header>

      <div className="aff-console__shell">
        <section className="aff-console__card">
          <h2>Performance</h2>
          <div className="aff-console__kpis">
            <div className="aff-console__kpi">
              <span>Code</span>
              <strong className="font-mono text-base tracking-wide">
                {affiliate.code}
              </strong>
            </div>
            <div className="aff-console__kpi">
              <span>Link clicks</span>
              <strong>{affiliate.clickCount}</strong>
            </div>
            <div className="aff-console__kpi">
              <span>Signups</span>
              <strong>{affiliate.referralCount}</strong>
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
        </section>

        <section className="aff-console__card aff-console__share">
          <h2>Share link</h2>
          <p className="mb-2 text-sm text-foreground-secondary">
            Use this on Instagram, TikTok, X, or your link tree. Every click is
            counted, then visitors land on signup with your code applied.
          </p>
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
