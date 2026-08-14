'use client';

import { useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';

import type { AdminAiReplyTarget } from '@/src/components/admin/admin-ai-reply-composer';
import type { ForumThreadDesignProps } from '@/src/components/pro/designs/types';
import {
  ThreadPostBody,
  ThreadPostMeta,
  ThreadPinnedChip,
  ThreadReplyComposer,
  ThreadReplyMeta,
  ThreadTopBar,
  scrollToForumReply,
} from '@/src/components/pro/designs/forum-thread-shared';
import { Button } from '@/src/components/ui/button';
import { cn, getDisplayFirstName } from '@/src/lib/utils';

export function ForumThreadStrand(props: ForumThreadDesignProps) {
  const { post, replies, editing, editSlot } = props;
  const [selectedAiTargetId, setSelectedAiTargetId] = useState<string>(
    `post:${post.id}`,
  );

  const aiTargets = useMemo((): AdminAiReplyTarget[] => {
    if (!props.isAdmin) return [];

    const targets: AdminAiReplyTarget[] = [
      {
        id: `post:${post.id}`,
        label: `Original post · ${getDisplayFirstName(post.authorDisplayName)}`,
        preview: `${post.title} — ${post.body}`,
        context: {
          title: post.title,
          body: post.body,
          messages: [],
        },
      },
    ];

    for (const reply of replies) {
      targets.push({
        id: `reply:${reply.id}`,
        label: `Reply · ${getDisplayFirstName(reply.authorDisplayName)}`,
        preview: reply.body,
        context: {
          title: post.title,
          body: reply.body,
          messages: [
            {
              role: 'member',
              authorLabel: post.authorDisplayName,
              content: `Original post (${post.title}): ${post.body}`,
            },
          ],
        },
      });
    }

    return targets;
  }, [props.isAdmin, post, replies]);

  function chooseAiTarget(id: string) {
    setSelectedAiTargetId(id);
    scrollToForumReply(true);
  }

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

      <article
        className={cn(
          'fth-strand-post space-y-3',
          props.isAdmin &&
            selectedAiTargetId === `post:${post.id}` &&
            'ring-2 ring-accent/40',
        )}
      >
        {post.pinned ? <ThreadPinnedChip /> : null}
        {editing ? (
          editSlot
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent">
                Original post
              </p>
              {props.isAdmin ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="h-7 px-2"
                  onClick={() => chooseAiTarget(`post:${post.id}`)}
                >
                  <Sparkles className="size-3.5" />
                  AI reply
                </Button>
              ) : null}
            </div>
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
              const targetId = `reply:${reply.id}`;
              return (
                <li
                  key={reply.id}
                  className={cn(
                    'fth-strand-reply',
                    reply.authorIsAdmin && 'fth-strand-reply--admin',
                    props.isAdmin &&
                      selectedAiTargetId === targetId &&
                      'ring-2 ring-accent/40',
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
                  {props.isAdmin ? (
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => chooseAiTarget(targetId)}
                      >
                        <Sparkles className="size-3.5" />
                        AI reply to this
                      </Button>
                    </div>
                  ) : null}
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
            aiTargets={aiTargets}
            selectedAiTargetId={selectedAiTargetId}
            onSelectedAiTargetIdChange={setSelectedAiTargetId}
          />
        </div>
      </section>
    </div>
  );
}
