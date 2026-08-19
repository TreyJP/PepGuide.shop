'use client';

import {
  Activity,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Tag,
  Users,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import '@/src/components/admin/admin-dashboard.css';
import { Button } from '@/src/components/ui/button';
import { buildAdminDashboardMetrics } from '@/src/lib/admin-metrics';
import { loadAdminDashboardRawData } from '@/src/services/firestore/analytics';
import type {
  AdminDashboardRawData,
  AdminMetricsRange,
} from '@/src/types/analytics';

const RANGES: Array<{ id: AdminMetricsRange; label: string }> = [
  { id: '1d', label: '1D' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'all', label: 'All' },
];

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

function rangeLabel(range: AdminMetricsRange): string {
  if (range === '1d') return 'Last 24 hours';
  if (range === '7d') return 'Last 7 days';
  if (range === '30d') return 'Last 30 days';
  return 'All time';
}

export function AdminDashboard() {
  const [raw, setRaw] = useState<AdminDashboardRawData | null>(null);
  const [range, setRange] = useState<AdminMetricsRange>('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await loadAdminDashboardRawData();
      setRaw(data);
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

  const metrics = useMemo(
    () => (raw ? buildAdminDashboardMetrics(raw, range) : null),
    [raw, range],
  );

  const maxPartnerClicks = useMemo(() => {
    if (!metrics?.affiliates.clicksByPartner.length) return 1;
    return Math.max(
      ...metrics.affiliates.clicksByPartner.map((row) => row.clicks),
      1,
    );
  }, [metrics]);

  if (loading && !metrics) {
    return (
      <div className="admin-dash__loading">
        <Loader2 className="size-4 animate-spin" />
        Loading dashboard…
      </div>
    );
  }

  if (error && !metrics) {
    return (
      <div className="space-y-3">
        <p className="admin-dash__error">{error}</p>
        <Button size="sm" variant="secondary" onClick={() => void refresh()}>
          Retry
        </Button>
      </div>
    );
  }

  if (!metrics) return null;

  const { users, engagement, affiliates } = metrics;

  return (
    <div className="admin-dash space-y-4">
      <section className="admin-dash__hero">
        <div className="admin-dash__hero-top">
          <div>
            <p className="admin-dash__eyebrow">Operations overview</p>
            <h2 className="admin-dash__title">Admin dashboard</h2>
            <p className="admin-dash__subtitle">
              {rangeLabel(range)} · updated {formatWhen(metrics.generatedAt)}
            </p>
          </div>

          <div className="admin-dash__toolbar">
            <div
              className="admin-dash__range"
              role="group"
              aria-label="Time range"
            >
              {RANGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-active={range === item.id}
                  aria-pressed={range === item.id}
                  onClick={() => setRange(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="admin-dash__refresh"
              onClick={() => void refresh()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <RefreshCw className="size-3.5" />
              )}
              Refresh
            </button>
          </div>
        </div>

        {error ? <p className="relative z-[1] mt-3 text-sm text-red-200">{error}</p> : null}

        <div className="admin-dash__kpis">
          <Kpi
            label="Total users"
            value={users.total}
            hint={`+${users.newInRange} new in ${range.toUpperCase()}`}
          />
          <Kpi
            label="Chat messages"
            value={engagement.messages}
            hint={`${engagement.activeChatters} active chat day${engagement.activeChatters === 1 ? '' : 's'}`}
          />
          <Kpi
            label="Referral clicks"
            value={affiliates.clicks}
            hint={`${affiliates.uniqueClickers} unique people`}
          />
          <Kpi
            label="Coupon copies"
            value={engagement.couponCopies}
            hint={`${affiliates.activePartners} active partners`}
          />
        </div>
      </section>

      <div className="admin-dash__grid">
        <div className="space-y-4">
          <Panel
            title="User health"
            description="Account status across the platform"
            icon={Users}
          >
            <Stat label="New signups" value={users.newInRange} />
            <Stat label="Active accounts" value={users.byStatus.active} />
            <Stat label="Under review" value={users.byStatus.review} />
            <Stat label="Cooldown" value={users.byStatus.cooldown} />
            <Stat label="Suspended" value={users.byStatus.suspended} />
            <Stat label="Chat blocked now" value={users.chatBlocked} />
            <Stat label="With abuse strikes" value={users.withAbuseStrikes} />
          </Panel>

          <Panel
            title="Engagement & safety"
            description={`Activity tracked in ${rangeLabel(range).toLowerCase()}`}
            icon={ShieldAlert}
          >
            <Stat label="Messages sent" value={engagement.messages} />
            <Stat label="Active chat days" value={engagement.activeChatters} />
            <Stat label="Coupon copies" value={engagement.couponCopies} />
            <Stat label="Safety events" value={engagement.safetyEvents} />
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel
            title="Partner performance"
            description={`${affiliates.activePartners} active / ${affiliates.totalPartners} total vendors`}
            icon={Tag}
          >
            {affiliates.clicksByPartner.length === 0 ? (
              <p className="admin-dash__empty">
                No referral clicks in this period yet.
              </p>
            ) : (
              <div className="admin-dash__partner-bar">
                {affiliates.clicksByPartner.map((row) => (
                  <div key={row.partnerId} className="admin-dash__partner-row">
                    <div className="admin-dash__partner-meta">
                      <p className="admin-dash__partner-name">{row.label}</p>
                      <div className="admin-dash__partner-track">
                        <div
                          className="admin-dash__partner-fill"
                          style={{
                            width: `${Math.max(8, (row.clicks / maxPartnerClicks) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="admin-dash__partner-count">
                      {row.clicks}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel
            title="Recent referral activity"
            description="Latest outbound partner clicks with member email when signed in"
            icon={Activity}
          >
            {affiliates.recentClicks.length === 0 ? (
              <p className="admin-dash__empty">No clicks in this period.</p>
            ) : (
              <div className="admin-dash__table-wrap">
                <table className="admin-dash__table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Person</th>
                      <th>Partner</th>
                      <th>Peptide</th>
                      <th>Link</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliates.recentClicks.map((click) => (
                      <tr key={click.id}>
                        <td className="text-foreground-secondary">
                          {formatWhen(click.createdAt)}
                        </td>
                        <td className="max-w-[10rem] truncate text-foreground">
                          {click.email || click.userId || 'Anonymous'}
                        </td>
                        <td className="text-foreground">
                          {click.partnerLabel || click.partnerId || '—'}
                        </td>
                        <td className="text-foreground">
                          {click.peptideName || click.peptideId || '—'}
                        </td>
                        <td>
                          {click.href ? (
                            <a
                              href={click.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
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
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <article className="admin-dash__kpi">
      <p className="admin-dash__kpi-label">{label}</p>
      <p className="admin-dash__kpi-value">{value.toLocaleString()}</p>
      <p className="admin-dash__kpi-hint">{hint}</p>
    </article>
  );
}

function Panel({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof Users;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-dash__panel">
      <div className="admin-dash__panel-head">
        <div>
          <h3 className="admin-dash__panel-title flex items-center gap-2">
            <Icon className="size-4 text-accent" />
            {title}
          </h3>
          <p className="admin-dash__panel-desc">{description}</p>
        </div>
      </div>
      <div className="admin-dash__panel-body">
        <div className="admin-dash__stat-grid">{children}</div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="admin-dash__stat-row">
      <span className="admin-dash__stat-label">{label}</span>
      <span className="admin-dash__stat-value">{value}</span>
    </div>
  );
}
