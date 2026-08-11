'use client';

import {
  ArrowLeft,
  MessageSquarePlus,
  Search,
  Star,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminBadge } from '@/src/components/pro/admin-badge';
import { Button } from '@/src/components/ui/button';
import { EmptyState } from '@/src/components/ui/empty-state';
import { Input } from '@/src/components/ui/input';
import { ModalShell } from '@/src/components/ui/modal-shell';
import { Textarea } from '@/src/components/ui/textarea';
import { useAdminAccess } from '@/src/hooks/use-admin-access';
import { cn } from '@/src/lib/utils';
import { vendorReviewsRepository } from '@/src/services/firestore/vendor-reviews';
import { listCatalogVendorOptions } from '@/src/services/firestore/partners';
import { useAuthStore } from '@/src/stores/auth-store';
import { usePartnersStore } from '@/src/stores/partners-store';
import { useUiStore } from '@/src/stores/ui-store';
import type {
  VendorReview,
  VendorReviewReply,
} from '@/src/types/vendor-reviews';

import './vendor-reviews.css';

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

function StarRating({
  value,
  onChange,
  size = 'md',
  readOnly = false,
}: {
  value: number;
  onChange?: (next: number) => void;
  size?: 'sm' | 'md';
  readOnly?: boolean;
}) {
  return (
    <div
      className={cn('vr-stars', size === 'sm' && 'vr-stars--sm')}
      role={readOnly ? 'img' : 'group'}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        if (readOnly) {
          return (
            <Star
              key={star}
              className={cn('vr-star', filled && 'vr-star--on')}
              aria-hidden
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={cn('vr-star-btn', filled && 'vr-star-btn--on')}
            onClick={() => onChange?.(star)}
            aria-label={`${star} star${star === 1 ? '' : 's'}`}
          >
            <Star className="vr-star" aria-hidden />
          </button>
        );
      })}
    </div>
  );
}

function ReviewThread({
  reviewId,
  currentUserId,
  displayName,
  isAdmin,
  onBack,
}: {
  reviewId: string;
  currentUserId: string | null;
  displayName: string;
  isAdmin: boolean;
  onBack: () => void;
}) {
  const [review, setReview] = useState<VendorReview | null>(null);
  const [replies, setReplies] = useState<VendorReviewReply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [nextReview, nextReplies] = await Promise.all([
        vendorReviewsRepository.getReview(reviewId),
        vendorReviewsRepository.listReplies(reviewId),
      ]);
      setReview(nextReview);
      setReplies(nextReplies);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load review.');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  useEffect(() => {
    void load();
  }, [load]);

  const submitReply = async () => {
    if (!reply.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await vendorReviewsRepository.createReply({
        reviewId,
        body: reply,
        authorDisplayName: displayName,
        authorIsAdmin: isAdmin,
      });
      setReply('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post reply.');
    } finally {
      setBusy(false);
    }
  };

  const removeReview = async () => {
    if (!review) return;
    if (!window.confirm('Delete this review and its replies?')) return;
    setBusy(true);
    try {
      await vendorReviewsRepository.deleteReview(review.id);
      onBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete review.');
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-foreground-secondary">Loading review…</p>;
  }

  if (!review) {
    return (
      <EmptyState
        title="Review not found"
        description="It may have been removed."
        action={
          <Button type="button" variant="secondary" onClick={onBack}>
            Back to reviews
          </Button>
        }
      />
    );
  }

  const canDelete =
    isAdmin || (currentUserId != null && currentUserId === review.authorId);

  return (
    <div className="vr-thread">
      <button type="button" className="vr-back" onClick={onBack}>
        <ArrowLeft className="size-4" />
        All reviews
      </button>

      <article className="vr-card vr-card--thread">
        <div className="vr-card__meta">
          <span className="vr-vendor">{review.partnerLabel}</span>
          <StarRating value={review.rating} readOnly size="sm" />
        </div>
        <h2 className="vr-card__title">{review.title}</h2>
        <p className="vr-card__body">{review.body}</p>
        <div className="vr-card__foot">
          <span>
            {review.authorDisplayName}
            {review.authorIsAdmin ? <AdminBadge className="ml-1.5" /> : null}
          </span>
          <span>{formatWhen(review.createdAt)}</span>
        </div>
        {canDelete ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="mt-3 text-critical"
            disabled={busy}
            onClick={() => void removeReview()}
          >
            <Trash2 className="size-3.5" />
            Delete review
          </Button>
        ) : null}
      </article>

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      <div className="vr-replies">
        <h3 className="vr-replies__title">
          {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
        </h3>
        {replies.length === 0 ? (
          <p className="text-sm text-foreground-secondary">
            No replies yet — add the first note.
          </p>
        ) : (
          <ul className="space-y-3">
            {replies.map((item) => (
              <li key={item.id} className="vr-reply">
                <p className="vr-reply__body">{item.body}</p>
                <div className="vr-reply__foot">
                  <span>
                    {item.authorDisplayName}
                    {item.authorIsAdmin ? (
                      <AdminBadge className="ml-1.5" />
                    ) : null}
                  </span>
                  <span>{formatWhen(item.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {currentUserId ? (
        <div className="vr-compose-inline">
          <Textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Add a reply…"
            rows={3}
          />
          <Button
            type="button"
            disabled={busy || !reply.trim()}
            onClick={() => void submitReply()}
          >
            Post reply
          </Button>
        </div>
      ) : (
        <p className="text-sm text-foreground-secondary">
          Sign in to reply to this review.
        </p>
      )}
    </div>
  );
}

function NewReviewModal({
  open,
  partners,
  onClose,
  onCreated,
  displayName,
  isAdmin,
}: {
  open: boolean;
  partners: Array<{ id: string; label: string }>;
  onClose: () => void;
  onCreated: (review: VendorReview) => void;
  displayName: string;
  isAdmin: boolean;
}) {
  const [partnerId, setPartnerId] = useState(partners[0]?.id ?? '');
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setPartnerId(partners[0]?.id ?? '');
    setRating(5);
    setTitle('');
    setBody('');
    setError(null);
    setBusy(false);
  }, [open, partners]);

  const submit = async () => {
    const partner = partners.find((item) => item.id === partnerId);
    if (!partner) {
      setError('Choose a vendor.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const review = await vendorReviewsRepository.createReview({
        partnerId: partner.id,
        partnerLabel: partner.label,
        rating,
        title,
        body,
        authorDisplayName: displayName,
        authorIsAdmin: isAdmin,
      });
      onCreated(review);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not post review.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title="Write a vendor review"
      titleId="vendor-review-composer-title"
      description="Share shipping, packaging, and transparency notes for PepGuide partners. Educational only — no sourcing or medical advice."
    >
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Vendor
          </span>
          <select
            value={partnerId}
            onChange={(event) => setPartnerId(event.target.value)}
            className="vr-select"
            aria-label="Choose vendor to review"
            disabled={partners.length === 0}
          >
            {partners.length === 0 ? (
              <option value="">No vendors available</option>
            ) : (
              partners.map((partner) => (
                <option key={partner.id} value={partner.id}>
                  {partner.label}
                </option>
              ))
            )}
          </select>
        </label>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Rating
          </span>
          <StarRating value={rating} onChange={setRating} />
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Title
          </span>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Quick summary"
            maxLength={160}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-[0.1em] text-foreground-secondary">
            Review
          </span>
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What stood out about this vendor?"
            rows={5}
          />
        </label>

        {error ? <p className="text-sm text-critical">{error}</p> : null}

        <div className="vr-modal-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={busy || !title.trim() || !body.trim() || !partnerId}
            onClick={() => void submit()}
          >
            {busy ? 'Posting…' : 'Post review'}
          </Button>
        </div>
      </div>
    </ModalShell>
  );
}

export function VendorReviewsPanel() {
  const user = useAuthStore((state) => state.user);
  const openSignInModal = useUiStore((state) => state.openSignInModal);
  const { isAdmin } = useAdminAccess();
  const partnersLoaded = usePartnersStore((state) => state.loaded);
  const partnersLoading = usePartnersStore((state) => state.loading);
  const partnersError = usePartnersStore((state) => state.error);
  const storePartners = usePartnersStore((state) => state.partners);
  const loadPartners = usePartnersStore((state) => state.loadPartners);

  const [reviews, setReviews] = useState<VendorReview[]>([]);
  const [partnerFilter, setPartnerFilter] = useState<string>('all');
  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [composerOpen, setComposerOpen] = useState(false);

  const partners = useMemo(() => {
    const active = storePartners
      .filter((partner) => partner.active)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((partner) => ({ id: partner.id, label: partner.label }));

    if (active.length > 0) return active;

    // If Firestore partners failed to load / are all inactive, fall back to
    // the same offline catalogs used for library pricing.
    return listCatalogVendorOptions();
  }, [storePartners]);

  useEffect(() => {
    if (!partnersLoaded && !partnersLoading) void loadPartners();
  }, [partnersLoaded, partnersLoading, loadPartners]);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await vendorReviewsRepository.listReviews({
        query,
        partnerId: partnerFilter === 'all' ? null : partnerFilter,
        limit: 80,
      });
      setReviews(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load reviews.');
    } finally {
      setLoading(false);
    }
  }, [query, partnerFilter]);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const averages = useMemo(() => {
    const map = new Map<string, { sum: number; count: number; label: string }>();
    for (const review of reviews) {
      const current = map.get(review.partnerId) ?? {
        sum: 0,
        count: 0,
        label: review.partnerLabel,
      };
      current.sum += review.rating;
      current.count += 1;
      map.set(review.partnerId, current);
    }
    return [...map.entries()]
      .map(([id, value]) => ({
        id,
        label: value.label,
        avg: value.sum / value.count,
        count: value.count,
      }))
      .sort((a, b) => b.avg - a.avg);
  }, [reviews]);

  if (selectedId) {
    return (
      <ReviewThread
        reviewId={selectedId}
        currentUserId={user?.id ?? null}
        displayName={user?.displayName || 'Researcher'}
        isAdmin={isAdmin}
        onBack={() => {
          setSelectedId(null);
          void loadReviews();
        }}
      />
    );
  }

  return (
    <div className="vr-root">
      <div className="vr-toolbar">
        <form
          className="vr-toolbar__search"
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
              placeholder="Search reviews…"
              className="pl-9"
              aria-label="Search vendor reviews"
            />
          </div>
          <Button type="submit" variant="secondary" className="vr-toolbar__search-btn shrink-0">
            Search
          </Button>
        </form>
        <Button
          className="vr-toolbar__write"
          onClick={() => {
            if (!user) {
              openSignInModal('Sign in to leave a vendor review.');
              return;
            }
            if (partners.length === 0) {
              setError('No active vendors are available to review yet.');
              return;
            }
            setComposerOpen(true);
          }}
        >
          <MessageSquarePlus className="size-4" />
          Write review
        </Button>
      </div>

      <div className="vr-filters">
        <label className="vr-filters__label">
          <span className="vr-filters__caption">Vendor</span>
          <select
            value={partnerFilter}
            onChange={(event) => setPartnerFilter(event.target.value)}
            className="vr-select"
            aria-label="Filter reviews by vendor"
            disabled={partnersLoading && partners.length === 0}
          >
            <option value="all">All vendors</option>
            {partners.map((partner) => (
              <option key={partner.id} value={partner.id}>
                {partner.label}
              </option>
            ))}
          </select>
        </label>
        {partnersLoading && partners.length === 0 ? (
          <p className="vr-filters__hint">Loading vendors…</p>
        ) : partnersError && storePartners.length === 0 ? (
          <p className="vr-filters__hint">
            Showing catalog vendors ({partners.length}).
          </p>
        ) : null}
      </div>

      {partnerFilter === 'all' && averages.length > 0 ? (
        <div className="vr-averages">
          {averages.slice(0, 6).map((item) => (
            <button
              key={item.id}
              type="button"
              className="vr-avg"
              onClick={() => setPartnerFilter(item.id)}
            >
              <span className="vr-avg__name">{item.label}</span>
              <span className="vr-avg__score">
                {item.avg.toFixed(1)}
                <Star className="size-3.5 fill-current" aria-hidden />
              </span>
              <span className="vr-avg__count">
                {item.count} review{item.count === 1 ? '' : 's'}
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {error ? <p className="text-sm text-critical">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-foreground-secondary">Loading reviews…</p>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No vendor reviews yet"
          description="Be the first to share notes on shipping, packaging, or lab transparency for a PepGuide partner."
          action={
            <Button
              type="button"
              onClick={() => {
                if (!user) {
                  openSignInModal('Sign in to leave a vendor review.');
                  return;
                }
                setComposerOpen(true);
              }}
            >
              Write a review
            </Button>
          }
        />
      ) : (
        <ul className="vr-list">
          {reviews.map((review) => (
            <li key={review.id}>
              <button
                type="button"
                className="vr-card"
                onClick={() => setSelectedId(review.id)}
              >
                <div className="vr-card__meta">
                  <span className="vr-vendor">{review.partnerLabel}</span>
                  <StarRating value={review.rating} readOnly size="sm" />
                </div>
                <p className="vr-card__title">{review.title}</p>
                <p className="vr-card__preview">{review.body}</p>
                <div className="vr-card__foot">
                  <span>
                    {review.authorDisplayName}
                    {review.authorIsAdmin ? (
                      <AdminBadge className="ml-1.5" />
                    ) : null}
                  </span>
                  <span>
                    {review.replyCount}{' '}
                    {review.replyCount === 1 ? 'reply' : 'replies'} ·{' '}
                    {formatWhen(review.updatedAt)}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <NewReviewModal
        open={composerOpen}
        partners={partners}
        displayName={user?.displayName || 'Researcher'}
        isAdmin={isAdmin}
        onClose={() => setComposerOpen(false)}
        onCreated={(review) => {
          setReviews((current) => [review, ...current]);
          setSelectedId(review.id);
        }}
      />
    </div>
  );
}
