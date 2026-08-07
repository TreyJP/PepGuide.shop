'use client';

import {
  ArrowDown,
  ArrowLeft,
  MessageSquare,
  Pencil,
  Pin,
  PinOff,
  Trash2,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

import { MarkdownContent } from '@/src/components/chat/markdown-content';
import { AuthorLabel } from '@/src/components/pro/admin-badge';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { cn, formatRelativeDate } from '@/src/lib/utils';
import type { ForumPost, ForumReply } from '@/src/types';

export const FORUM_REPLY_COMPOSER_ID = 'forum-reply-composer';

export function scrollToForumReply(focus = true) {
  const target = document.getElementById(FORUM_REPLY_COMPOSER_ID);
  if (!target) return;
  target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if (!focus) return;
  window.setTimeout(() => {
    const field = target.querySelector('textarea');
    field?.focus({ preventScroll: true });
  }, 350);
}

export function ThreadTopBar({
  isAuthor,
  isAdmin,
  canDelete,
  editing,
  pinned,
  pinBusy,
  deleteBusy,
  onBack,
  onEdit,
  onDelete,
  onTogglePin,
  trailing,
}: {
  isAuthor: boolean;
  isAdmin: boolean;
  canDelete: boolean;
  editing: boolean;
  pinned: boolean;
  pinBusy: boolean;
  deleteBusy: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
        <ArrowLeft className="size-4" />
        All posts
      </Button>
      <div className="flex flex-wrap items-center gap-2">
        {trailing}
        {!editing ? (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => scrollToForumReply()}
          >
            <MessageSquare className="size-3.5" />
            Reply
          </Button>
        ) : null}
        {isAuthor && !editing ? (
          <Button size="sm" variant="secondary" onClick={onEdit}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
        ) : null}
        {isAdmin ? (
          <Button
            size="sm"
            variant="secondary"
            loading={pinBusy}
            onClick={onTogglePin}
          >
            {pinned ? (
              <>
                <PinOff className="size-3.5" />
                Unpin
              </>
            ) : (
              <>
                <Pin className="size-3.5" />
                Pin
              </>
            )}
          </Button>
        ) : null}
        {canDelete && !editing ? (
          <Button
            size="sm"
            variant="destructive"
            loading={deleteBusy}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}

/** Floating jump control when the reply box is off-screen. */
export function JumpToReplyFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let cancelled = false;

    const attach = () => {
      const target = document.getElementById(FORUM_REPLY_COMPOSER_ID);
      if (!target || cancelled) return false;

      observer = new IntersectionObserver(
        ([entry]) => {
          setVisible(!entry?.isIntersecting);
        },
        { root: null, threshold: 0.15 },
      );
      observer.observe(target);
      return true;
    };

    if (!attach()) {
      const timer = window.setInterval(() => {
        if (attach()) window.clearInterval(timer);
      }, 120);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        observer?.disconnect();
      };
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollToForumReply()}
      className={cn(
        'fixed bottom-5 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(0,87,255,0.35)] transition-all duration-200 sm:bottom-6 sm:right-6',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        visible
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-3 opacity-0',
      )}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
    >
      <ArrowDown className="size-4" />
      Jump to reply
    </button>
  );
}

export function ThreadPinnedChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
      <Pin className="size-2.5" />
      Pinned
    </span>
  );
}

export function ThreadPostMeta({
  post,
  onOpenRank,
}: {
  post: ForumPost;
  onOpenRank: (
    authorId: string,
    displayName: string,
    authorIsAdmin: boolean,
  ) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
      <AuthorLabel
        name={post.authorDisplayName}
        isAdmin={post.authorIsAdmin}
        onClick={() =>
          onOpenRank(
            post.authorId,
            post.authorDisplayName,
            post.authorIsAdmin,
          )
        }
      />
      <span>{formatRelativeDate(post.createdAt)}</span>
      {post.updatedAt !== post.createdAt ? (
        <span>Edited {formatRelativeDate(post.updatedAt)}</span>
      ) : null}
    </div>
  );
}

export function ThreadReplyMeta({
  reply,
  onOpenRank,
  canDelete,
  deleteBusy,
  onDelete,
}: {
  reply: ForumReply;
  onOpenRank: (
    authorId: string,
    displayName: string,
    authorIsAdmin: boolean,
  ) => void;
  canDelete?: boolean;
  deleteBusy?: boolean;
  onDelete?: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-secondary">
        <AuthorLabel
          name={reply.authorDisplayName}
          isAdmin={reply.authorIsAdmin}
          onClick={() =>
            onOpenRank(
              reply.authorId,
              reply.authorDisplayName,
              reply.authorIsAdmin,
            )
          }
        />
        <span>{formatRelativeDate(reply.createdAt)}</span>
      </div>
      {canDelete && onDelete ? (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          loading={deleteBusy}
          onClick={onDelete}
          className="h-7 px-2 text-critical hover:bg-critical/10 hover:text-critical"
          aria-label="Delete reply"
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      ) : null}
    </div>
  );
}

export function ThreadPostBody({ content }: { content: string }) {
  return <MarkdownContent content={content} variant="forum" />;
}

export function ThreadReplyComposer({
  replyBody,
  onReplyBodyChange,
  onSubmitReply,
  saving,
  isAdmin,
  error,
}: {
  replyBody: string;
  onReplyBodyChange: (value: string) => void;
  onSubmitReply: () => void;
  saving: boolean;
  isAdmin: boolean;
  error: string | null;
}) {
  return (
    <div id={FORUM_REPLY_COMPOSER_ID} className="scroll-mt-24 space-y-2">
      <Textarea
        label="Your reply"
        value={replyBody}
        onChange={(event) => onReplyBodyChange(event.target.value)}
        maxLength={8000}
        rows={4}
        placeholder="Markdown works here too — # headers, * lists, **bold**…"
        hint="Markdown formatting is supported."
      />
      {isAdmin ? (
        <p className="text-xs text-accent">
          You’ll appear as PepGuide Admin on this reply.
        </p>
      ) : null}
      {error ? <p className="text-sm text-critical">{error}</p> : null}
      <Button
        loading={saving}
        disabled={!replyBody.trim()}
        onClick={onSubmitReply}
        className="w-full sm:w-auto"
      >
        Reply
      </Button>
    </div>
  );
}
