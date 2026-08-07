'use client';

import { MessageSquarePlus, Search } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import { MarkdownContent } from '@/src/components/chat/markdown-content';
import { ForumListAgora } from '@/src/components/pro/designs/forum-list-agora';
import { ForumThreadStrand } from '@/src/components/pro/designs/forum-thread-strand';
import { JumpToReplyFab } from '@/src/components/pro/designs/forum-thread-shared';
import '@/src/components/pro/forum-designs.css';
import '@/src/components/pro/forum-thread-designs.css';
import {
  MemberRankSheet,
  type MemberRankTarget,
} from '@/src/components/pro/member-rank-sheet';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { Input } from '@/src/components/ui/input';
import { ModalShell } from '@/src/components/ui/modal-shell';
import { Textarea } from '@/src/components/ui/textarea';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { forumRepository } from '@/src/services/firestore/forum';
import { publicProfileRepository } from '@/src/services/firestore/public-profiles';
import { useAuthStore } from '@/src/stores/auth-store';
import type { ForumPost, ForumReply } from '@/src/types';

export function ForumPanel() {
  const user = useAuthStore((state) => state.user);
  const { isAdmin, loading: adminLoading } = useAdminAccess();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);
  const [rankTarget, setRankTarget] = useState<MemberRankTarget | null>(null);
  const [pinBusyId, setPinBusyId] = useState<string | null>(null);

  const syncProfile = useCallback(async () => {
    if (!user || adminLoading) return;
    try {
      await publicProfileRepository.syncOwnProfile({
        displayName: user.displayName || 'Researcher',
        photoURL: user.photoURL,
        isAdmin,
      });
    } catch {
      // best-effort
    }
  }, [user, isAdmin, adminLoading]);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await forumRepository.listPosts({ query, limit: 80 });
      setPosts(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load posts.');
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void syncProfile();
  }, [syncProfile]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const openRank = (authorId: string, displayName: string, authorIsAdmin: boolean) => {
    setRankTarget({
      userId: authorId,
      displayName,
      isAdmin: authorIsAdmin,
    });
  };

  const togglePin = async (post: ForumPost) => {
    setPinBusyId(post.id);
    setError(null);
    try {
      await forumRepository.setPinned(post.id, !post.pinned);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update pin.');
    } finally {
      setPinBusyId(null);
    }
  };

  if (selectedId) {
    return (
      <>
        <ForumThread
          postId={selectedId}
          isAdmin={isAdmin}
          currentUserId={user?.id ?? null}
          displayName={user?.displayName || 'Researcher'}
          onOpenRank={openRank}
          onBack={() => {
            setSelectedId(null);
            void loadPosts();
          }}
        />
        <MemberRankSheet
          target={rankTarget}
          onClose={() => setRankTarget(null)}
        />
      </>
    );
  }

  return (
    <div className="forum-root">
      <div className="forum-toolbar">
        <form
          className="forum-toolbar__search"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(searchInput.trim());
          }}
        >
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-foreground-secondary" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search posts…"
              className="pl-9"
              aria-label="Search questions and discussion"
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0">
            Search
          </Button>
        </form>
        <Button
          onClick={() => setComposerOpen(true)}
          className="forum-toolbar__compose w-full sm:w-auto"
        >
          <MessageSquarePlus className="size-4" />
          New post
        </Button>
      </div>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading posts…</p>
      ) : posts.length === 0 ? (
        <EmptyState
          title={query ? 'No matching posts' : 'No posts yet'}
          description={
            query
              ? 'Try a different search, or start a new thread.'
              : 'Be the first to start a research conversation.'
          }
        />
      ) : (
        <ForumListAgora
          posts={posts}
          isAdmin={isAdmin}
          pinBusyId={pinBusyId}
          onOpenPost={setSelectedId}
          onOpenRank={openRank}
          onTogglePin={(post) => void togglePin(post)}
        />
      )}

      <NewPostModal
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        isAdmin={isAdmin}
        displayName={user?.displayName || 'Researcher'}
        onCreated={(post) => {
          setComposerOpen(false);
          setSelectedId(post.id);
        }}
      />

      <MemberRankSheet
        target={rankTarget}
        onClose={() => setRankTarget(null)}
      />
    </div>
  );
}

function NewPostModal({
  open,
  onClose,
  isAdmin,
  displayName,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  displayName: string;
  onCreated: (post: ForumPost) => void;
}) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  useEffect(() => {
    if (!open) {
      setTitle('');
      setBody('');
      setError(null);
      setSaving(false);
      setMode('write');
    }
  }, [open]);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="New post"
      titleId="forum-new-post"
      eyebrow="Questions & Discussion"
      description="Markdown supported — use # for headers, ### for subheads, lists, quotes, and --- dividers."
      className="max-w-2xl"
      footer="Keep it educational and respectful. No profanity, sourcing, buying/selling, or promo codes."
    >
      <div className="space-y-3">
        <Input
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={160}
          placeholder="What’s the topic?"
        />

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === 'write' ? 'secondary' : 'ghost'}
            onClick={() => setMode('write')}
          >
            Write
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === 'preview' ? 'secondary' : 'ghost'}
            onClick={() => setMode('preview')}
          >
            Preview
          </Button>
        </div>

        {mode === 'write' ? (
          <Textarea
            label="Body"
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={20000}
            rows={10}
            className="min-h-[220px] sm:min-h-[280px]"
            placeholder={[
              '# Section header',
              '',
              'Your intro paragraph…',
              '',
              '### Subheading',
              '',
              '* Bullet point',
              '',
              '> Quoted example',
              '',
              '---',
            ].join('\n')}
            hint="Tip: paste guideline posts with # headers — Preview shows the formatted result."
          />
        ) : (
          <div className="min-h-[280px] rounded-[14px] border border-border bg-surface px-3.5 py-3">
            {body.trim() ? (
              <MarkdownContent content={body} variant="forum" />
            ) : (
              <p className="text-sm text-foreground-secondary">
                Nothing to preview yet.
              </p>
            )}
          </div>
        )}

        {isAdmin ? (
          <p className="text-xs text-accent">
            You’ll appear as PepGuide Admin on this post.
          </p>
        ) : null}
        {error ? <p className="text-sm text-critical">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            loading={saving}
            onClick={async () => {
              setSaving(true);
              setError(null);
              try {
                const post = await forumRepository.createPost({
                  title,
                  body,
                  authorDisplayName: displayName,
                  authorIsAdmin: isAdmin,
                });
                onCreated(post);
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : 'Could not create post.',
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            Post
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

function EditPostForm({
  post,
  onCancel,
  onSaved,
}: {
  post: ForumPost;
  onCancel: () => void;
  onSaved: () => Promise<void>;
}) {
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        maxLength={160}
      />
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="sm"
          variant={mode === 'write' ? 'secondary' : 'ghost'}
          onClick={() => setMode('write')}
        >
          Write
        </Button>
        <Button
          type="button"
          size="sm"
          variant={mode === 'preview' ? 'secondary' : 'ghost'}
          onClick={() => setMode('preview')}
        >
          Preview
        </Button>
      </div>
      {mode === 'write' ? (
        <Textarea
          label="Body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={20000}
          rows={14}
          hint="Markdown supported."
        />
      ) : (
        <div className="min-h-[200px] rounded-[14px] border border-border bg-surface px-3.5 py-3">
          {body.trim() ? (
            <MarkdownContent content={body} variant="forum" />
          ) : (
            <p className="text-sm text-foreground-secondary">Nothing to preview.</p>
          )}
        </div>
      )}
      {error ? <p className="text-sm text-critical">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          loading={saving}
          disabled={!title.trim() || !body.trim()}
          onClick={async () => {
            setSaving(true);
            setError(null);
            try {
              await forumRepository.updatePost({
                postId: post.id,
                title,
                body,
              });
              await onSaved();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : 'Could not save changes.',
              );
            } finally {
              setSaving(false);
            }
          }}
        >
          Save changes
        </Button>
      </div>
    </div>
  );
}

function ForumThread({
  postId,
  isAdmin,
  currentUserId,
  displayName,
  onBack,
  onOpenRank,
}: {
  postId: string;
  isAdmin: boolean;
  currentUserId: string | null;
  displayName: string;
  onBack: () => void;
  onOpenRank: (
    authorId: string,
    displayName: string,
    authorIsAdmin: boolean,
  ) => void;
}) {
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deletingReplyId, setDeletingReplyId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthor = Boolean(
    post && currentUserId && post.authorId === currentUserId,
  );
  const canDelete = isAuthor || isAdmin;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextPost, nextReplies] = await Promise.all([
        forumRepository.getPost(postId),
        forumRepository.listReplies(postId),
      ]);
      setPost(nextPost);
      setReplies(nextReplies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load thread.');
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-foreground-secondary">Loading thread…</p>;
  }

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        description="This thread may have been removed."
      />
    );
  }

  return (
    <div className="space-y-4">
      <ForumThreadStrand
        post={post}
        replies={replies}
        editing={editing && isAuthor}
        isAuthor={isAuthor}
        isAdmin={isAdmin}
        canDelete={canDelete}
        replyBody={replyBody}
        saving={saving}
        pinBusy={pinBusy}
        deleteBusy={deleteBusy}
        error={error}
        editSlot={
          <EditPostForm
            post={post}
            onCancel={() => setEditing(false)}
            onSaved={async () => {
              setEditing(false);
              await load();
            }}
          />
        }
        onBack={onBack}
        onEdit={() => setEditing(true)}
        onDelete={async () => {
          const confirmed = window.confirm(
            'Delete this post and all replies? This can’t be undone.',
          );
          if (!confirmed) return;
          setDeleteBusy(true);
          setError(null);
          try {
            await forumRepository.deletePost(post.id);
            onBack();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not delete post.',
            );
          } finally {
            setDeleteBusy(false);
          }
        }}
        onTogglePin={async () => {
          setPinBusy(true);
          try {
            await forumRepository.setPinned(post.id, !post.pinned);
            await load();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not update pin.',
            );
          } finally {
            setPinBusy(false);
          }
        }}
        onOpenRank={onOpenRank}
        onReplyBodyChange={setReplyBody}
        currentUserId={currentUserId}
        deletingReplyId={deletingReplyId}
        onDeleteReply={async (replyId) => {
          const confirmed = window.confirm(
            'Delete this reply? This can’t be undone.',
          );
          if (!confirmed) return;
          setDeletingReplyId(replyId);
          setError(null);
          try {
            await forumRepository.deleteReply(postId, replyId);
            await load();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not delete reply.',
            );
          } finally {
            setDeletingReplyId(null);
          }
        }}
        onSubmitReply={async () => {
          setSaving(true);
          setError(null);
          try {
            await forumRepository.createReply({
              postId,
              body: replyBody,
              authorDisplayName: displayName,
              authorIsAdmin: isAdmin,
            });
            setReplyBody('');
            await load();
          } catch (err) {
            setError(
              err instanceof Error ? err.message : 'Could not post reply.',
            );
          } finally {
            setSaving(false);
          }
        }}
      />

      {!editing ? <JumpToReplyFab /> : null}
    </div>
  );
}
