'use client';

import { Eye, EyeOff, Loader2, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';

import { AdminAffiliatesPanel } from '@/src/components/admin/admin-affiliates-panel';
import { AdminConsultsPanel } from '@/src/components/admin/admin-consults-panel';
import { AdminDashboard } from '@/src/components/admin/admin-dashboard';
import { AdminPremiumUsersPanel } from '@/src/components/admin/admin-premium-users-panel';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  PARTNER_LAB_TESTS,
  type PartnerLabTestId,
} from '@/src/data/affiliates/lab-tests';
import { isPreferredPartner } from '@/src/data/affiliates/preferred-partners';
import { VIAL_TEST_AMOUNTS } from '@/src/data/affiliates/slots';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { cn } from '@/src/lib/utils';
import { partnersRepository } from '@/src/services/firestore/partners';
import { useAuthStore } from '@/src/stores/auth-store';
import { usePartnersStore } from '@/src/stores/partners-store';
import type { AffiliatePartner, PartnerTestAmount } from '@/src/types/affiliates';

type AdminTab =
  | 'dashboard'
  | 'partners'
  | 'affiliates'
  | 'consults'
  | 'premium'
  | 'access';

function emptyLabs(): Record<PartnerLabTestId, boolean | null> {
  return Object.fromEntries(
    PARTNER_LAB_TESTS.map((test) => [test.id, null]),
  ) as Record<PartnerLabTestId, boolean | null>;
}

function blankAmounts(): PartnerTestAmount[] {
  return VIAL_TEST_AMOUNTS.map((testAmount) => ({
    testAmount,
    priceUsd: 0,
  }));
}

type Draft = {
  id: string | null;
  label: string;
  href: string;
  active: boolean;
  hasCatalogProducts: boolean;
  testAmounts: PartnerTestAmount[];
  labTests: Record<PartnerLabTestId, boolean | null>;
};

function partnerToDraft(partner: AffiliatePartner): Draft {
  const amountMap = new Map(
    partner.testAmounts.map((item) => [item.testAmount, item.priceUsd]),
  );
  return {
    id: partner.id,
    label: partner.label,
    href: partner.href,
    active: partner.active,
    hasCatalogProducts: (partner.products?.length ?? 0) > 0,
    testAmounts: VIAL_TEST_AMOUNTS.map((testAmount) => ({
      testAmount,
      priceUsd: amountMap.get(testAmount) ?? 0,
    })),
    labTests: { ...emptyLabs(), ...partner.labTests },
  };
}

function newDraft(): Draft {
  return {
    id: null,
    label: '',
    href: '',
    active: true,
    hasCatalogProducts: false,
    testAmounts: blankAmounts(),
    labTests: emptyLabs(),
  };
}

export default function AdminPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { loading: adminLoading, isAdmin } = useAdminAccess();
  const partners = usePartnersStore((state) => state.partners);
  const loadingPartners = usePartnersStore((state) => state.loading);
  const loadPartners = usePartnersStore((state) => state.loadPartners);
  const upsertPartner = usePartnersStore((state) => state.upsertPartner);
  const deletePartner = usePartnersStore((state) => state.deletePartner);

  const [tab, setTab] = useState<AdminTab>('dashboard');
  const [draft, setDraft] = useState<Draft>(newDraft);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [savingEmails, setSavingEmails] = useState(false);

  useEffect(() => {
    if (adminLoading) return;
    if (!isAdmin) {
      router.replace('/chat');
      return;
    }
    void loadPartners();
    void (async () => {
      try {
        let emails = await partnersRepository.getAdminEmails();
        // Env/claim admins can bootstrap Firestore allowlist with their own email.
        if (emails.length === 0 && user?.email) {
          emails = await partnersRepository.setAdminEmails([
            user.email.toLowerCase(),
          ]);
        }
        setAdminEmails(emails);
      } catch {
        setAdminEmails([]);
      }
    })();
  }, [adminLoading, isAdmin, loadPartners, router, user?.email]);

  const selectedSizes = useMemo(
    () =>
      new Set(
        draft.testAmounts
          .filter((item) => item.priceUsd > 0)
          .map((item) => item.testAmount),
      ),
    [draft.testAmounts],
  );

  if (adminLoading || !isAdmin) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-foreground-secondary">
        <Loader2 className="size-4 animate-spin" />
        Checking admin access…
      </div>
    );
  }

  const startCreate = () => {
    setDraft(newDraft());
    setMessage(null);
  };

  const startEdit = (partner: AffiliatePartner) => {
    setDraft(partnerToDraft(partner));
    setMessage(null);
  };

  const toggleSize = (testAmount: string) => {
    setDraft((current) => ({
      ...current,
      testAmounts: current.testAmounts.map((item) => {
        if (item.testAmount !== testAmount) return item;
        if (item.priceUsd > 0) return { ...item, priceUsd: 0 };
        return { ...item, priceUsd: 49 };
      }),
    }));
  };

  const setPrice = (testAmount: string, priceUsd: number) => {
    setDraft((current) => ({
      ...current,
      testAmounts: current.testAmounts.map((item) =>
        item.testAmount === testAmount ? { ...item, priceUsd } : item,
      ),
    }));
  };

  const cycleLab = (id: PartnerLabTestId) => {
    setDraft((current) => {
      const value = current.labTests[id];
      const next =
        value === null ? true : value === true ? false : null;
      return {
        ...current,
        labTests: { ...current.labTests, [id]: next },
      };
    });
  };

  const handleSave = async () => {
    if (!draft.label.trim()) {
      setMessage('Partner name is required.');
      return;
    }
    const enabledAmounts = draft.testAmounts.filter((item) => item.priceUsd > 0);
    if (enabledAmounts.length === 0 && !draft.hasCatalogProducts) {
      setMessage('Enable at least one vial size with a price.');
      return;
    }

    setSaving(true);
    setMessage(null);
    try {
      await upsertPartner(draft.id, {
        label: draft.label,
        href: draft.href || '#',
        active: draft.active,
        // Catalog partners keep product SKUs; only send vial sizes when set.
        ...(enabledAmounts.length > 0 || !draft.hasCatalogProducts
          ? { testAmounts: enabledAmounts }
          : {}),
        labTests: draft.labTests,
      });
      setMessage(draft.id ? 'Partner updated.' : 'Partner added.');
      if (!draft.id) setDraft(newDraft());
      else {
        const updated = usePartnersStore
          .getState()
          .partners.find((partner) => partner.id === draft.id);
        if (updated) setDraft(partnerToDraft(updated));
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to save partner. Check Firestore admin access.',
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePartnerVisibility = async (
    partner: AffiliatePartner,
    event: MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();
    setMessage(null);
    try {
      const updated = await upsertPartner(partner.id, {
        label: partner.label,
        href: partner.href,
        active: !partner.active,
      });
      if (draft.id === partner.id) {
        setDraft(partnerToDraft(updated));
      }
      setMessage(
        updated.active
          ? `${updated.label} is now visible.`
          : `${updated.label} is now hidden.`,
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update vendor visibility.',
      );
    }
  };

  const handleDelete = async () => {
    if (!draft.id) return;
    const confirmed = window.confirm(`Delete partner “${draft.label}”?`);
    if (!confirmed) return;
    setSaving(true);
    try {
      await deletePartner(draft.id);
      setDraft(newDraft());
      setMessage('Partner deleted.');
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Unable to delete partner.',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAddAdminEmail = async () => {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setMessage('Enter a valid admin email.');
      return;
    }
    setSavingEmails(true);
    try {
      let next = [...new Set([...adminEmails, email])];
      // Bootstrap: if no allowlist yet, include current user.
      if (adminEmails.length === 0 && user?.email) {
        next = [...new Set([user.email.toLowerCase(), email])];
      }
      const saved = await partnersRepository.setAdminEmails(next);
      setAdminEmails(saved);
      setEmailInput('');
      setMessage('Admin allowlist updated.');
    } catch (error) {
      // First create must be only the current user's email.
      if (adminEmails.length === 0 && user?.email) {
        try {
          const saved = await partnersRepository.setAdminEmails([
            user.email.toLowerCase(),
          ]);
          setAdminEmails(saved);
          setMessage(
            'Bootstrap complete — your email is now admin. Add others next.',
          );
        } catch (bootstrapError) {
          setMessage(
            bootstrapError instanceof Error
              ? bootstrapError.message
              : 'Unable to update admin allowlist.',
          );
        }
      } else {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Unable to update admin allowlist.',
        );
      }
    } finally {
      setSavingEmails(false);
    }
  };

  const handleRemoveAdminEmail = async (email: string) => {
    setSavingEmails(true);
    try {
      const saved = await partnersRepository.setAdminEmails(
        adminEmails.filter((item) => item !== email),
      );
      setAdminEmails(saved);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to update admin allowlist.',
      );
    } finally {
      setSavingEmails(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <header className="border-b border-border px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-foreground">
          Admin
        </h1>
        <p className="mt-1 text-sm text-foreground-secondary">
          Site metrics, partners, referral affiliates, all users, Ask a
          Professional inbox, and admin access.
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {(
            [
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'partners', label: 'Partners' },
              { id: 'affiliates', label: 'Affiliates' },
              { id: 'premium', label: 'Users' },
              { id: 'consults', label: 'Ask a Pro' },
              { id: 'access', label: 'Access' },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                'h-9 rounded-[10px] border px-3 text-sm font-semibold transition-colors',
                tab === item.id
                  ? 'border-accent bg-accent text-white'
                  : 'border-border bg-surface text-foreground-secondary hover:bg-surface-secondary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {tab === 'dashboard' ? (
        <div className="mx-auto max-w-6xl p-6">
          <AdminDashboard />
        </div>
      ) : null}

      {tab === 'affiliates' ? <AdminAffiliatesPanel /> : null}

      {tab === 'premium' ? <AdminPremiumUsersPanel /> : null}

      {tab === 'consults' ? <AdminConsultsPanel /> : null}

      {tab === 'partners' ? (
      <div className="mx-auto grid max-w-5xl gap-6 p-6 lg:grid-cols-[1fr_1.2fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div>
              <CardTitle>Partners</CardTitle>
              <CardDescription>
                Hide a vendor to remove it from All Peptides, chat pricing, and
                compare modals
              </CardDescription>
            </div>
            <Button size="sm" variant="secondary" onClick={startCreate}>
              <Plus className="size-3.5" />
              New
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingPartners ? (
              <p className="text-sm text-foreground-secondary">Loading…</p>
            ) : partners.length === 0 ? (
              <p className="text-sm text-foreground-secondary">
                No partners yet. Create one to get started.
              </p>
            ) : (
              partners.map((partner) => (
                <div
                  key={partner.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-[12px] border px-2 py-2 transition-colors',
                    draft.id === partner.id
                      ? 'border-accent bg-accent-muted/40'
                      : 'border-border bg-surface',
                    !partner.active && 'opacity-70',
                  )}
                >
                  <button
                    type="button"
                    onClick={() => startEdit(partner)}
                    className="min-w-0 flex-1 rounded-[10px] px-1.5 py-1 text-left hover:bg-surface-secondary/80"
                  >
                    <p className="flex min-w-0 items-center gap-1.5 truncate text-sm font-semibold text-foreground">
                      <span className="truncate">{partner.label}</span>
                      {isPreferredPartner(partner.id) ? (
                        <span className="shrink-0 rounded-[6px] bg-teal-700/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-teal-800">
                          Trusted
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-xs text-foreground-secondary">
                      {partner.products?.length
                        ? `${partner.products.length} products`
                        : `${partner.testAmounts.length} sizes`}{' '}
                      · {partner.active ? 'Visible' : 'Hidden'}
                      {isPreferredPartner(partner.id) ? ' · Top placement' : ''}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={(event) =>
                      void togglePartnerVisibility(partner, event)
                    }
                    className={cn(
                      'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border px-2.5 text-xs font-semibold transition-colors',
                      partner.active
                        ? 'border-border bg-surface text-foreground hover:bg-surface-secondary'
                        : 'border-accent/30 bg-accent-muted text-accent hover:bg-accent-muted/80',
                    )}
                    aria-label={
                      partner.active
                        ? `Hide ${partner.label}`
                        : `Show ${partner.label}`
                    }
                    title={partner.active ? 'Hide vendor' : 'Show vendor'}
                  >
                    {partner.active ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                    {partner.active ? 'Hide' : 'Show'}
                  </button>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {draft.id ? 'Edit partner' : 'Add partner'}
              </CardTitle>
              <CardDescription>
                Set source details, vial sizes/prices, and lab tests
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">Name</span>
                <input
                  value={draft.label}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      label: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
                  placeholder="Partner name"
                />
              </label>

              <label className="block space-y-1.5 text-sm">
                <span className="font-medium text-foreground">
                  Affiliate URL
                </span>
                <input
                  value={draft.href}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      href: event.target.value,
                    }))
                  }
                  className="h-10 w-full rounded-[12px] border border-border bg-surface px-3"
                  placeholder="https://"
                />
              </label>

              <label className="flex items-start gap-2.5 rounded-[12px] border border-border bg-surface-secondary/50 px-3 py-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={draft.active}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                />
                <span>
                  <span className="font-medium text-foreground">
                    Visible to users
                  </span>
                  <span className="mt-0.5 block text-xs text-foreground-secondary">
                    Uncheck to hide this vendor from All Peptides, chat pricing,
                    and compare modals. Catalog products stay saved.
                  </span>
                </span>
              </label>

              {draft.hasCatalogProducts ? (
                <p className="rounded-[12px] border border-border bg-surface-secondary/40 px-3 py-2 text-xs text-foreground-secondary">
                  This partner uses a product catalog. Vial sizes below are
                  optional and only used if the catalog has no match.
                </p>
              ) : null}

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Vial sizes & prices
                </p>
                <div className="space-y-2">
                  {draft.testAmounts.map((item) => {
                    const enabled = selectedSizes.has(item.testAmount);
                    return (
                      <div
                        key={item.testAmount}
                        className="flex items-center gap-3 rounded-[12px] border border-border px-3 py-2"
                      >
                        <label className="flex min-w-20 items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleSize(item.testAmount)}
                          />
                          {item.testAmount}
                        </label>
                        <input
                          type="number"
                          min={0}
                          disabled={!enabled}
                          value={enabled ? item.priceUsd : ''}
                          onChange={(event) =>
                            setPrice(
                              item.testAmount,
                              Number(event.target.value) || 0,
                            )
                          }
                          className="h-9 w-28 rounded-[10px] border border-border bg-surface px-2 text-sm disabled:opacity-40"
                          placeholder="Price"
                        />
                        <span className="text-xs text-foreground-secondary">
                          USD
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium text-foreground">
                  Lab testing
                </p>
                <p className="mb-2 text-xs text-foreground-secondary">
                  Click to cycle: not reported → reported → failed
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {PARTNER_LAB_TESTS.map((test) => {
                    const value = draft.labTests[test.id];
                    const label =
                      value === true
                        ? 'Reported'
                        : value === false
                          ? 'Failed'
                          : 'Not reported';
                    return (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => cycleLab(test.id)}
                        className={cn(
                          'flex items-center justify-between rounded-[12px] border px-3 py-2 text-left text-sm',
                          value === true &&
                            'border-success/30 bg-success-muted text-foreground',
                          value === false &&
                            'border-critical/30 bg-critical-muted text-foreground',
                          value == null &&
                            'border-border bg-surface text-foreground-secondary',
                        )}
                      >
                        <span>{test.label}</span>
                        <span className="text-xs font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {message ? (
                <p className="text-sm text-foreground-secondary">{message}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add partner'}
                </Button>
                {draft.id ? (
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      ) : null}

      {tab === 'access' ? (
        <div className="mx-auto max-w-xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Admin access</CardTitle>
              <CardDescription>
                Accounts allowed to open this page and edit partners. You can
                also set NEXT_PUBLIC_ADMIN_EMAILS in env.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <input
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  className="h-10 w-full min-w-0 flex-1 rounded-[12px] border border-border bg-surface px-3 text-sm"
                  placeholder="admin@example.com"
                />
                <Button
                  variant="secondary"
                  onClick={handleAddAdminEmail}
                  disabled={savingEmails}
                >
                  Add email
                </Button>
              </div>
              {adminEmails.length === 0 ? (
                <p className="text-sm text-foreground-secondary">
                  No Firestore allowlist yet. Add your email first to bootstrap
                  admin access for writes.
                </p>
              ) : (
                <ul className="space-y-1.5">
                  {adminEmails.map((email) => (
                    <li
                      key={email}
                      className="flex items-center justify-between rounded-[10px] border border-border px-3 py-2 text-sm"
                    >
                      <span>{email}</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-critical"
                        onClick={() => handleRemoveAdminEmail(email)}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
