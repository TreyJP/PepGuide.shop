'use client';

import type { ForumThreadDesignProps } from '@/src/components/pro/designs/types';
import {
  ThreadPostBody,
  ThreadPostMeta,
  ThreadPinnedChip,
  ThreadReplyComposer,
  ThreadReplyMeta,
  ThreadTopBar,
} from '@/src/components/pro/designs/forum-thread-shared';
import { cn } from '@/src/lib/utils';

export function ForumThreadStrand(props: ForumThreadDesignProps) {
  const { post, replies, editing, editSlot } = props;

  return (
    <div className="space-y-4">
      <ThreadTopBar
        isAuthor={props.isAuthor}
        isAdmin={props.isAdmin}
        canDelete={props.canDelete}
        editing={editing}
        pinned={post.pinned}
        pinBusy={props.pinBusy}
        deleteBusy={props.deleteBusy}
        onBack={props.onBack}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
        onTogglePin={props.onTogglePin}
      />

      <article className="fth-strand-post space-y-3">
        {post.pinned ? <ThreadPinnedChip /> : null}
        {editing ? (
          editSlot
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
              Original post
            </p>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-foreground sm:text-2xl">
              {post.title}
            </h2>
            <ThreadPostMeta post={post} onOpenRank={props.onOpenRank} />
            <ThreadPostBody content={post.body} />
          </>
        )}
      </article>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">
          Replies ({replies.length})
        </h3>
        {replies.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            No replies yet — start the discussion.
          </p>
        ) : (
          <ul className="fth-strand-list">
            {replies.map((reply) => {
              const canDeleteReply =
                props.isAdmin ||
                Boolean(
                  props.currentUserId && reply.authorId === props.currentUserId,
                );
              return (
                <li
                  key={reply.id}
                  className={cn(
                    'fth-strand-reply',
                    reply.authorIsAdmin && 'fth-strand-reply--admin',
                  )}
                >
                  <ThreadReplyMeta
                    reply={reply}
                    onOpenRank={props.onOpenRank}
                    canDelete={canDeleteReply}
                    deleteBusy={props.deletingReplyId === reply.id}
                    onDelete={() => props.onDeleteReply(reply.id)}
                  />
                  <div className="mt-1.5">
                    <ThreadPostBody content={reply.body} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        <div className="fth-strand-reply">
          <ThreadReplyComposer
            replyBody={props.replyBody}
            onReplyBodyChange={props.onReplyBodyChange}
            onSubmitReply={props.onSubmitReply}
            saving={props.saving}
            isAdmin={props.isAdmin}
            error={props.error}
          />
        </div>
      </section>
    </div>
  );
}
