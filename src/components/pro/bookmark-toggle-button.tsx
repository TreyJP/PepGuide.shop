'use client';

import { Bookmark } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';
import { useAuthStore } from '@/src/stores/auth-store';
import { useBookmarksStore } from '@/src/stores/bookmarks-store';
import { useUiStore } from '@/src/stores/ui-store';
import type { ProBookmarkInput } from '@/src/types/bookmarks';

type BookmarkToggleButtonProps = {
  input: ProBookmarkInput;
  className?: string;
  size?: 'sm' | 'md';
  /** Icon-only control for dense cards/tiles. */
  compact?: boolean;
};

/**
 * Bookmark toggle. Sign-in required; available to every account.
 */
export function BookmarkToggleButton({
  input,
  className,
  size = 'sm',
  compact = false,
}: BookmarkToggleButtonProps) {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const loadBookmarks = useBookmarksStore((state) => state.loadBookmarks);
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark);
  const loadedForUserId = useBookmarksStore((state) => state.loadedForUserId);
  const isPeptideBookmarked = useBookmarksStore(
    (state) => state.isPeptideBookmarked,
  );
  const isVideoBookmarked = useBookmarksStore(
    (state) => state.isVideoBookmarked,
  );
  const isProtocolBookmarked = useBookmarksStore(
    (state) => state.isProtocolBookmarked,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && loadedForUserId !== user.id) {
      void loadBookmarks(user.id);
    }
  }, [user, loadedForUserId, loadBookmarks]);

  const bookmarked =
    input.kind === 'peptide'
      ? isPeptideBookmarked(input.peptideId)
      : input.kind === 'video'
        ? isVideoBookmarked(input.courseId, input.lessonId)
        : isProtocolBookmarked(input.protocolId);

  async function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (busy) return;
    setError(null);

    if (!user) {
      openSignInModal('Sign in to bookmark peptides, videos, and protocols.');
      return;
    }

    setBusy(true);
    try {
      await toggleBookmark(user.id, input);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to update bookmark.',
      );
    } finally {
      setBusy(false);
    }
  }

  if (compact) {
    return (
      <span className={cn('inline-flex flex-col items-start', className)}>
        <button
          type="button"
          onClick={handleClick}
          disabled={busy}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
          title={bookmarked ? 'Bookmarked' : 'Bookmark'}
          className={cn(
            'inline-flex size-8 items-center justify-center rounded-[10px] border border-transparent text-foreground-secondary transition-colors hover:bg-surface-secondary hover:text-foreground',
            bookmarked && 'text-accent',
          )}
        >
          <Bookmark className={cn('size-4', bookmarked && 'fill-current')} />
        </button>
        {error ? (
          <span className="mt-0.5 max-w-[9rem] text-[10px] leading-tight text-critical">
            {error}
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className={cn('inline-flex flex-col items-start', className)}>
      <Button
        type="button"
        variant="ghost"
        size={size === 'sm' ? 'sm' : 'md'}
        onClick={handleClick}
        disabled={busy}
        className={cn(bookmarked && 'text-accent')}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? 'Remove bookmark' : 'Add bookmark'}
      >
        <Bookmark className={cn('size-3.5', bookmarked && 'fill-current')} />
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </Button>
      {error ? (
        <span className="px-1 text-[11px] text-critical">{error}</span>
      ) : null}
    </span>
  );
}
