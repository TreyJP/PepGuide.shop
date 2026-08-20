import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
} from 'firebase/firestore';

import { getFirestoreDb } from '@/src/services/firebase/config';
import {
  bookmarkIdForInput,
  type ProBookmark,
  type ProBookmarkInput,
  type ProBookmarkKind,
} from '@/src/types/bookmarks';

function requireDb() {
  const db = getFirestoreDb();
  if (!db) throw new Error('Firestore is not configured');
  return db;
}

function mapKind(raw: unknown): ProBookmarkKind | null {
  if (raw === 'peptide' || raw === 'video' || raw === 'protocol') return raw;
  return null;
}

function mapBookmark(
  id: string,
  data: Record<string, unknown>,
): ProBookmark | null {
  const kind = mapKind(data.kind);
  if (!kind) return null;
  return {
    id,
    kind,
    title: String(data.title ?? 'Bookmark'),
    peptideId:
      typeof data.peptideId === 'string' ? data.peptideId : undefined,
    courseId: typeof data.courseId === 'string' ? data.courseId : undefined,
    lessonId: typeof data.lessonId === 'string' ? data.lessonId : undefined,
    protocolId:
      typeof data.protocolId === 'string' ? data.protocolId : undefined,
    videoUrl:
      typeof data.videoUrl === 'string'
        ? data.videoUrl
        : data.videoUrl === null
          ? null
          : undefined,
    subtitle:
      typeof data.subtitle === 'string'
        ? data.subtitle
        : data.subtitle === null
          ? null
          : undefined,
    createdAt: String(data.createdAt ?? new Date().toISOString()),
  };
}

const mockByUser = new Map<string, ProBookmark[]>();

function mockList(userId: string): ProBookmark[] {
  return [...(mockByUser.get(userId) ?? [])].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

function buildPayload(input: ProBookmarkInput, now: string): ProBookmark {
  const id = bookmarkIdForInput(input);
  const base = {
    id,
    kind: input.kind,
    title: input.title.trim() || 'Bookmark',
    createdAt: now,
    subtitle: input.subtitle ?? null,
  };

  if (input.kind === 'peptide') {
    return { ...base, peptideId: input.peptideId };
  }
  if (input.kind === 'video') {
    return {
      ...base,
      courseId: input.courseId,
      lessonId: input.lessonId,
      videoUrl: input.videoUrl ?? null,
    };
  }
  return { ...base, protocolId: input.protocolId };
}

export const bookmarksRepository = {
  async list(userId: string): Promise<ProBookmark[]> {
    const db = getFirestoreDb();
    if (!db) return mockList(userId);

    const snap = await getDocs(collection(db, 'users', userId, 'bookmarks'));
    return snap.docs
      .map((item) =>
        mapBookmark(item.id, item.data() as Record<string, unknown>),
      )
      .filter((item): item is ProBookmark => Boolean(item))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async save(userId: string, input: ProBookmarkInput): Promise<ProBookmark> {
    const now = new Date().toISOString();
    const payload = buildPayload(input, now);
    const id = payload.id;

    const db = getFirestoreDb();
    if (!db) {
      const current = mockByUser.get(userId) ?? [];
      const next = [payload, ...current.filter((item) => item.id !== id)];
      mockByUser.set(userId, next);
      return payload;
    }

    await setDoc(doc(requireDb(), 'users', userId, 'bookmarks', id), payload, {
      merge: true,
    });
    void import('@/src/lib/campaigns/client-attribution').then((mod) =>
      mod.recordCampaignMeaningfulAction(),
    );
    return payload;
  },

  async remove(userId: string, bookmarkId: string): Promise<void> {
    const db = getFirestoreDb();
    if (!db) {
      const current = mockByUser.get(userId) ?? [];
      mockByUser.set(
        userId,
        current.filter((item) => item.id !== bookmarkId),
      );
      return;
    }
    await deleteDoc(doc(requireDb(), 'users', userId, 'bookmarks', bookmarkId));
  },

  async toggle(
    userId: string,
    input: ProBookmarkInput,
  ): Promise<{ bookmarked: boolean; bookmark: ProBookmark | null }> {
    const id = bookmarkIdForInput(input);
    const existing = (await this.list(userId)).find((item) => item.id === id);
    if (existing) {
      await this.remove(userId, id);
      return { bookmarked: false, bookmark: null };
    }
    const bookmark = await this.save(userId, input);
    return { bookmarked: true, bookmark };
  },
};
