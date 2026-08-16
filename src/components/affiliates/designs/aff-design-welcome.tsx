'use client';

import { Handshake, Link2, Percent, ShieldCheck, Sparkles } from 'lucide-react';

import {
  AFFILIATE_BENEFITS,
  AFFILIATE_HOW_IT_WORKS,
} from '@/src/components/affiliates/designs/content';
import { AffCopyButton, AffFaqList } from '@/src/components/affiliates/designs/shared';
import type { AffiliateDesignViewProps } from '@/src/components/affiliates/designs/types';
import { Badge } from '@/src/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { BRAND } from '@/src/constants/brand';

const BENEFIT_ICONS = {
  rates: Percent,
  attribution: Link2,
  trust: ShieldCheck,
} as const;

export function AffDesignWelcome(props: AffiliateDesignViewProps) {
  const { affiliate, referredByCode, shareUrl, copied, onCopy } = props;

  return (
    <div className="aff-welcome">
      <section className="aff-welcome__hero">
        <div className="aff-welcome__hero-inner">
          <Badge variant="accent">PepGuide partner program</Badge>
          <div className="aff-welcome__icon">
            <Handshake className="size-6" />
          </div>
          <h1>Grow with PepGuide.</h1>
          <p>
            Earn 50% on a referred member’s first paid order, then 20% on every
            order after — with a tracked /r/CODE share link.
          </p>
        </div>
      </section>

      <section className="aff-welcome__band">
        <div className="aff-welcome__inner mx-auto max-w-xl">
          {affiliate ? (
            <>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Badge variant="accent" className="mb-3">
                    Your dashboard
                  </Badge>
                  <h2>{affiliate.name}</h2>
                </div>
                <Badge variant={affiliate.active ? 'success' : 'critical'}>
                  {affiliate.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="aff-welcome__grid-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Referral code</CardDescription>
                    <CardTitle className="font-mono text-2xl tracking-wide">
                      {affiliate.code}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Link clicks</CardDescription>
                    <CardTitle className="text-2xl">
                      {affiliate.clickCount}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Signups</CardDescription>
                    <CardTitle className="text-2xl">
                      {affiliate.referralCount}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <div className="aff-welcome__grid-3 mt-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>First order</CardDescription>
                    <CardTitle className="text-2xl">
                      {affiliate.firstOrderCommissionPercent}%
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Every order after</CardDescription>
                    <CardTitle className="text-2xl">
                      {affiliate.recurringCommissionPercent}%
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>
              <Card className="mt-4 overflow-hidden">
                <CardHeader className="border-b border-border bg-surface-secondary/50 pb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-accent" />
                    <CardTitle className="text-sm">Referral link</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <code className="min-w-0 flex-1 truncate rounded-[14px] border border-border bg-surface-elevated px-4 py-3 text-xs text-foreground-secondary sm:text-sm">
                    {shareUrl}
                  </code>
                  <AffCopyButton
                    label="Copy link"
                    kind="link"
                    value={shareUrl}
                    copied={copied}
                    onCopy={onCopy}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-foreground-secondary">
                  Affiliate seats are provisioned by PepGuide. Once your account
                  is linked, your /r/CODE share link and tracking appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <section className="aff-welcome__section">
        <div className="aff-welcome__inner">
          <div className="mb-10 text-center">
            <h2>How it works</h2>
          </div>
          <div className="aff-welcome__grid-3">
            {AFFILIATE_HOW_IT_WORKS.map((item) => (
              <Card key={item.step}>
                <CardHeader>
                  <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                    Step {item.step}
                  </span>
                  <CardTitle className="mt-2">{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="aff-welcome__band">
        <div className="aff-welcome__inner">
          <h2>Why partners choose PepGuide</h2>
          <div className="aff-welcome__grid-3">
            {AFFILIATE_BENEFITS.map((item) => {
              const Icon = BENEFIT_ICONS[item.id];
              return (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-[12px] bg-accent-muted text-accent">
                      <Icon className="size-5" />
                    </div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {referredByCode ? (
        <section className="aff-welcome__section !py-12">
          <div className="mx-auto max-w-3xl rounded-[18px] border border-border bg-surface px-6 py-8 text-center">
            <p className="text-sm text-foreground-secondary">
              You joined PepGuide with referral code
            </p>
            <p className="mt-2 font-mono text-xl font-semibold tracking-wide">
              {referredByCode}
            </p>
          </div>
        </section>
      ) : null}

      <section className="aff-welcome__band">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-center">Frequently asked questions</h2>
          <AffFaqList />
        </div>
      </section>

      <section className="aff-welcome__section">
        <div className="aff-welcome__inner">
          <div className="aff-welcome__cta">
            <Handshake className="mx-auto mb-4 size-8 text-accent" />
            <h2>
              {affiliate
                ? 'Ready to share your link?'
                : 'Seats provisioned by PepGuide'}
            </h2>
            <div className="mt-8 flex justify-center">
              {affiliate ? (
                <AffCopyButton
                  label="Copy referral link"
                  kind="link"
                  value={shareUrl}
                  copied={copied}
                  onCopy={onCopy}
                  size="lg"
                />
              ) : (
                <p className="max-w-md text-sm text-foreground-secondary">
                  PepGuide links creator accounts to affiliate seats. Your share
                  link will appear here when provisioned.
                </p>
              )}
            </div>
            <p className="mt-6 text-xs text-foreground-secondary">{BRAND.notice}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
