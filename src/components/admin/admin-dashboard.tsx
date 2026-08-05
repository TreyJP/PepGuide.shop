'use client';

import {
  Activity,
  CreditCard,
  ExternalLink,
  Loader2,
  MousePointerClick,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { formatAffiliateUsd } from '@/src/data/affiliates/slots';
import { loadAdminDashboardMetrics } from '@/src/services/firestore/analytics';
import type { AdminDashboardMetrics } from '@/src/types/analytics';

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 pt-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground-secondary">
            {label}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint ? (
            <p className="mt-1 text-xs text-foreground-secondary">{hint}</p>
          ) : null}
        </div>
        <span className="inline-flex size-9 items-center justify-center rounded-[12px] bg-accent-muted text-accent">
          <Icon className="size-4" />
        </span>
      </CardContent>
    </Card>
  );
}

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAdminDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load dashboard metrics.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading && !metrics) {
    return (
      <div className="flex items-center gap-2 py-16 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Loading dashboard…
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="space-y-3 py-10">
        <p className="text-sm text-red-600">{error}</p>
        <Button size="sm" variant="secondary" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!metrics) return null;

  const { users, sales, engagement, affiliates } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-foreground-secondary">
            Site-wide metrics · updated {formatWhen(metrics.generatedAt)}
          </p>
          {error ? (
            <p className="mt-1 text-xs text-red-600">{error}</p>
          ) : null}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => void refresh()}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total users"
          value={users.total}
          hint={`+${users.new7d} in 7d · +${users.new30d} in 30d`}
          icon={Users}
        />
        <MetricCard
          label="Pro users"
          value={users.pro}
          hint={`${users.free} free · ${users.withStripe} with Stripe`}
          icon={CreditCard}
        />
        <MetricCard
          label="Est. monthly revenue"
          value={formatAffiliateUsd(sales.estimatedMrrUsd)}
          hint={`${sales.proSubscribers} × Pro · ${sales.checkoutCompletedAll} recorded sales`}
          icon={CreditCard}
        />
        <MetricCard
          label="Referral clicks"
          value={affiliates.clicksAll}
          hint={`${affiliates.clicks7d} in 7d · ${affiliates.uniqueClickersAll} unique people`}
          icon={MousePointerClick}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Sales</CardTitle>
            <CardDescription>PepGuide Pro subscriptions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Pro subscribers" value={sales.proSubscribers} />
            <Row
              label="Est. MRR"
              value={formatAffiliateUsd(sales.estimatedMrrUsd)}
            />
            <Row
              label="Checkouts started (7d)"
              value={sales.checkoutStarted7d}
            />
            <Row
              label="Checkouts completed (7d)"
              value={sales.checkoutCompleted7d}
            />
            <Row
              label="All-time completed"
              value={sales.checkoutCompletedAll}
            />
            <Row
              label="Est. all-time revenue"
              value={formatAffiliateUsd(sales.estimatedRevenueAllUsd)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Users & moderation</CardTitle>
            <CardDescription>Account health across the site</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Active" value={users.byStatus.active} />
            <Row label="Review" value={users.byStatus.review} />
            <Row label="Cooldown" value={users.byStatus.cooldown} />
            <Row label="Suspended" value={users.byStatus.suspended} />
            <Row label="Chat blocked now" value={users.chatBlocked} />
            <Row label="With abuse strikes" value={users.withAbuseStrikes} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engagement</CardTitle>
            <CardDescription>Chat and product activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Row label="Messages today" value={engagement.messagesToday} />
            <Row
              label="Active chatters today"
              value={engagement.activeChattersToday}
            />
            <Row label="Messages (7d)" value={engagement.messages7d} />
            <Row label="Coupon copies (7d)" value={engagement.couponCopies7d} />
            <Row
              label="Coupon copies (all)"
              value={engagement.couponCopiesAll}
            />
            <Row
              label="Safety events (7d)"
              value={engagement.safetyEvents7d}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Affiliate partners</CardTitle>
            <CardDescription>
              {affiliates.activePartners} active / {affiliates.totalPartners}{' '}
              total
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {affiliates.clicksByPartner.length === 0 ? (
              <p className="text-foreground-secondary">
                No referral clicks recorded yet. Clicks start logging when users
                open partner links.
              </p>
            ) : (
              affiliates.clicksByPartner.map((row) => (
                <Row
                  key={row.partnerId}
                  label={row.label}
                  value={`${row.clicks} click${row.clicks === 1 ? '' : 's'}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-4 text-accent" />
                People who clicked referral links
              </CardTitle>
              <CardDescription>
                Latest outbound partner clicks with user email when signed in
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {affiliates.recentClicks.length === 0 ? (
              <p className="text-sm text-foreground-secondary">
                No clicks yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-border text-[11px] uppercase tracking-[0.12em] text-foreground-secondary">
                      <th className="py-2 pr-3 font-semibold">When</th>
                      <th className="py-2 pr-3 font-semibold">Person</th>
                      <th className="py-2 pr-3 font-semibold">Partner</th>
                      <th className="py-2 pr-3 font-semibold">Peptide</th>
                      <th className="py-2 font-semibold">Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.recentClicks.map((click) => (
                      <tr
                        key={click.id}
                        className="border-b border-border/70 last:border-0"
                      >
                        <td className="py-2.5 pr-3 text-foreground-secondary">
                          {formatWhen(click.createdAt)}
                        </td>
                        <td className="max-w-[9rem] truncate py-2.5 pr-3 text-foreground sm:max-w-[14rem]">
                          {click.email || click.userId || 'Anonymous'}
                        </td>
                        <td className="py-2.5 pr-3 text-foreground">
                          {click.partnerLabel || click.partnerId || '—'}
                        </td>
                        <td className="py-2.5 pr-3 text-foreground">
                          {click.peptideName || click.peptideId || '—'}
                        </td>
                        <td className="py-2.5">
                          {click.href ? (
                            <a
                              href={click.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-accent hover:underline"
                            >
                              Open
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-accent" />
            Safety snapshot
          </CardTitle>
          <CardDescription>
            Abuse / policy events written by the server
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 text-sm">
          <Row label="Events (7d)" value={engagement.safetyEvents7d} />
          <Row label="Events (all loaded)" value={engagement.safetyEventsAll} />
          <Row label="Users with strikes" value={users.withAbuseStrikes} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-[10px] bg-surface-secondary/60 px-3 py-2">
      <span className="min-w-0 truncate text-foreground-secondary">{label}</span>
      <span className="shrink-0 font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  );
}
