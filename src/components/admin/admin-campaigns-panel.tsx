'use client';

import { Loader2, Plus, RefreshCw, ShieldAlert } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { DEFAULT_PAYOUT_STRUCTURE } from '@/src/constants/campaigns';
import { cn } from '@/src/lib/utils';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import type { Campaign, CampaignReferral } from '@/src/types/campaigns';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in again.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function AdminCampaignsPanel() {
  const params = useParams<{ campaignId?: string }>();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fraudQueue, setFraudQueue] = useState<CampaignReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [prizePoolUsd, setPrizePoolUsd] = useState('1000');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadFraud = useCallback(async (campaignId: string) => {
    setSelectedId(campaignId);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/campaigns/${campaignId}/fraud`, {
        headers,
      });
      const data = (await response.json()) as {
        fraudQueue?: CampaignReferral[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Unable to load queue.');
      setFraudQueue(data.fraudQueue ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load queue.');
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/admin/campaigns', { headers });
      const data = (await response.json()) as {
        campaigns?: Campaign[];
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Unable to load.');
      setCampaigns(data.campaigns ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Unable to load.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const fromRoute = params?.campaignId;
    if (!fromRoute) return;
    const match = campaigns.find(
      (c) => c.id === fromRoute || c.slug === fromRoute,
    );
    if (match) void loadFraud(match.id);
  }, [params?.campaignId, campaigns, loadFraud]);

  const createCampaign = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          slug,
          description,
          prizePoolUsd: Number(prizePoolUsd) || 0,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          status: 'draft',
          payoutStructure: DEFAULT_PAYOUT_STRUCTURE,
        }),
      });
      const data = (await response.json()) as {
        campaign?: Campaign;
        error?: string;
      };
      if (!response.ok) throw new Error(data.error || 'Create failed.');
      setMessage('Campaign created as draft.');
      setName('');
      setSlug('');
      setDescription('');
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Create failed.');
    } finally {
      setBusy(false);
    }
  };

  const runAction = async (
    campaignId: string,
    action:
      | 'launch'
      | 'pause'
      | 'end_review'
      | 'finalize'
      | 'run_fraud_audit'
      | 'recalculate_ranks',
  ) => {
    setBusy(true);
    setMessage(null);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ action }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Action failed.');
      setMessage(`Action “${action}” completed.`);
      await load();
      if (selectedId === campaignId) await loadFraud(campaignId);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setBusy(false);
    }
  };

  const fraudAction = async (
    action: 'approve_referral' | 'reject_referral',
    referralId: string,
  ) => {
    if (!selectedId) return;
    setBusy(true);
    try {
      const headers = await authHeaders();
      const response = await fetch(
        `/api/admin/campaigns/${selectedId}/fraud`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ action, referralId }),
        },
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Failed.');
      await loadFraud(selectedId);
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-4 sm:p-6 lg:grid-cols-[1fr_1.1fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle>Campaigns</CardTitle>
              <CardDescription>
                Create, launch, audit, and finalize PepGuide campaigns
              </CardDescription>
            </div>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => void load()}
              disabled={loading}
            >
              <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Loader2 className="size-4 animate-spin" /> Loading…
              </p>
            ) : campaigns.length === 0 ? (
              <p className="text-sm text-foreground-secondary">No campaigns yet.</p>
            ) : (
              campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className={cn(
                    'rounded-[12px] border px-3 py-2',
                    selectedId === campaign.id
                      ? 'border-accent bg-accent-muted/30'
                      : 'border-border bg-surface',
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-left"
                    onClick={() => void loadFraud(campaign.id)}
                  >
                    <p className="text-sm font-semibold">{campaign.name}</p>
                    <p className="text-xs text-foreground-secondary">
                      {campaign.status} · ${campaign.prizePoolUsd} ·{' '}
                      {campaign.participantCount} participants ·{' '}
                      {campaign.qualifiedReferralCount} qualified
                    </p>
                  </button>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(
                      [
                        ['launch', 'Launch'],
                        ['pause', 'Pause'],
                        ['end_review', 'End → review'],
                        ['run_fraud_audit', 'Fraud audit'],
                        ['finalize', 'Finalize'],
                      ] as const
                    ).map(([action, label]) => (
                      <button
                        key={action}
                        type="button"
                        disabled={busy}
                        onClick={() => void runAction(campaign.id, action)}
                        className="h-7 rounded-[8px] border border-border px-2 text-[11px] font-semibold hover:bg-surface-secondary"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-4" />
              New campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              label="Slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
            <label className="block space-y-1.5 text-sm">
              <span className="font-medium">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-24 w-full rounded-[12px] border border-border bg-surface px-3 py-2 text-sm"
              />
            </label>
            <Input
              label="Prize pool (USD)"
              type="number"
              value={prizePoolUsd}
              onChange={(e) => setPrizePoolUsd(e.target.value)}
            />
            <Input
              label="Start date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <Button
              onClick={() => void createCampaign()}
              disabled={
                busy || !name || !slug || !description || !startDate || !endDate
              }
            >
              Create draft
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="size-4 text-accent" />
            Fraud review
          </CardTitle>
          <CardDescription>
            Pending / high-risk referrals for the selected campaign. Exact scores
            stay admin-only.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {!selectedId ? (
            <p className="text-sm text-foreground-secondary">
              Select a campaign to review suspicious referrals.
            </p>
          ) : fraudQueue.length === 0 ? (
            <p className="text-sm text-foreground-secondary">
              No items in the fraud queue.
            </p>
          ) : (
            fraudQueue.map((row) => (
              <div
                key={row.id}
                className="rounded-[12px] border border-border px-3 py-2 text-sm"
              >
                <p className="font-semibold">
                  Risk {row.fraudRiskScore} · {row.status}
                </p>
                <p className="mt-0.5 text-xs text-foreground-secondary">
                  User {row.referredUserId.slice(0, 10)}… · signals:{' '}
                  {row.fraudSignals.join(', ') || 'none'}
                </p>
                <div className="mt-2 flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => void fraudAction('approve_referral', row.id)}
                    disabled={busy}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => void fraudAction('reject_referral', row.id)}
                    disabled={busy}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))
          )}
          {message ? (
            <p className="pt-2 text-sm text-foreground-secondary">{message}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
