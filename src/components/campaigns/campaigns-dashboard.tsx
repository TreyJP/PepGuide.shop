'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import '@/src/components/campaigns/campaigns.css';
import { Button } from '@/src/components/ui/button';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import { useUiStore } from '@/src/stores/ui-store';

type CampaignCard = {
  id: string;
  name: string;
  slug: string;
  prizePoolUsd: number;
  status: string;
  endDate: string;
};

type JoinedRow = {
  campaign: CampaignCard;
  rank: number | null;
  qualified: number;
  pending: number;
  rejected: number;
  referralCode: string;
  vanityHandle?: string;
  estimatedPayoutUsd: number | null;
};

function formatMoney(usd: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(usd);
}

export function CampaignsDashboard() {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const [campaigns, setCampaigns] = useState<CampaignCard[]>([]);
  const [joined, setJoined] = useState<JoinedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      openSignInModal('Sign in to view your campaign dashboard.');
      setLoading(false);
      return;
    }

    void (async () => {
      setLoading(true);
      try {
        const listRes = await fetch('/api/campaigns');
        const listData = (await listRes.json()) as { campaigns?: CampaignCard[] };
        const all = listData.campaigns ?? [];
        setCampaigns(all);

        const token = await getFirebaseAuth()?.currentUser?.getIdToken();
        if (!token) return;

        const rows = await Promise.all(
          all.map(async (campaign) => {
            const response = await fetch(`/api/campaigns/${campaign.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const data = (await response.json()) as {
              me?: {
                rank: number | null;
                qualifiedReferrals: number;
                pendingReferrals: number;
                rejectedReferrals: number;
                referralCode: string;
                vanityHandle?: string;
                estimatedPayoutUsd: number | null;
              } | null;
            };
            if (!data.me) return null;
            return {
              campaign,
              rank: data.me.rank,
              qualified: data.me.qualifiedReferrals,
              pending: data.me.pendingReferrals,
              rejected: data.me.rejectedReferrals,
              referralCode: data.me.referralCode,
              vanityHandle: data.me.vanityHandle,
              estimatedPayoutUsd: data.me.estimatedPayoutUsd,
            } satisfies JoinedRow;
          }),
        );
        setJoined(rows.filter(Boolean) as JoinedRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, openSignInModal]);

  if (!user) {
    return (
      <div className="campaigns-root campaigns-root--vault mx-auto max-w-lg p-8 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Campaign dashboard
        </h1>
        <p className="mt-2 text-sm text-foreground-secondary">
          Sign in to see your ranks, links, and referral progress.
        </p>
        <Button
          className="mt-4"
          onClick={() =>
            openSignInModal('Sign in to view your campaign dashboard.')
          }
        >
          Sign in
        </Button>
      </div>
    );
  }

  const totals = joined.reduce(
    (acc, row) => {
      acc.qualified += row.qualified;
      acc.pending += row.pending;
      acc.rejected += row.rejected;
      return acc;
    },
    { qualified: 0, pending: 0, rejected: 0 },
  );
  const maxFunnel = Math.max(totals.pending, totals.qualified, totals.rejected, 1);

  return (
    <div
      className="campaigns-root campaigns-root--vault mx-auto max-w-4xl space-y-5 p-4 sm:p-6"
      data-design="vault"
    >
      <header className="camp-vault__hero camp-vault__hero--compact">
        <p className="camp-vault__eyebrow">Your vault</p>
        <h1>Campaign performance</h1>
        <p className="camp-vault__lede">
          Ranks and qualified referrals across campaigns you have joined.
        </p>
      </header>

      {!loading && joined.length > 0 ? (
        <section className="camp-panel">
          <div className="grid gap-2 sm:grid-cols-3">
            <Stat label="Pending" value={totals.pending} />
            <Stat label="Qualified" value={totals.qualified} />
            <Stat label="Rejected" value={totals.rejected} />
          </div>
          <div className="campaign-funnel mt-4">
            {(
              [
                ['Pending', totals.pending],
                ['Qualified', totals.qualified],
                ['Rejected', totals.rejected],
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
        </section>
      ) : null}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading…</p>
      ) : joined.length === 0 ? (
        <div className="camp-vault__empty">
          <h2>You haven&apos;t joined a campaign yet</h2>
          <p>Open the vault and claim your creator handle.</p>
          <Link href="/campaigns" className="camp-vault__cta mt-4 inline-flex">
            Browse campaigns
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {joined.map((row) => (
            <Link
              key={row.campaign.id}
              href={`/campaigns/${row.campaign.slug}`}
              className="camp-vault__ticket camp-vault__ticket--row block"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {row.campaign.name}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-foreground-secondary">
                    {row.vanityHandle
                      ? `@${row.vanityHandle}`
                      : row.referralCode}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-semibold text-foreground">
                    Rank {row.rank ? `#${row.rank}` : '—'}
                  </p>
                  <p className="text-foreground-secondary">
                    {row.qualified} qualified · {row.pending} pending
                  </p>
                  {row.estimatedPayoutUsd != null ? (
                    <p className="text-xs text-accent">
                      Est. {formatMoney(row.estimatedPayoutUsd)}
                    </p>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {campaigns.length > 0 ? (
        <p className="text-sm text-foreground-secondary">
          Looking for another campaign?{' '}
          <Link href="/campaigns" className="font-semibold text-accent hover:underline">
            View all
          </Link>
        </p>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[12px] border border-border bg-surface-secondary px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
        {label}
      </p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}
