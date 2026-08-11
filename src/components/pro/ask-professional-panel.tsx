'use client';

import { ArrowLeft, MessageCircleQuestion, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { AdminBadge } from '@/src/components/pro/admin-badge';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { Input } from '@/src/components/ui/input';
import { Textarea } from '@/src/components/ui/textarea';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { cn } from '@/src/lib/utils';
import { consultsRepository } from '@/src/services/firestore/consults';
import { useAuthStore } from '@/src/stores/auth-store';
import type { ProConsult, ProConsultMessage } from '@/src/types/consults';

function statusLabel(status: ProConsult['status']): string {
  if (status === 'answered') return 'Answered';
  if (status === 'closed') return 'Closed';
  return 'Awaiting reply';
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

export function AskProfessionalPanel() {
  const user = useAuthStore((state) => state.user);
  const { isAdmin } = useAdminAccess();
  const [consults, setConsults] = useState<ProConsult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ProConsultMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const selected = consults.find((item) => item.id === selectedId) ?? null;

  async function refreshList() {
    if (!user) return;
    const list = await consultsRepository.listMine(user.id);
    setConsults(list);
  }

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void consultsRepository
      .listMine(user.id)
      .then((list) => {
        if (!cancelled) {
          setConsults(list);
          setError(null);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : 'Unable to load consults.',
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!selectedId) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    void consultsRepository
      .listMessages(selectedId)
      .then((list) => {
        if (!cancelled) setMessages(list);
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setMessagesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, selectedId]);

  async function handleCreate() {
    if (!user || busy) return;
    setBusy(true);
    setError(null);
    try {
      const created = await consultsRepository.createConsult({
        subject,
        body,
        userDisplayName: user.displayName || 'Member',
        authorIsAdmin: isAdmin,
      });
      await refreshList();
      setSubject('');
      setBody('');
      setComposing(false);
      setSelectedId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send question.');
    } finally {
      setBusy(false);
    }
  }

  async function handleReply() {
    if (!user || !selected || busy) return;
    setBusy(true);
    setError(null);
    try {
      await consultsRepository.addMessage({
        consultId: selected.id,
        body: reply,
        authorDisplayName: user.displayName || 'Member',
        authorIsAdmin: isAdmin,
      });
      setReply('');
      const [list, msgs] = await Promise.all([
        consultsRepository.listMine(user.id),
        consultsRepository.listMessages(selected.id),
      ]);
      setConsults(list);
      setMessages(msgs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send reply.');
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to ask a professional"
        description="One-on-one questions go privately to the PepGuide admin team."
      />
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-foreground-secondary">Loading your questions…</p>
    );
  }

  if (composing) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setComposing(false)}
          className="inline-flex items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back
        </button>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
            Ask a professional
          </h2>
          <p className="mt-1 text-sm text-foreground-secondary">
            Private educational questions only — not medical advice or dosing
            instructions for personal use.
          </p>
        </div>
        <Input
          label="Subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          placeholder="What are you researching?"
          maxLength={120}
        />
        <Textarea
          label="Your question"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Share context, what you’ve already read, and what you’re trying to understand."
          rows={7}
          maxLength={8000}
        />
        {error ? <p className="text-sm text-critical">{error}</p> : null}
        <Button
          type="button"
          loading={busy}
          disabled={subject.trim().length < 4 || body.trim().length < 8}
          onClick={() => void handleCreate()}
        >
          <Send className="size-4" />
          Send to admin team
        </Button>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="flex min-h-[420px] flex-col gap-3">
        <button
          type="button"
          onClick={() => setSelectedId(null)}
          className="inline-flex w-fit items-center gap-1.5 text-sm text-foreground-secondary hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          All questions
        </button>

        <div className="rounded-[16px] border border-border bg-surface px-3.5 py-3 sm:px-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="min-w-0 flex-1 font-[family-name:var(--font-display)] text-lg font-semibold text-foreground">
              {selected.subject}
            </h2>
            <span className="rounded-full bg-surface-secondary px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
              {statusLabel(selected.status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-foreground-secondary">
            Started {formatWhen(selected.createdAt)}
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain rounded-[16px] border border-border bg-surface-secondary/40 p-3 sm:p-4">
          {messagesLoading ? (
            <p className="text-sm text-foreground-secondary">Loading thread…</p>
          ) : (
            messages.map((message) => {
              const mine = message.authorId === user.id && !message.authorIsAdmin;
              return (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[92%] rounded-[14px] px-3.5 py-2.5 text-sm leading-relaxed sm:max-w-[80%]',
                    message.authorIsAdmin
                      ? 'self-start border border-accent/25 bg-accent-muted text-foreground'
                      : mine
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
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {selected.status === 'closed' ? (
          <p className="text-sm text-foreground-secondary">
            This consult is closed. Start a new question if you need more help.
          </p>
        ) : (
          <div className="space-y-2">
            <Textarea
              label="Follow-up"
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              placeholder="Add a follow-up for the admin team…"
              rows={3}
              maxLength={8000}
            />
            {error ? <p className="text-sm text-critical">{error}</p> : null}
            <Button
              type="button"
              loading={busy}
              disabled={reply.trim().length < 1}
              onClick={() => void handleReply()}
            >
              <Send className="size-4" />
              Send follow-up
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-foreground-secondary">
            Private one-on-one questions for the PepGuide admin team. Educational
            research help only.
          </p>
        </div>
        <Button type="button" size="sm" onClick={() => setComposing(true)}>
          <MessageCircleQuestion className="size-4" />
          New question
        </Button>
      </div>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      {consults.length === 0 ? (
        <EmptyState
          title="No questions yet"
          description="Ask the admin team privately about research framing, evidence, or how to use PepGuide Pro."
          action={
            <Button type="button" onClick={() => setComposing(true)}>
              Ask a professional
            </Button>
          }
        />
      ) : (
        <ul className="space-y-2">
          {consults.map((consult) => (
            <li key={consult.id}>
              <button
                type="button"
                onClick={() => setSelectedId(consult.id)}
                className="flex w-full flex-col gap-1 rounded-[16px] border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:bg-surface-secondary sm:px-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                    {consult.subject}
                  </span>
                  <span className="rounded-full bg-surface-secondary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-foreground-secondary">
                    {statusLabel(consult.status)}
                  </span>
                </div>
                <p className="line-clamp-2 text-xs text-foreground-secondary">
                  {consult.lastMessagePreview}
                </p>
                <p className="text-[11px] text-foreground-secondary">
                  Updated {formatWhen(consult.updatedAt)} · {consult.messageCount}{' '}
                  message{consult.messageCount === 1 ? '' : 's'}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
