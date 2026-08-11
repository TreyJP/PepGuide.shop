'use client';

import { create } from 'zustand';

import { bookmarksRepository } from '@/src/services/firestore/bookmarks';
import {
  bookmarkIdForInput,
  peptideBookmarkId,
  protocolBookmarkId,
  videoBookmarkId,
  type ProBookmark,
  type ProBookmarkInput,
} from '@/src/types/bookmarks';

type BookmarksState = {
  bookmarks: ProBookmark[];
  loading: boolean;
  loadedForUserId: string | null;
  error: string | null;
  loadBookmarks: (userId: string) => Promise<void>;
  toggleBookmark: (
    userId: string,
    input: ProBookmarkInput,
  ) => Promise<boolean>;
  isPeptideBookmarked: (peptideId: string) => boolean;
  isVideoBookmarked: (courseId: string, lessonId: string) => boolean;
  isProtocolBookmarked: (protocolId: string) => boolean;
  clear: () => void;
};

export const useBookmarksStore = create<BookmarksState>((set, get) => ({
  bookmarks: [],
  loading: false,
  loadedForUserId: null,
  error: null,

  async loadBookmarks(userId) {
    set({ loading: true, error: null });
    try {
      const bookmarks = await bookmarksRepository.list(userId);
      set({
        bookmarks,
        loading: false,
        loadedForUserId: userId,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to load bookmarks.',
      });
    }
  },

  async toggleBookmark(userId, input) {
    const result = await bookmarksRepository.toggle(userId, input);
    const id = bookmarkIdForInput(input);

    set((state) => ({
      bookmarks:
        result.bookmarked && result.bookmark
          ? [
              result.bookmark,
              ...state.bookmarks.filter((item) => item.id !== id),
            ]
          : state.bookmarks.filter((item) => item.id !== id),
    }));
    return result.bookmarked;
  },

  isPeptideBookmarked(peptideId) {
    const id = peptideBookmarkId(peptideId);
    return get().bookmarks.some((item) => item.id === id);
  },

  isVideoBookmarked(courseId, lessonId) {
    const id = videoBookmarkId(courseId, lessonId);
    return get().bookmarks.some((item) => item.id === id);
  },

  isProtocolBookmarked(protocolId) {
    const id = protocolBookmarkId(protocolId);
    return get().bookmarks.some((item) => item.id === id);
  },

  clear() {
    set({
      bookmarks: [],
      loadedForUserId: null,
      loading: false,
      error: null,
    });
  },
}));
