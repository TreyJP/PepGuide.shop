'use client';

import { RefreshCw, Search, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { isTestAccountEmail } from '@/src/constants/test-accounts';
import { cn } from '@/src/lib/utils';
import { getFirebaseAuth } from '@/src/services/firebase/config';

type AdminUserRow = {
  id: string;
  email: string;
  displayName: string;
  createdAt: string | null;
  updatedAt: string | null;
  chatCount: number;
  accountStatus: string;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in again to view users.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function formatWhen(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

/** @deprecated Prefer AdminUsersPanel — kept as alias for existing imports. */
export function AdminPremiumUsersPanel() {
  return <AdminUsersPanel />;
}

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/admin/users?tier=all', { headers });
      const data = (await response.json()) as {
        users?: AdminUserRow[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load users.');
      }
      setUsers(data.users ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter((user) => {
      const haystack = [user.displayName, user.email, user.id, user.accountStatus]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }, [users, query]);

  const activeCount = useMemo(
    () => users.filter((user) => (user.accountStatus || 'active') === 'active').length,
    [users],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Users
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            All registered accounts across PepGuide.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void loadUsers()}
          disabled={loading}
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Total users
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-foreground">
            {users.length}
          </p>
        </div>
        <div className="rounded-[14px] border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Active accounts
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums text-accent">
            {activeCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, email, or user id…"
            className="h-10 w-full rounded-[12px] border border-border bg-surface pl-9 pr-3 text-sm text-foreground outline-none ring-accent focus:ring-2"
          />
        </div>
        <p className="text-sm text-foreground-secondary">
          {loading
            ? 'Loading…'
            : `${filtered.length}${
                filtered.length === users.length ? '' : ` of ${users.length}`
              } shown`}
        </p>
      </div>

      {error ? (
        <p className="rounded-[12px] border border-critical/30 bg-critical-muted px-3 py-2 text-sm text-critical">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading users…</p>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Users}
          title={users.length === 0 ? 'No users yet' : 'No matches'}
          description={
            users.length === 0
              ? 'Registered accounts will appear here once people sign up.'
              : 'Try a different search.'
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[16px] border border-border bg-surface">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-border bg-surface-secondary/70 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
                <tr>
                  <th className="px-4 py-3">Member</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Chats</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => {
                  const isTest = isTestAccountEmail(user.email);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-border/70 last:border-b-0"
                    >
                      <td className="px-4 py-3 align-top">
                        <p className="font-semibold text-foreground">
                          {user.displayName || 'Member'}
                        </p>
                        <p className="mt-0.5 text-foreground-secondary">
                          {user.email || 'No email'}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-foreground-secondary">
                          {user.id}
                        </p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]',
                            isTest
                              ? 'bg-amber-500/15 text-amber-800'
                              : 'bg-surface-secondary text-foreground-secondary',
                          )}
                        >
                          {isTest ? 'Test account' : user.accountStatus || 'active'}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top tabular-nums text-foreground">
                        {user.chatCount}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-foreground-secondary">
                        {formatWhen(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-foreground-secondary">
                        {formatWhen(user.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
