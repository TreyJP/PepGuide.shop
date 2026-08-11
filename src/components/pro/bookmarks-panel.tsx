'use client';

import {
  Bookmark,
  FlaskConical,
  Layers,
  Play,
  Trash2,
  Video,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useBookmarksStore } from '@/src/stores/bookmarks-store';
import type { ProBookmark } from '@/src/types/bookmarks';

type Filter = 'all' | 'peptide' | 'video' | 'protocol';

function bookmarkHref(bookmark: ProBookmark): string {
  if (bookmark.kind === 'peptide' && bookmark.peptideId) {
    return `/library/${bookmark.peptideId}`;
  }
  if (bookmark.kind === 'protocol' && bookmark.protocolId) {
    return `/pro/protocols/${bookmark.protocolId}`;
  }
  return '/pro/guides';
}

function bookmarkKindLabel(kind: ProBookmark['kind']): string {
  if (kind === 'peptide') return 'Peptide';
  if (kind === 'protocol') return 'Protocol';
  return 'Video';
}

function BookmarkIcon({ kind }: { kind: ProBookmark['kind'] }) {
  if (kind === 'peptide') return <FlaskConical className="size-5" />;
  if (kind === 'protocol') return <Layers className="size-5" />;
  return <Video className="size-5" />;
}

export function BookmarksPanel() {
  const user = useAuthStore((state) => state.user);
  const bookmarks = useBookmarksStore((state) => state.bookmarks);
  const loading = useBookmarksStore((state) => state.loading);
  const loadBookmarks = useBookmarksStore((state) => state.loadBookmarks);
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark);
  const loadedForUserId = useBookmarksStore((state) => state.loadedForUserId);
  const [filter, setFilter] = useState<Filter>('all');
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (user && loadedForUserId !== user.id) {
      void loadBookmarks(user.id);
    }
  }, [user, loadedForUserId, loadBookmarks]);

  const filtered = useMemo(() => {
    if (filter === 'all') return bookmarks;
    return bookmarks.filter((item) => item.kind === filter);
  }, [bookmarks, filter]);

  async function remove(bookmark: ProBookmark) {
    if (!user) return;
    setRemovingId(bookmark.id);
    try {
      if (bookmark.kind === 'peptide' && bookmark.peptideId) {
        await toggleBookmark(user.id, {
          kind: 'peptide',
          peptideId: bookmark.peptideId,
          title: bookmark.title,
          subtitle: bookmark.subtitle,
        });
      } else if (
        bookmark.kind === 'video' &&
        bookmark.courseId &&
        bookmark.lessonId
      ) {
        await toggleBookmark(user.id, {
          kind: 'video',
          courseId: bookmark.courseId,
          lessonId: bookmark.lessonId,
          title: bookmark.title,
          videoUrl: bookmark.videoUrl,
          subtitle: bookmark.subtitle,
        });
      } else if (bookmark.kind === 'protocol' && bookmark.protocolId) {
        await toggleBookmark(user.id, {
          kind: 'protocol',
          protocolId: bookmark.protocolId,
          title: bookmark.title,
          subtitle: bookmark.subtitle,
        });
      }
    } finally {
      setRemovingId(null);
    }
  }

  if (!user) {
    return (
      <EmptyState
        title="Sign in to use Bookmarks"
        description="Save peptides, protocols, and education videos to revisit later."
      />
    );
  }

  if (loading && loadedForUserId !== user.id) {
    return (
      <p className="text-sm text-foreground-secondary">Loading bookmarks…</p>
    );
  }

  return (
    <div className="space-y-5">
      <div
        className="flex flex-wrap gap-1.5"
        role="tablist"
        aria-label="Filter bookmarks"
      >
        {(
          [
            ['all', 'All'],
            ['peptide', 'Peptides'],
            ['protocol', 'Protocols'],
            ['video', 'Videos'],
          ] as const
        ).map(([value, label]) => {
          const selected = filter === value;
          const count =
            value === 'all'
              ? bookmarks.length
              : bookmarks.filter((item) => item.kind === value).length;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                selected
                  ? 'bg-accent text-white'
                  : 'bg-surface-secondary text-foreground-secondary hover:text-foreground',
              )}
            >
              {label}
              <span
                className={cn(
                  'text-[11px] tabular-nums',
                  selected ? 'text-white/80' : 'text-foreground-secondary',
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Bookmark peptides, protocol stacks, or education lessons to save them here."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/library">
                <Button variant="secondary" size="sm">
                  Browse peptides
                </Button>
              </Link>
              <Link href="/pro/protocols">
                <Button variant="secondary" size="sm">
                  Protocols
                </Button>
              </Link>
              <Link href="/pro/guides">
                <Button variant="secondary" size="sm">
                  Education videos
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((bookmark) => (
            <li
              key={bookmark.id}
              className="flex items-stretch gap-3 rounded-[16px] border border-border bg-surface px-3 py-3 sm:px-4"
            >
              <div className="flex size-11 shrink-0 items-center justify-center rounded-[12px] bg-accent-muted text-accent">
                <BookmarkIcon kind={bookmark.kind} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground-secondary">
                  {bookmarkKindLabel(bookmark.kind)}
                </p>
                <Link
                  href={bookmarkHref(bookmark)}
                  className="mt-0.5 block truncate font-medium text-foreground hover:text-accent"
                >
                  {bookmark.title}
                </Link>
                {bookmark.subtitle ? (
                  <p className="mt-0.5 truncate text-xs text-foreground-secondary">
                    {bookmark.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {bookmark.kind === 'video' && bookmark.videoUrl ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-9"
                    aria-label="Open video"
                    onClick={() =>
                      window.open(
                        bookmark.videoUrl!,
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    <Play className="size-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-foreground-secondary hover:text-danger"
                  aria-label="Remove bookmark"
                  disabled={removingId === bookmark.id}
                  onClick={() => void remove(bookmark)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="flex items-center gap-1.5 text-xs text-foreground-secondary">
        <Bookmark className="size-3.5" />
        Bookmarks sync to your PepGuide Pro account.
      </p>
    </div>
  );
}
