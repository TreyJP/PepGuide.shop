'use client';

import { ExternalLink, Loader2, MessageSquare, RefreshCw, Search } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { cn } from '@/src/lib/utils';
import { getFirebaseAuth } from '@/src/services/firebase/config';

type AdminChatRow = {
  chatId: string;
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName: string;
  title: string;
  lastMessagePreview: string;
  messageCount: number;
  createdAt: string | null;
  updatedAt: string | null;
  archived: boolean;
  temporary: boolean;
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in again to view chats.');
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

export function AdminChatsPanel() {
  const [chats, setChats] = useState<AdminChatRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const loadChats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/admin/chats', { headers });
      const data = (await response.json()) as {
        chats?: AdminChatRow[];
        total?: number;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load chats.');
      }
      setChats(data.chats ?? []);
      setTotal(data.total ?? data.chats?.length ?? 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load chats.');
      setChats([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChats();
  }, [loadChats]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chats;
    return chats.filter((chat) => {
      const haystack = [
        chat.title,
        chat.lastMessagePreview,
        chat.ownerEmail,
        chat.ownerDisplayName,
        chat.chatId,
        chat.ownerUid,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [chats, query]);

  return (
    <div className="mx-auto max-w-5xl space-y-4 p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
            All chats
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Every research chat across accounts. Open a row to view the thread.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => void loadChats()}
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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary" />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, preview, email, user…"
          className="h-10 w-full rounded-[12px] border border-border bg-surface pl-10 pr-3 text-sm text-foreground outline-none focus:border-accent"
        />
      </div>

      <p className="text-xs text-foreground-secondary">
        Showing {filtered.length}
        {total > chats.length ? ` of ${chats.length} loaded` : ''}
        {total > 0 ? ` · ${total} total in Firestore` : null}
      </p>

      {error ? (
        <p className="rounded-[12px] border border-critical/30 bg-critical/5 px-3 py-2 text-sm text-critical">
          {error}
        </p>
      ) : null}

      {loading && chats.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-foreground-secondary">
          <Loader2 className="size-4 animate-spin" />
          Loading chats…
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No chats found"
          description={
            query.trim()
              ? 'Try a different search.'
              : 'Chats will appear here as members start researching.'
          }
        />
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-[16px] border border-border bg-surface">
          {filtered.map((chat) => (
            <li key={`${chat.ownerUid}-${chat.chatId}`}>
              <Link
                href={`/chat/${chat.chatId}`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-secondary/80',
                  chat.archived && 'opacity-60',
                )}
              >
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent-muted text-accent">
                  <MessageSquare className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {chat.title}
                    </span>
                    {chat.temporary ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-foreground-secondary">
                        Temp
                      </span>
                    ) : null}
                    {chat.archived ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-foreground-secondary">
                        Archived
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                    {chat.ownerDisplayName}
                    {chat.ownerEmail ? ` · ${chat.ownerEmail}` : ''}
                    {' · '}
                    {chat.messageCount} message
                    {chat.messageCount === 1 ? '' : 's'}
                    {' · '}
                    {formatWhen(chat.updatedAt || chat.createdAt)}
                  </p>
                  {chat.lastMessagePreview ? (
                    <p className="mt-1 line-clamp-2 text-sm text-foreground-secondary">
                      {chat.lastMessagePreview}
                    </p>
                  ) : null}
                </div>
                <ExternalLink className="mt-1 size-4 shrink-0 text-foreground-secondary" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
