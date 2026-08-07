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
import type { ForumPost, ForumReply } from '@/src/types';
import { createId } from '@/src/utils/dates';

const mockPosts = new Map<string, ForumPost>();
const mockReplies = new Map<string, ForumReply[]>();

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

function mapPost(id: string, data: Record<string, unknown>): ForumPost {
  return {
    id,
    title: String(data.title ?? ''),
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'Researcher'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? data.createdAt ?? new Date().toISOString()),
    replyCount: Number(data.replyCount ?? 0),
    searchText: String(data.searchText ?? ''),
    pinned: Boolean(data.pinned),
  };
}

function mapReply(
  id: string,
  postId: string,
  data: Record<string, unknown>,
): ForumReply {
  return {
    id,
    postId,
    body: String(data.body ?? ''),
    authorId: String(data.authorId ?? ''),
    authorDisplayName: String(data.authorDisplayName ?? 'Researcher'),
    authorIsAdmin: Boolean(data.authorIsAdmin),
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

function buildSearchText(title: string, body: string, author: string): string {
  return `${title} ${body} ${author}`.toLowerCase();
}

function sortPosts(posts: ForumPost[]): ForumPost[] {
  return [...posts].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return +new Date(b.updatedAt) - +new Date(a.updatedAt);
  });
}

function seedMockForum() {
  if (mockPosts.size > 0) return;
  const now = new Date().toISOString();
  const post: ForumPost = {
    id: 'welcome-post',
    title: 'Welcome to Questions & Discussion',
    body: 'Share research notes, ask surface-level questions, and compare what you’re studying. Keep it educational — no sourcing or dosing advice for individuals.',
    authorId: 'admin-demo',
    authorDisplayName: 'PepGuide Staff',
    authorIsAdmin: true,
    createdAt: now,
    updatedAt: now,
    replyCount: 1,
    searchText: buildSearchText(
      'Welcome to Questions & Discussion',
      'Share research notes',
      'PepGuide Staff',
    ),
    pinned: true,
  };
  mockPosts.set(post.id, post);
  mockReplies.set(post.id, [
    {
      id: 'welcome-reply',
      postId: post.id,
      body: 'Glad you’re here — start a thread anytime.',
      authorId: 'admin-demo',
      authorDisplayName: 'PepGuide Staff',
      authorIsAdmin: true,
      createdAt: now,
    },
  ]);
}

export const forumRepository = {
  async listPosts(options?: { query?: string; limit?: number }): Promise<ForumPost[]> {
    const limit = options?.limit ?? 80;
    const q = options?.query?.trim().toLowerCase() ?? '';

    if (shouldUseMockServices()) {
      seedMockForum();
      return sortPosts(
        [...mockPosts.values()].filter((post) =>
          q ? post.searchText.includes(q) : true,
        ),
      ).slice(0, limit);
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'forumPosts'),
        orderBy('updatedAt', 'desc'),
        fsLimit(Math.max(limit * 2, 80)),
      ),
    );
    const posts = sortPosts(
      snap.docs.map((item) =>
        mapPost(item.id, item.data() as Record<string, unknown>),
      ),
    );
    const filtered = q
      ? posts.filter((post) => post.searchText.includes(q))
      : posts;
    return filtered.slice(0, limit);
  },

  async getPost(postId: string): Promise<ForumPost | null> {
    if (shouldUseMockServices()) {
      seedMockForum();
      return mockPosts.get(postId) ?? null;
    }
    const snap = await getDoc(doc(requireDb(), 'forumPosts', postId));
    if (!snap.exists()) return null;
    return mapPost(snap.id, snap.data() as Record<string, unknown>);
  },

  async createPost(input: {
    title: string;
    body: string;
    authorDisplayName: string;
    authorIsAdmin: boolean;
  }): Promise<ForumPost> {
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title || !body) throw new Error('Title and body are required.');
    assertForumContentAllowed(title, body);

    const now = new Date().toISOString();
    const uid = requireUid();

    if (shouldUseMockServices()) {
      seedMockForum();
      const post: ForumPost = {
        id: createId('post'),
        title,
        body,
        authorId: uid,
        authorDisplayName: input.authorDisplayName,
        authorIsAdmin: input.authorIsAdmin,
        createdAt: now,
        updatedAt: now,
        replyCount: 0,
        searchText: buildSearchText(title, body, input.authorDisplayName),
        pinned: false,
      };
      mockPosts.set(post.id, post);
      mockReplies.set(post.id, []);
      return post;
    }

    const ref = doc(collection(requireDb(), 'forumPosts'));
    const post: ForumPost = {
      id: ref.id,
      title,
      body,
      authorId: uid,
      authorDisplayName: input.authorDisplayName,
      authorIsAdmin: input.authorIsAdmin,
      createdAt: now,
      updatedAt: now,
      replyCount: 0,
      searchText: buildSearchText(title, body, input.authorDisplayName),
      pinned: false,
    };
    const { id: _id, ...payload } = post;
    await setDoc(ref, payload);
    return post;
  },

  async updatePost(input: {
    postId: string;
    title: string;
    body: string;
  }): Promise<ForumPost> {
    const title = input.title.trim();
    const body = input.body.trim();
    if (!title || !body) throw new Error('Title and body are required.');
    assertForumContentAllowed(title, body);

    const uid = requireUid();
    const now = new Date().toISOString();

    if (shouldUseMockServices()) {
      seedMockForum();
      const existing = mockPosts.get(input.postId);
      if (!existing) throw new Error('Post not found');
      if (existing.authorId !== uid) {
        throw new Error('Only the author can edit this post.');
      }
      const next: ForumPost = {
        ...existing,
        title,
        body,
        updatedAt: now,
        searchText: buildSearchText(title, body, existing.authorDisplayName),
      };
      mockPosts.set(input.postId, next);
      return next;
    }

    const ref = doc(requireDb(), 'forumPosts', input.postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Post not found');
    const existing = mapPost(snap.id, snap.data() as Record<string, unknown>);
    if (existing.authorId !== uid) {
      throw new Error('Only the author can edit this post.');
    }

    const searchText = buildSearchText(title, body, existing.authorDisplayName);
    await updateDoc(ref, {
      title,
      body,
      searchText,
      updatedAt: now,
    });
    return {
      ...existing,
      title,
      body,
      searchText,
      updatedAt: now,
    };
  },

  async setPinned(postId: string, pinned: boolean): Promise<void> {
    const now = new Date().toISOString();
    if (shouldUseMockServices()) {
      seedMockForum();
      const post = mockPosts.get(postId);
      if (!post) throw new Error('Post not found');
      mockPosts.set(postId, { ...post, pinned, updatedAt: now });
      return;
    }
    await updateDoc(doc(requireDb(), 'forumPosts', postId), {
      pinned,
      updatedAt: now,
    });
  },

  async listReplies(postId: string): Promise<ForumReply[]> {
    if (shouldUseMockServices()) {
      seedMockForum();
      return [...(mockReplies.get(postId) ?? [])].sort(
        (a, b) => +new Date(a.createdAt) - +new Date(b.createdAt),
      );
    }

    const snap = await getDocs(
      query(
        collection(requireDb(), 'forumPosts', postId, 'replies'),
        orderBy('createdAt', 'asc'),
      ),
    );
    return snap.docs.map((item) =>
      mapReply(item.id, postId, item.data() as Record<string, unknown>),
    );
  },

  async createReply(input: {
    postId: string;
    body: string;
    authorDisplayName: string;
    authorIsAdmin: boolean;
  }): Promise<ForumReply> {
    const body = input.body.trim();
    if (!body) throw new Error('Reply cannot be empty.');
    assertForumContentAllowed(body);
    const uid = requireUid();
    const now = new Date().toISOString();

    if (shouldUseMockServices()) {
      seedMockForum();
      const reply: ForumReply = {
        id: createId('reply'),
        postId: input.postId,
        body,
        authorId: uid,
        authorDisplayName: input.authorDisplayName,
        authorIsAdmin: input.authorIsAdmin,
        createdAt: now,
      };
      const list = mockReplies.get(input.postId) ?? [];
      list.push(reply);
      mockReplies.set(input.postId, list);
      const post = mockPosts.get(input.postId);
      if (post) {
        mockPosts.set(input.postId, {
          ...post,
          replyCount: post.replyCount + 1,
          updatedAt: now,
        });
      }
      return reply;
    }

    const replyRef = doc(
      collection(requireDb(), 'forumPosts', input.postId, 'replies'),
    );
    const reply: ForumReply = {
      id: replyRef.id,
      postId: input.postId,
      body,
      authorId: uid,
      authorDisplayName: input.authorDisplayName,
      authorIsAdmin: input.authorIsAdmin,
      createdAt: now,
    };
    const { id: _id, postId: _postId, ...payload } = reply;
    await setDoc(replyRef, payload);
    await updateDoc(doc(requireDb(), 'forumPosts', input.postId), {
      replyCount: increment(1),
      updatedAt: now,
    });
    return reply;
  },

  async deletePost(postId: string): Promise<void> {
    requireUid();

    if (shouldUseMockServices()) {
      if (!mockPosts.has(postId)) throw new Error('Post not found');
      mockPosts.delete(postId);
      mockReplies.delete(postId);
      return;
    }

    const ref = doc(requireDb(), 'forumPosts', postId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error('Post not found');

    const replies = await getDocs(
      collection(requireDb(), 'forumPosts', postId, 'replies'),
    );
    await Promise.all(replies.docs.map((item) => deleteDoc(item.ref)));
    await deleteDoc(ref);
  },

  async deleteReply(postId: string, replyId: string): Promise<void> {
    requireUid();
    const now = new Date().toISOString();

    if (shouldUseMockServices()) {
      const list = mockReplies.get(postId) ?? [];
      const next = list.filter((reply) => reply.id !== replyId);
      if (next.length === list.length) throw new Error('Reply not found');
      mockReplies.set(postId, next);
      const post = mockPosts.get(postId);
      if (post) {
        mockPosts.set(postId, {
          ...post,
          replyCount: Math.max(0, post.replyCount - 1),
          updatedAt: now,
        });
      }
      return;
    }

    const replyRef = doc(requireDb(), 'forumPosts', postId, 'replies', replyId);
    const replySnap = await getDoc(replyRef);
    if (!replySnap.exists()) throw new Error('Reply not found');

    await deleteDoc(replyRef);
    await updateDoc(doc(requireDb(), 'forumPosts', postId), {
      replyCount: increment(-1),
      updatedAt: now,
    });
  },
};
