'use client';

import { Sparkles } from 'lucide-react';

import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import { BRAND } from '@/src/constants/brand';

export function AffDesignSplit(props: AffiliateDesignViewProps) {
  const { affiliate, referredByCode, shareUrl, copied, onCopy } = props;

  return (
    <div className="aff-split">
      <section className="aff-split__hero">
        <div className="aff-split__atmosphere" aria-hidden />

        <div className="aff-split__copy aff-split__reveal">
          <div className="aff-split__eyebrow">
            <span className="aff-split__eyebrow-line" />
            <span>PepGuide affiliate program</span>
          </div>
          <h1>
            Your code.
            <br />
            Their signup.
            <br />
            <em>Real commission.</em>
          </h1>
          <p>
            Earn 50% on a referred member’s first paid order, then 20% on every
            order after — with a personal /r/CODE link you control.
          </p>
          {referredByCode ? (
            <p className="aff-split__joined">
              You arrived through <span>{referredByCode}</span>
            </p>
          ) : (
            <p className="aff-split__fine">{BRAND.notice}</p>
          )}
        </div>

        <div className="aff-split__panel aff-split__reveal aff-split__reveal--delay">
          <div className="aff-split__panel-glow" aria-hidden />
          <div className="aff-split__panel-head">
            <div>
              <p className="aff-split__panel-kicker">Partner seat</p>
              <strong>{affiliate?.name ?? 'Creator seats'}</strong>
            </div>
            <span
              className={
                affiliate?.active
                  ? 'aff-split__status aff-split__status--live'
                  : affiliate
                    ? 'aff-split__status aff-split__status--paused'
                    : 'aff-split__status'
              }
            >
              {affiliate?.active
                ? 'Live'
                : affiliate
                  ? 'Paused'
                  : 'Invite'}
            </span>
          </div>

          {affiliate ? (
            <>
              <div className="aff-split__metrics">
                <div className="aff-split__metric">
                  <span>Code</span>
                  <strong className="aff-split__code">{affiliate.code}</strong>
                </div>
                <div className="aff-split__metric aff-split__metric--accent">
                  <span>First order</span>
                  <strong>{affiliate.firstOrderCommissionPercent}%</strong>
                </div>
                <div className="aff-split__metric">
                  <span>After</span>
                  <strong>{affiliate.recurringCommissionPercent}%</strong>
                </div>
              </div>
              <p className="aff-split__signup-count">
                {affiliate.clickCount} click
                {affiliate.clickCount === 1 ? '' : 's'} ·{' '}
                {affiliate.referralCount} attributed signup
                {affiliate.referralCount === 1 ? '' : 's'}
              </p>

              <div className="aff-split__link-box">
                <div className="aff-split__link-label">
                  <Sparkles className="size-3.5" />
                  Signature referral link
                </div>
                <code>{shareUrl}</code>
                <div className="aff-split__link-actions">
                  <AffCopyButton
                    label="Copy link"
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
              </div>
            </>
          ) : (
            <p className="text-sm text-foreground-secondary">
              Affiliate seats are provisioned by PepGuide. Once your account is
              linked, your /r/CODE share link and tracking appear here.
            </p>
          )}
        </div>
      </section>

      <section className="aff-split__strip">
        {AFFILIATE_BENEFITS.map((item, index) => (
          <article key={item.id}>
            <span className="aff-split__strip-num">0{index + 1}</span>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </section>

      <section className="aff-split__body">
        <div className="aff-split__section-head">
          <p className="aff-split__eyebrow-inline">The pathway</p>
          <h2>How partnership works</h2>
        </div>
        <div className="aff-split__steps">
          {AFFILIATE_HOW_IT_WORKS.map((item) => (
            <article key={item.step} className="aff-split__step">
              <span className="aff-split__step-num" aria-hidden>
                {item.step}
              </span>
              <span className="aff-split__step-label">Step {item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>

        <div className="aff-split__faq">
          <div className="aff-split__section-head aff-split__section-head--center">
            <p className="aff-split__eyebrow-inline">Details</p>
            <h2>Frequently asked</h2>
          </div>
          <AffFaqList />
        </div>
      </section>
    </div>
  );
}
