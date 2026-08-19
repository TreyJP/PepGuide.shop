'use client';

import { ArrowLeft, CheckCircle2, RefreshCw, Send } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  AdminAiReplyComposer,
  type AdminAiReplyTarget,
} from '@/src/components/admin/admin-ai-reply-composer';
import { AdminBadge } from '@/src/components/pro/admin-badge';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { cn, getDisplayFirstName } from '@/src/lib/utils';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import type { ProConsult, ProConsultMessage } from '@/src/types/consults';

function statusLabel(status: ProConsult['status']): string {
  if (status === 'answered') return 'Answered';
  if (status === 'closed') return 'Closed';
  return 'Open';
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
    return '';
  }
}

type Filter = 'all' | 'open' | 'answered' | 'closed';

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in again to manage consults.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

export function AdminConsultsPanel() {
  const [filter, setFilter] = useState<Filter>('open');
  const [consults, setConsults] = useState<ProConsult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ProConsultMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedAiTargetId, setSelectedAiTargetId] = useState<string | null>(
    null,
  );
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selected = consults.find((item) => item.id === selectedId) ?? null;

  const aiTargets = useMemo((): AdminAiReplyTarget[] => {
    if (!selected) return [];
    const memberMessages = messages.filter((message) => !message.authorIsAdmin);
    if (memberMessages.length === 0) {
      return [
        {
          id: `consult:${selected.id}`,
          label: `Consult · ${getDisplayFirstName(selected.userDisplayName)}`,
          preview: selected.subject,
          context: {
            title: selected.subject,
            body: selected.lastMessagePreview || selected.subject,
            messages: [],
          },
        },
      ];
    }
    return memberMessages.map((message, index) => ({
      id: `message:${message.id}`,
      label: `Message ${index + 1} · ${getDisplayFirstName(message.authorDisplayName)}`,
      preview: message.body,
      context: {
        title: selected.subject,
        body: message.body,
        messages: messages
          .filter((item) => item.id !== message.id)
          .slice(-8)
          .map((item) => ({
            role: item.authorIsAdmin ? ('admin' as const) : ('member' as const),
            authorLabel: item.authorDisplayName,
            content: item.body,
          })),
      },
    }));
  }, [selected, messages]);

  useEffect(() => {
    setSelectedAiTargetId(aiTargets[0]?.id ?? null);
    setReply('');
  }, [selectedId, aiTargets[0]?.id]);

  const loadConsults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const query =
        filter === 'all' ? '' : `?status=${encodeURIComponent(filter)}`;
      const response = await fetch(`/api/admin/consults${query}`, { headers });
      const data = (await response.json()) as {
        consults?: ProConsult[];
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to load consults.');
      }
      setConsults(data.consults ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load consults.');
      setConsults([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadConsults();
  }, [loadConsults]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    void (async () => {
      try {
        const headers = await authHeaders();
        const response = await fetch(`/api/admin/consults/${selectedId}`, {
          headers,
        });
        const data = (await response.json()) as {
          messages?: ProConsultMessage[];
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error || 'Unable to load messages.');
        }
        if (!cancelled) setMessages(data.messages ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to load messages.',
          );
          setMessages([]);
        }
      } finally {
        if (!cancelled) setMessagesLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, selectedId]);

  async function handleReply() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/consults/${selected.id}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ body: reply }),
      });
      const data = (await response.json()) as {
        message?: ProConsultMessage;
        error?: string;
      };
      if (!response.ok || !data.message) {
        throw new Error(data.error || 'Unable to send reply.');
      }
      setReply('');
      setMessages((current) => [...current, data.message!]);
      await loadConsults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reply.');
    } finally {
      setBusy(false);
    }
  }

  async function handleClose() {
    if (!selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      const headers = await authHeaders();
      const response = await fetch(`/api/admin/consults/${selected.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'closed' }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || 'Unable to close consult.');
      }
      setSelectedId(null);
      await loadConsults();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to close consult.');
    } finally {
      setBusy(false);
    }
  }

  if (selected) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-3 p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Ask a Professional inbox
        </button>

        <div className="rounded-[16px] border border-border bg-surface px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-xl font-semibold text-foreground">
              {selected.subject}
            </h2>
            <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
              {statusLabel(selected.status)}
            </span>
          </div>
          <p className="mt-1 text-sm text-foreground-secondary">
            From {selected.userDisplayName} · {formatWhen(selected.createdAt)}
          </p>
        </div>

        <div className="flex max-h-[50vh] flex-col gap-2.5 overflow-y-auto rounded-[16px] border border-border bg-surface-secondary/40 p-4">
          {messagesLoading ? (
            <p className="text-sm text-foreground-secondary">Loading thread…</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'max-w-[90%] rounded-[14px] px-3.5 py-2.5 text-sm leading-relaxed',
                  message.authorIsAdmin
                    ? 'self-end bg-accent text-white'
                    : 'self-start border border-border bg-surface text-foreground',
                )}
              >
                <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[11px] font-medium opacity-80">
                  <span>{message.authorDisplayName}</span>
                  {message.authorIsAdmin ? <AdminBadge /> : null}
                  <span>· {formatWhen(message.createdAt)}</span>
                </div>
                <p className="whitespace-pre-wrap">{message.body}</p>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {!messagesLoading ? (
          <AdminAiReplyComposer
            label="Reply as admin"
            value={reply}
            onChange={setReply}
            rows={4}
            maxLength={8000}
            disabled={busy}
            targets={aiTargets}
            selectedTargetId={selectedAiTargetId}
            onSelectedTargetIdChange={setSelectedAiTargetId}
          />
        ) : (
          <p className="text-sm text-foreground-secondary">
            Loading thread before drafting a reply…
          </p>
        )}
        {error ? <p className="text-sm text-critical">{error}</p> : null}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            loading={busy}
            disabled={reply.trim().length < 1}
            onClick={() => void handleReply()}
          >
            <Send className="size-4" />
            Send reply
          </Button>
          {selected.status !== 'closed' ? (
            <Button
              type="button"
              variant="secondary"
              loading={busy}
              onClick={() => void handleClose()}
            >
              <CheckCircle2 className="size-4" />
              Mark closed
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Ask a Professional inbox
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            One-on-one questions from members. Open a thread to reply.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => void loadConsults()}
          disabled={loading}
        >
          <RefreshCw className={cn('size-3.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(
          [
            ['open', 'Open'],
            ['answered', 'Answered'],
            ['closed', 'Closed'],
            ['all', 'All'],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            className={cn(
              'h-9 rounded-[10px] border px-3 text-sm font-semibold transition-colors',
              filter === value
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-foreground-secondary hover:bg-surface-secondary',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading questions…</p>
      ) : consults.length === 0 ? (
        <EmptyState
          title="No questions in this view"
          description="When members send Ask a Professional questions, they appear here for you to answer."
        />
      ) : (
        <ul className="space-y-2">
          {consults.map((consult) => (
            <li key={consult.id}>
              <button
                type="button"
                onClick={() => setSelectedId(consult.id)}
                className="flex w-full flex-col gap-1 rounded-[16px] border border-border bg-surface px-4 py-3 text-left hover:bg-surface-secondary"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {consult.subject}
                  </span>
                  <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
                    {statusLabel(consult.status)}
                  </span>
                </div>
                <p className="text-xs text-foreground-secondary">
                  {consult.userDisplayName} · Updated{' '}
                  {formatWhen(consult.updatedAt)}
                </p>
                <p className="line-clamp-2 text-sm text-foreground-secondary">
                  {consult.lastMessagePreview}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
