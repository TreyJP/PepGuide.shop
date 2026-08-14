'use client';

import { create } from 'zustand';

type ForumAdminInboxState = {
  /** Admins only: at least one member thread still needs an admin reply. */
  needsAdminReply: boolean;
  setNeedsAdminReply: (needsAdminReply: boolean) => void;
};

export const useForumAdminInboxStore = create<ForumAdminInboxState>((set) => ({
  needsAdminReply: false,
  setNeedsAdminReply: (needsAdminReply) => set({ needsAdminReply }),
}));
