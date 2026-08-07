'use client';

import { Pin, PinOff } from 'lucide-react';

import { AuthorLabel } from '@/src/components/pro/admin-badge';
import { Button } from '@/src/components/ui/button';
import { formatRelativeDate } from '@/src/lib/utils';
import type { ForumPost } from '@/src/types';

export function PinnedChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">
      <Pin className="size-2.5" />
      Pinned
    </span>
  );
}

export function PostMeta({
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
      <span>
        {post.replyCount} {post.replyCount === 1 ? 'reply' : 'replies'}
      </span>
      <span>Updated {formatRelativeDate(post.updatedAt)}</span>
    </div>
  );
}

export function PinControl({
  post,
  busy,
  onToggle,
}: {
  post: ForumPost;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className="mt-1 size-9 shrink-0"
      loading={busy}
      aria-label={post.pinned ? 'Unpin post' : 'Pin post'}
      onClick={onToggle}
    >
      {post.pinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
    </Button>
  );
}
