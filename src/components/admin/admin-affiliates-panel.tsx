'use client';

import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import {
  AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT,
  AFFILIATE_RECURRING_COMMISSION_PERCENT,
} from '@/src/constants/referral-affiliates';
import { normalizeReferralCode } from '@/src/lib/referral-code';
import { cn } from '@/src/lib/utils';
import { referralAffiliatesRepository } from '@/src/services/firestore/referral-affiliates';
import type { ReferralAffiliate } from '@/src/types/referral-affiliates';

type Draft = {
  id: string | null;
  name: string;
  email: string;
  code: string;
  firstOrderCommissionPercent: string;
  recurringCommissionPercent: string;
  linkedUserId: string;
  active: boolean;
};

function blankDraft(): Draft {
  return {
    id: null,
    name: '',
    email: '',
    code: '',
    firstOrderCommissionPercent: String(AFFILIATE_FIRST_ORDER_COMMISSION_PERCENT),
    recurringCommissionPercent: String(AFFILIATE_RECURRING_COMMISSION_PERCENT),
    linkedUserId: '',
    active: true,
  };
}

function toDraft(affiliate: ReferralAffiliate): Draft {
  return {
    id: affiliate.id,
    name: affiliate.name,
    email: affiliate.email ?? '',
    code: affiliate.code,
    firstOrderCommissionPercent: String(affiliate.firstOrderCommissionPercent),
    recurringCommissionPercent: String(affiliate.recurringCommissionPercent),
    linkedUserId: affiliate.linkedUserId ?? '',
    active: affiliate.active,
  };
}

export function AdminAffiliatesPanel() {
  const [affiliates, setAffiliates] = useState<ReferralAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(blankDraft);

  const reload = async () => {
    setLoading(true);
    try {
      setAffiliates(await referralAffiliatesRepository.list());
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load affiliates. Check Firestore rules.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void reload();
  }, []);

  const startCreate = () => {
    setDraft(blankDraft());
    setMessage(null);
  };

  const startEdit = (affiliate: ReferralAffiliate) => {
    setDraft(toDraft(affiliate));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!draft.name.trim()) {
      setMessage('Name is required.');
      return;
    }
    if (!normalizeReferralCode(draft.code)) {
      setMessage('Affiliate code is required.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      const saved = await referralAffiliatesRepository.upsert(draft.id, {
        name: draft.name,
        email: draft.email,
        code: draft.code,
        firstOrderCommissionPercent: Number(draft.firstOrderCommissionPercent),
        recurringCommissionPercent: Number(draft.recurringCommissionPercent),
        linkedUserId: draft.linkedUserId || null,
        active: draft.active,
      });
      await reload();
      setDraft(toDraft(saved));
      setMessage(draft.id ? 'Affiliate updated.' : 'Affiliate created.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to save affiliate.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (affiliate: ReferralAffiliate) => {
    if (
      !window.confirm(
        `Delete affiliate “${affiliate.name}” (${affiliate.code})? Existing referred users keep their attribution.`,
      )
    ) {
      return;
    }
    setMessage(null);
    try {
      await referralAffiliatesRepository.delete(affiliate.id);
      if (draft.id === affiliate.id) setDraft(blankDraft());
      await reload();
      setMessage('Affiliate deleted.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to delete affiliate.',
      );
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
          <div>
            <CardTitle>Affiliates</CardTitle>
            <CardDescription>
              Self-serve joins use 50% / 20%. Admin can override rates here.
            </CardDescription>
          </div>
          <Button size="sm" variant="secondary" onClick={startCreate}>
            <Plus className="size-3.5" />
            New
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-foreground-secondary">
              <Loader2 className="size-3.5 animate-spin" />
              Loading…
            </p>
          ) : affiliates.length === 0 ? (
            <p className="text-sm text-foreground-secondary">
              No affiliates yet. Members can also join from the Affiliates page.
            </p>
          ) : (
            affiliates.map((affiliate) => (
              <div
                key={affiliate.id}
                className={cn(
                  'flex w-full items-center gap-2 rounded-[12px] border px-2 py-2 transition-colors',
                  draft.id === affiliate.id
                    ? 'border-accent bg-accent-muted/40'
                    : 'border-border bg-surface',
                  !affiliate.active && 'opacity-70',
                )}
              >
                <button
                  type="button"
                  onClick={() => startEdit(affiliate)}
                  className="min-w-0 flex-1 rounded-[10px] px-1.5 py-1 text-left hover:bg-surface-secondary/80"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">
                      {affiliate.name}
                    </span>
                    <span className="shrink-0 text-xs font-bold text-accent">
                      {affiliate.firstOrderCommissionPercent}% /{' '}
                      {affiliate.recurringCommissionPercent}%
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-foreground-secondary">
                    <span className="font-mono font-semibold tracking-wide">
                      {affiliate.code}
                    </span>
                    <span>· {affiliate.referralCount} signups</span>
                    {!affiliate.active ? <span>· Hidden</span> : null}
                  </div>
                </button>
                <button
                  type="button"
                  className="rounded-[10px] p-2 text-foreground-secondary hover:bg-critical/10 hover:text-critical"
                  title="Delete affiliate"
                  onClick={() => void handleDelete(affiliate)}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{draft.id ? 'Edit affiliate' : 'New affiliate'}</CardTitle>
          <CardDescription>
            Share links like{' '}
            <span className="font-mono text-foreground">
              /sign-up?ref=CODE
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            label="Name"
            value={draft.name}
            onChange={(event) =>
              setDraft((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Creator or partner name"
          />
          <Input
            label="Code"
            value={draft.code}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                code: event.target.value.toUpperCase(),
              }))
            }
            placeholder="PEPGUIDE"
            autoCapitalize="characters"
            hint="3–32 characters. Letters, numbers, _ or -"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="First-order %"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={draft.firstOrderCommissionPercent}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  firstOrderCommissionPercent: event.target.value,
                }))
              }
            />
            <Input
              label="Every order after %"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={draft.recurringCommissionPercent}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  recurringCommissionPercent: event.target.value,
                }))
              }
            />
          </div>
          <Input
            label="Contact email (optional)"
            type="email"
            value={draft.email}
            onChange={(event) =>
              setDraft((current) => ({ ...current, email: event.target.value }))
            }
            placeholder="affiliate@example.com"
          />
          <Input
            label="Linked PepGuide user ID (optional)"
            value={draft.linkedUserId}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                linkedUserId: event.target.value,
              }))
            }
            hint="Self-serve joins set this automatically"
            placeholder="Firebase uid"
          />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  active: event.target.checked,
                }))
              }
              className="size-4 rounded border-border"
            />
            Active (code accepted at signup)
          </label>

          {message ? (
            <p className="text-sm text-foreground-secondary">{message}</p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button loading={saving} onClick={() => void handleSave()}>
              {draft.id ? 'Save changes' : 'Create affiliate'}
            </Button>
            {draft.id ? (
              <Button variant="secondary" onClick={startCreate}>
                Clear
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
