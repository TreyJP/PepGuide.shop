import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  increment,
  orderBy,
  query,
  setDoc,
  updateDoc,
  limit as fsLimit,
} from 'firebase/firestore';

import { assertForumContentAllowed } from '@/src/lib/forum-moderation';
import {
  getFirebaseAuth,
  getFirestoreDb,
  shouldUseMockServices,
} from '@/src/services/firebase/config';
import { useAuthStore } from '@/src/stores/auth-store';
import type {
  VendorReview,
  VendorReviewReply,
} from '@/src/types/vendor-reviews';
import { createId } from '@/src/utils/dates';

const mockReviews = new Map<string, VendorReview>();
const mockReplies = new Map<string, VendorReviewReply[]>();

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function requireUid() {
  const uid =
    getFirebaseAuth()?.currentUser?.uid ?? useAuthStore.getState().user?.id;
  if (!uid) throw new Error('Not authenticated');
  return uid;
}

function clampRating(value: number): number {
  if (!Number.isFinite(value)) return 5;
  return Math.min(5, Math.max(1, Math.round(value)));
}

function mapReview(id: string, data: Record<string, unknown>): VendorReview {
  return {
    id,
    partnerId: String(data.partnerId ?? ''),
    partnerLabel: String(data.partnerLabel ?? 'Vendor'),
    rating: clampRating(Number(data.rating ?? 5)),
    title: String(data.title ?? ''),
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'Researcher'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(
      data.updatedAt ?? data.createdAt ?? new Date().toISOString(),
    ),
    replyCount: Number(data.replyCount ?? 0),
    searchText: String(data.searchText ?? ''),
  };
}

function mapReply(
  id: string,
  reviewId: string,
  data: Record<string, unknown>,
): VendorReviewReply {
  return {
    id,
    reviewId,
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'Researcher'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

function buildSearchText(
  partnerLabel: string,
  title: string,
  body: string,
  author: string,
): string {
  return `${partnerLabel} ${title} ${body} ${author}`.toLowerCase();
}

function sortReviews(reviews: VendorReview[]): VendorReview[] {
  return [...reviews].sort(
    (a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt),
  );
}

function seedMockReviews() {
  if (mockReviews.size > 0) return;
  const now = new Date().toISOString();
  const review: VendorReview = {
    id: 'welcome-vendor-review',
    partnerId: 'refined-biolabs',
    partnerLabel: 'Refined Biolabs',
    rating: 5,
    title: 'Share your vendor experience',
    body: 'Leave honest notes about shipping speed, packaging, and lab transparency for PepGuide partners. Keep it educational — no sourcing requests or medical advice.',
    authorId: 'admin-demo',
    authorDisplayName: 'PepGuide Staff',
    authorIsAdmin: true,
    createdAt: now,
    updatedAt: now,
    replyCount: 0,
    searchText: buildSearchText(
      'Refined Biolabs',
      'Share your vendor experience',
      'Leave honest notes',
      'PepGuide Staff',
    ),
  };
  mockReviews.set(review.id, review);
  mockReplies.set(review.id, []);
}

export const vendorReviewsRepository = {
  async listReviews(options?: {
    query?: string;
    partnerId?: string | null;
    limit?: number;
  }): Promise<VendorReview[]> {
    const limit = options?.limit ?? 80;
    const q = options?.query?.trim().toLowerCase() ?? '';
    const partnerId = options?.partnerId?.trim() || null;

    if (shouldUseMockServices()) {
      seedMockReviews();
      return sortReviews(
        [...mockReviews.values()].filter((review) => {
          if (partnerId && review.partnerId !== partnerId) return false;
          if (q && !review.searchText.includes(q)) return false;
          return true;
        }),
      ).slice(0, limit);
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'vendorReviews'),
        orderBy('updatedAt', 'desc'),
        fsLimit(Math.max(limit * 2, 100)),
      ),
    );
    const reviews = sortReviews(
      snap.docs.map((item) =>
        mapReview(item.id, item.data() as Record<string, unknown>),
      ),
    );
    const filtered = reviews.filter((review) => {
      if (partnerId && review.partnerId !== partnerId) return false;
      if (q && !review.searchText.includes(q)) return false;
      return true;
    });
    return filtered.slice(0, limit);
  },

  async getReview(reviewId: string): Promise<VendorReview | null> {
    if (shouldUseMockServices()) {
      seedMockReviews();
      return mockReviews.get(reviewId) ?? null;
    }
    const snap = await getDoc(doc(requireDb(), 'vendorReviews', reviewId));
    if (!snap.exists()) return null;
    return mapReview(snap.id, snap.data() as Record<string, unknown>);
  },

  async createReview(input: {
    partnerId: string;
    partnerLabel: string;
    rating: number;
    title: string;
    body: string;
    authorDisplayName: string;
    authorIsAdmin: boolean;
  }): Promise<VendorReview> {
    const partnerId = input.partnerId.trim();
    const partnerLabel = input.partnerLabel.trim();
    const title = input.title.trim();
    const body = input.body.trim();
    const rating = clampRating(input.rating);
    if (!partnerId || !partnerLabel) {
      throw new Error('Choose a vendor to review.');
    }
    if (!title || !body) throw new Error('Title and review are required.');
    assertForumContentAllowed(title, body);

    const now = new Date().toISOString();
    const uid = requireUid();
    const searchText = buildSearchText(
      partnerLabel,
      title,
      body,
      input.authorDisplayName,
    );

    if (shouldUseMockServices()) {
      seedMockReviews();
      const review: VendorReview = {
        id: createId('vreview'),
        partnerId,
        partnerLabel,
        rating,
        title,
        body,
        authorId: uid,
        authorDisplayName: input.authorDisplayName,
        authorIsAdmin: input.authorIsAdmin,
        createdAt: now,
        updatedAt: now,
        replyCount: 0,
        searchText,
      };
      mockReviews.set(review.id, review);
      mockReplies.set(review.id, []);
      return review;
    }

    const ref = doc(collection(requireDb(), 'vendorReviews'));
    const review: VendorReview = {
      id: ref.id,
      partnerId,
      partnerLabel,
      rating,
      title,
      body,
      authorId: uid,
      authorDisplayName: input.authorDisplayName,
      authorIsAdmin: input.authorIsAdmin,
      createdAt: now,
      updatedAt: now,
      replyCount: 0,
      searchText,
    };
    const { id: _id, ...payload } = review;
    await setDoc(ref, payload);
    return review;
  },

  async listReplies(reviewId: string): Promise<VendorReviewReply[]> {
    if (shouldUseMockServices()) {
      seedMockReviews();
      return [...(mockReplies.get(reviewId) ?? [])].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      );
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'vendorReviews', reviewId, 'replies'),
        orderBy('createdAt', 'asc'),
      ),
    );
    return snap.docs.map((item) =>
      mapReply(item.id, reviewId, item.data() as Record<string, unknown>),
    );
  },

  async createReply(input: {
    reviewId: string;
    body: string;
    authorDisplayName: string;
    authorIsAdmin: boolean;
  }): Promise<VendorReviewReply> {
    const body = input.body.trim();
    if (!body) throw new Error('Reply cannot be empty.');
    assertForumContentAllowed(body);
    const uid = requireUid();
    const now = new Date().toISOString();

    if (shouldUseMockServices()) {
      seedMockReviews();
      const reply: VendorReviewReply = {
        id: createId('vreply'),
        reviewId: input.reviewId,
        body,
        authorId: uid,
        authorDisplayName: input.authorDisplayName,
        authorIsAdmin: input.authorIsAdmin,
        createdAt: now,
      };
      const list = mockReplies.get(input.reviewId) ?? [];
      list.push(reply);
      mockReplies.set(input.reviewId, list);
      const review = mockReviews.get(input.reviewId);
      if (review) {
        mockReviews.set(input.reviewId, {
          ...review,
          replyCount: review.replyCount + 1,
          updatedAt: now,
        });
      }
      return reply;
    }

    const replyRef = doc(
      collection(requireDb(), 'vendorReviews', input.reviewId, 'replies'),
    );
    const reply: VendorReviewReply = {
      id: replyRef.id,
      reviewId: input.reviewId,
      body,
      authorId: uid,
      authorDisplayName: input.authorDisplayName,
      authorIsAdmin: input.authorIsAdmin,
      createdAt: now,
    };
    const { id: _id, reviewId: _reviewId, ...payload } = reply;
    await setDoc(replyRef, payload);
    await updateDoc(doc(requireDb(), 'vendorReviews', input.reviewId), {
      replyCount: increment(1),
      updatedAt: now,
    });
    return reply;
  },

  async deleteReview(reviewId: string): Promise<void> {
    requireUid();

    if (shouldUseMockServices()) {
      if (!mockReviews.has(reviewId)) throw new Error('Review not found');
      mockReviews.delete(reviewId);
      mockReplies.delete(reviewId);
      return;
    }

    const ref = doc(requireDb(), 'vendorReviews', reviewId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Review not found');

    const replies = await getDocs(
      collection(requireDb(), 'vendorReviews', reviewId, 'replies'),
    );
    await Promise.all(replies.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(ref);
  },
};
