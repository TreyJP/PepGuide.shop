'use client';

import { Check, Copy, Loader2, Trophy } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import '@/src/components/campaigns/campaigns.css';
import { Button } from '@/src/components/ui/button';
import { Checkbox } from '@/src/components/ui/checkbox';
import { CAMPAIGN_RULE_SECTIONS } from '@/src/constants/campaigns';
import { normalizeVanityHandle } from '@/src/lib/campaigns/handles';
import { formatCountdown } from '@/src/lib/campaigns/payouts';
import { cn } from '@/src/lib/utils';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

type CampaignDetail = {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  prizePoolUsd: number;
  startDate: string;
  endDate: string;
  participantCount: number;
  qualifiedReferralCount: number;
  termsVersion: string;
  rulesMarkdown: string;
  payoutStructure: {
    mode: string;
    places?: Record<string, number>;
    sharedBand?: { from: number; to: number; eachUsd: number };
  };
};

type LeaderboardRow = {
  rank: number;
  publicName: string;
  qualifiedReferrals: number;
  participantId: string;
  userId: string;
};

type MeState = {
  participantId: string;
  referralCode: string;
  vanityHandle: string;
  referralUrl: string;
  vanityUrl: string;
  rank: number | null;
  qualifiedReferrals: number;
  pendingReferrals: number;
  rejectedReferrals: number;
  estimatedPayoutUsd: number | null;
  status: string;
};

function formatMoney(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in required.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function CampaignDetailWorkspace({
  campaignId,
}: {
  campaignId: string;
}) {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<MeState | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [vanityHandle, setVanityHandle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<'main' | 'short' | null>(null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (user?.displayName && !vanityHandle) {
      setVanityHandle(normalizeVanityHandle(user.displayName));
    }
  }, [user?.displayName, vanityHandle]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: HeadersInit = {};
      const token = await getFirebaseAuth()?.currentUser?.getIdToken();
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`/api/campaigns/${campaignId}`, { headers });
      const data = (await response.json()) as {
        campaign?: CampaignDetail;
        leaderboard?: LeaderboardRow[];
        me?: MeState | null;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Unable to load campaign.');
      setCampaign(data.campaign ?? null);
      setLeaderboard(data.leaderboard ?? []);
      setMe(data.me ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load campaign.');
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    void load();
  }, [load, user?.id]);

  const countdown = useMemo(
    () => (campaign ? formatCountdown(campaign.endDate) : null),
    [campaign],
  );

  const maxFunnel = Math.max(
    me?.qualifiedReferrals ?? 1,
    me?.pendingReferrals ?? 1,
    1,
  );

  const join = async () => {
    if (!user) {
      openSignInModal('Sign in to join this PepGuide campaign.');
      return;
    }
    if (!acceptedRules) {
      setError('Accept the campaign rules to join.');
      return;
    }
    if (!normalizeVanityHandle(vanityHandle)) {
      setError('Pick a creator handle like rylan or trey.');
      return;
    }
    setJoining(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/campaigns/${campaignId}/join`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          acceptedRules: true,
          termsVersion: campaign?.termsVersion,
          publicName: user.displayName,
          vanityHandle,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Unable to join.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to join.');
    } finally {
      setJoining(false);
    }
  };

  const copyLink = async (kind: 'main' | 'short') => {
    const value = kind === 'short' ? me?.vanityUrl : me?.referralUrl;
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1600);
  };

  if (loading) {
    return (
      <div className="campaigns-root campaigns-root--vault flex items-center justify-center gap-2 py-20 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Opening campaign…
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
          Campaign not found
        </h1>
        <Link
          href="/campaigns"
          className="mt-4 inline-block text-accent hover:underline"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div
      className="campaigns-root campaigns-root--vault mx-auto max-w-5xl space-y-5 p-4 sm:p-6"
      data-design="vault"
    >
      <div className="campaigns-hero campaigns-hero--vault">
        <p className="campaigns-hero__eyebrow">
          {campaign.status === 'active' ? 'Prize vault · open' : campaign.status}
        </p>
        <h1 className="campaigns-hero__title">{campaign.name}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75">
          {campaign.description}
        </p>
        <p className="campaigns-hero__prize">
          {formatMoney(campaign.prizePoolUsd)}
          <span className="campaigns-hero__prize-label">Prize pool</span>
        </p>
        {countdown ? (
          <div className="campaigns-hero__countdown">
            {(
              [
                ['days', countdown.days],
                ['hours', countdown.hours],
                ['minutes', countdown.minutes],
                ['seconds', countdown.seconds],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="campaigns-hero__tick">
                <strong>{String(value).padStart(2, '0')}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>
        ) : null}

        {me ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <HeroStat label="Your rank" value={me.rank ? `#${me.rank}` : '—'} />
            <HeroStat
              label="Qualified"
              value={me.qualifiedReferrals.toLocaleString()}
            />
            <HeroStat
              label="Estimated prize"
              value={
                me.estimatedPayoutUsd != null
                  ? formatMoney(me.estimatedPayoutUsd)
                  : '—'
              }
            />
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-[12px] border border-critical/30 bg-critical-muted px-3 py-2 text-sm text-critical">
          {error}
        </p>
      ) : null}

      {me ? (
        <section className="camp-panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="camp-panel__title">Your campaign dashboard</h2>
              <p className="mt-1 text-sm text-foreground-secondary">
                @{me.vanityHandle || 'creator'} ·{' '}
                <span className="font-mono text-foreground">{me.referralCode}</span>
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void copyLink('main')}>
                {copied === 'main' ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === 'main' ? 'Copied' : 'Copy link'}
              </Button>
              <Button variant="secondary" onClick={() => void copyLink('short')}>
                {copied === 'short' ? (
                  <Check className="size-4" />
                ) : (
                  <Copy className="size-4" />
                )}
                {copied === 'short' ? 'Copied' : 'Copy /ref link'}
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">
            <div className="space-y-3">
              <p className="camp-link-box">{me.referralUrl}</p>
              {me.vanityUrl ? (
                <p className="camp-link-box">{me.vanityUrl}</p>
              ) : null}
              <div className="grid gap-2 sm:grid-cols-3">
                <MiniStat label="Pending" value={me.pendingReferrals} />
                <MiniStat label="Qualified" value={me.qualifiedReferrals} />
                <MiniStat label="Rejected" value={me.rejectedReferrals} />
              </div>
              <div className="campaign-funnel mt-2">
                {(
                  [
                    ['Pending', me.pendingReferrals],
                    ['Qualified', me.qualifiedReferrals],
                    ['Rejected', me.rejectedReferrals],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="campaign-funnel__row">
                    <span className="text-xs text-foreground-secondary">{label}</span>
                    <div className="campaign-funnel__bar">
                      <div
                        className="campaign-funnel__fill"
                        style={{
                          width: `${Math.max(4, (value / maxFunnel) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold tabular-nums text-foreground">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-foreground-secondary">
                Only <strong className="text-foreground">qualified</strong>{' '}
                referrals count on the leaderboard and toward prize estimates.
              </p>
            </div>
            <div className="campaign-qr">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=132x132&data=${encodeURIComponent(me.vanityUrl || me.referralUrl)}`}
                alt="Referral QR code"
                width={132}
                height={132}
              />
            </div>
          </div>
        </section>
      ) : (
        <section className="camp-panel">
          <h2 className="camp-panel__title">Join this campaign</h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Claim a short creator handle so people can find you at{' '}
            <span className="font-mono text-foreground">
              pepguide.shop/ref/yourname
            </span>
            .
          </p>
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium text-foreground">
              Your creator handle
            </p>
            <div className="campaign-handle-field">
              <span>pepguide.shop/ref/</span>
              <input
                value={vanityHandle}
                onChange={(e) =>
                  setVanityHandle(normalizeVanityHandle(e.target.value))
                }
                placeholder="rylan"
                maxLength={24}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
          </div>
          <div className="mt-4 rounded-[14px] border border-border bg-surface-secondary p-3">
            <Checkbox
              id="campaign-accept-rules"
              label="I accept the campaign rules and anti-fraud policy"
              checked={acceptedRules}
              onChange={(event) => setAcceptedRules(event.target.checked)}
            />
          </div>
          <div className="mt-4">
            <Button
              loading={joining}
              onClick={() => void join()}
              disabled={campaign.status !== 'active'}
            >
              {user ? 'Join Campaign' : 'Sign in to join'}
            </Button>
          </div>
        </section>
      )}

      <section className="camp-panel">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="size-4 text-accent" />
          <h2 className="camp-panel__title">Leaderboard</h2>
        </div>
        {leaderboard.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            No qualified referrals yet. Be the first to climb.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="campaign-leaderboard min-w-[420px]">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Creator</th>
                  <th>Qualified</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row) => (
                  <tr
                    key={row.participantId}
                    data-me={me?.participantId === row.participantId}
                  >
                    <td className="font-semibold tabular-nums">#{row.rank}</td>
                    <td>{row.publicName}</td>
                    <td className="tabular-nums">{row.qualifiedReferrals}</td>
                    <td className="text-foreground-secondary">Qualified</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {me?.rank ? (
          <p className="mt-3 text-sm font-semibold text-foreground">
            Your rank: #{me.rank} · {me.qualifiedReferrals} qualified ·{' '}
            {me.pendingReferrals} pending
          </p>
        ) : null}
      </section>

      <section className="camp-panel">
        <div className="camp-panel__header">
          <h2 className="camp-panel__title">Prize distribution</h2>
          <p className="camp-panel__subtitle">
            Estimated payouts · final after review
          </p>
        </div>
        <div className="camp-prize-grid">
          {Object.entries(campaign.payoutStructure.places ?? {})
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([place, amount]) => {
              const n = Number(place);
              const ordinal =
                n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
              return (
                <div
                  key={place}
                  className={cn(
                    'camp-prize-card',
                    n <= 3 && `camp-prize-card--${n}`,
                  )}
                >
                  <span className="camp-prize-card__place">
                    {place}
                    {ordinal}
                  </span>
                  <strong className="camp-prize-card__amount">
                    {campaign.payoutStructure.mode === 'percentage'
                      ? `${amount}%`
                      : formatMoney(amount)}
                  </strong>
                  <span className="camp-prize-card__label">
                    {campaign.payoutStructure.mode === 'percentage'
                      ? 'of pool'
                      : 'estimated'}
                  </span>
                </div>
              );
            })}
          {campaign.payoutStructure.sharedBand ? (
            <div className="camp-prize-card camp-prize-card--band">
              <span className="camp-prize-card__place">
                {campaign.payoutStructure.sharedBand.from}–
                {campaign.payoutStructure.sharedBand.to}th
              </span>
              <strong className="camp-prize-card__amount">
                {formatMoney(campaign.payoutStructure.sharedBand.eachUsd)}
              </strong>
              <span className="camp-prize-card__label">each</span>
            </div>
          ) : null}
        </div>
        <p className="camp-panel__note">
          Amounts shown are provisional until the campaign is finalized.
        </p>
      </section>

      <section className="camp-panel">
        <div className="camp-panel__header">
          <h2 className="camp-panel__title">Campaign rules</h2>
          <p className="camp-panel__subtitle">
            Read before joining · enforced by PepGuide
          </p>
        </div>
        <div className="camp-rules">
          {CAMPAIGN_RULE_SECTIONS.map((section) => (
            <div key={section.title} className="camp-rules__section">
              <h3>{section.title}</h3>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] border border-white/15 bg-white/10 px-3 py-2.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/70">
        {label}
      </p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="camp-mini-stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
