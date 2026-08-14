'use client';

import { Sparkles } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { getFirebaseAuth } from '@/src/services/firebase/config';
import { cn } from '@/src/lib/utils';

export type AdminAiReplyTarget = {
  id: string;
  /** Short label in the picker, e.g. "Original post · Alex" */
  label: string;
  /** Optional preview shown under the picker */
  preview: string;
  context: {
    title?: string;
    body?: string;
    messages?: {
      role: 'member' | 'admin';
      authorLabel?: string;
      content: string;
    }[];
  };
};

async function authHeaders(): Promise<HeadersInit> {
  const token = await getFirebaseAuth()?.currentUser?.getIdToken();
  if (!token) throw new Error('Sign in again to generate a reply.');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function truncate(text: string, max = 140): string {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1)}…`;
}

/**
 * Admin reply field with a post picker + AI draft as muted hint text
 * (not typed into the value) until “Use AI generated response” is clicked.
 */
export function AdminAiReplyComposer({
  targets,
  selectedTargetId: controlledTargetId,
  onSelectedTargetIdChange,
  value,
  onChange,
  label = 'Your reply',
  rows = 4,
  maxLength = 8000,
  disabled,
}: {
  targets: AdminAiReplyTarget[];
  /** Optional controlled selection (e.g. from “AI reply” on a post). */
  selectedTargetId?: string | null;
  onSelectedTargetIdChange?: (id: string) => void;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
}) {
  const [internalTargetId, setInternalTargetId] = useState(
    targets[0]?.id ?? '',
  );
  const [draft, setDraft] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestKeyRef = useRef('');

  const selectedTargetId =
    controlledTargetId ??
    (targets.some((t) => t.id === internalTargetId)
      ? internalTargetId
      : (targets[0]?.id ?? ''));

  const selectedTarget = useMemo(
    () => targets.find((t) => t.id === selectedTargetId) ?? targets[0] ?? null,
    [selectedTargetId, targets],
  );

  useEffect(() => {
    if (!targets.length) return;
    if (!targets.some((t) => t.id === selectedTargetId)) {
      const fallback = targets[0].id;
      setInternalTargetId(fallback);
      onSelectedTargetIdChange?.(fallback);
    }
  }, [targets, selectedTargetId, onSelectedTargetIdChange]);

  const selectTarget = (id: string) => {
    setInternalTargetId(id);
    onSelectedTargetIdChange?.(id);
    setDraft(null);
    setError(null);
  };

  const generate = useCallback(async () => {
    if (!selectedTarget) return;
    const key = selectedTarget.id;
    requestKeyRef.current = key;
    setLoading(true);
    setError(null);
    setDraft(null);
    try {
      const headers = await authHeaders();
      const response = await fetch('/api/admin/ai-reply', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: selectedTarget.context.title,
          body: selectedTarget.context.body,
          messages: selectedTarget.context.messages,
          focusLabel: selectedTarget.label,
        }),
      });
      const data = (await response.json()) as {
        draft?: string;
        error?: string;
      };
      if (requestKeyRef.current !== key) return;
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate AI reply.');
      }
      setDraft(data.draft?.trim() || null);
    } catch (err) {
      if (requestKeyRef.current !== key) return;
      setDraft(null);
      setError(
        err instanceof Error ? err.message : 'Could not generate AI reply.',
      );
    } finally {
      if (requestKeyRef.current === key) setLoading(false);
    }
  }, [selectedTarget]);

  // Clear stale draft when selection changes from outside (e.g. “AI reply” on a post).
  useEffect(() => {
    setDraft(null);
    setError(null);
  }, [selectedTarget?.id]);

  if (!targets.length || !selectedTarget) {
    return (
      <Textarea
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        placeholder="Write a reply…"
      />
    );
  }

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        <label
          htmlFor="admin-ai-reply-target"
          className="text-sm font-medium text-foreground"
        >
          Generate AI reply for
        </label>
        <select
          id="admin-ai-reply-target"
          className={cn(
            'h-10 w-full rounded-[12px] border border-border bg-surface px-3 text-sm text-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          )}
          value={selectedTarget.id}
          disabled={disabled || loading}
          onChange={(event) => selectTarget(event.target.value)}
        >
          {targets.map((target) => (
            <option key={target.id} value={target.id}>
              {target.label}
            </option>
          ))}
        </select>
        <p className="line-clamp-2 text-xs text-foreground-secondary">
          {truncate(selectedTarget.preview, 180)}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-medium text-accent">
          <Sparkles className="size-3.5" />
          AI suggested reply
          {loading
            ? ' · generating…'
            : draft
              ? ' · ready'
              : error
                ? ' · failed'
                : ' · choose a post, then generate'}
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            loading={loading}
            disabled={disabled}
            onClick={() => void generate()}
          >
            {draft ? 'Regenerate' : 'Generate AI reply'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!draft || loading || disabled}
            onClick={() => {
              if (draft) onChange(draft);
            }}
          >
            Use AI generated response
          </Button>
        </div>
      </div>
      <Textarea
        label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        placeholder="Type your own reply, or generate an AI suggestion…"
        error={error ?? undefined}
      />
      {!error && (loading || draft) ? (
        <p className="whitespace-pre-wrap text-sm italic leading-relaxed text-foreground-secondary">
          {loading && !draft
            ? `Generating a reply to “${selectedTarget.label}”…`
            : draft}
        </p>
      ) : null}
    </div>
  );
}
