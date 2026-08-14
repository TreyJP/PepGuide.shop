'use client';

import { markdownToPreview } from '@/src/components/chat/markdown-content';
import {
  PinControl,
  PinnedChip,
  PostMeta,
} from '@/src/components/pro/designs/forum-list-shared';
import type { ForumListDesignProps } from '@/src/components/pro/designs/types';
import { cn } from '@/src/lib/utils';

export function ForumListAgora({
  posts,
  isAdmin,
  pinBusyId,
  needsAdminReplyIds,
  onOpenPost,
  onOpenRank,
  onTogglePin,
}: ForumListDesignProps) {
  return (
    <div className="forum-agora-shell">
      <ul className="forum-agora-list">
        {posts.map((post) => {
          const needsReply = Boolean(needsAdminReplyIds?.has(post.id));
          return (
          <li key={post.id} className={cn(post.pinned && 'is-pinned')}>
            <div
              className={cn(
                'forum-agora-tile',
                post.pinned && 'is-pinned',
                needsReply && 'forum-agora-tile--needs-reply',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPost(post.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {post.pinned ? <PinnedChip /> : null}
                    {needsReply ? (
                      <span className="forum-needs-reply-chip">Needs reply</span>
                    ) : null}
                    <h2 className="forum-agora-title">{post.title}</h2>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground-secondary">
                    {markdownToPreview(post.body, 160)}
                  </p>
                </button>
                {isAdmin ? (
                  <PinControl
                    post={post}
                    busy={pinBusyId === post.id}
                    onToggle={() => onTogglePin(post)}
                  />
                ) : null}
              </div>
              <PostMeta post={post} onOpenRank={onOpenRank} />
            </div>
          </li>
          );
        })}
      </ul>
    </div>
  );
}
