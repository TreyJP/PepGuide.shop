'use client';

import { create } from 'zustand';

export type AuthModalMode = 'sign-in' | 'sign-up';

type UiState = {
  authModalOpen: boolean;
  authModalMode: AuthModalMode;
  authModalMessage: string;
  openSignInModal: (message?: string) => void;
  openSignUpModal: (message?: string) => void;
  closeAuthModal: () => void;
  setAuthModalMode: (mode: AuthModalMode) => void;

  proSubscribeModalOpen: boolean;
  proSubscribeFeature: string;
  openProSubscribeModal: (feature?: string) => void;
  closeProSubscribeModal: () => void;

  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

const DEFAULT_SIGN_IN_MESSAGE =
  'Sign in to start researching with PepGuide AI and save your chats.';
const DEFAULT_SIGN_UP_MESSAGE =
  'Create your account to save chats, bookmarks, and more.';

export const useUiStore = create<UiState>((set) => ({
  authModalOpen: false,
  authModalMode: 'sign-in',
  authModalMessage: DEFAULT_SIGN_IN_MESSAGE,
  openSignInModal: (message) =>
    set({
      authModalOpen: true,
      authModalMode: 'sign-in',
      authModalMessage: message ?? DEFAULT_SIGN_IN_MESSAGE,
    }),
  openSignUpModal: (message) =>
    set({
      authModalOpen: true,
      authModalMode: 'sign-up',
      authModalMessage: message ?? DEFAULT_SIGN_UP_MESSAGE,
    }),
  closeAuthModal: () => set({ authModalOpen: false }),
  setAuthModalMode: (mode) => set({ authModalMode: mode }),

  proSubscribeModalOpen: false,
  proSubscribeFeature: 'PepGuide Pro',
  openProSubscribeModal: (feature) =>
    set({
      proSubscribeModalOpen: true,
      proSubscribeFeature: feature ?? 'PepGuide Pro',
    }),
  closeProSubscribeModal: () => set({ proSubscribeModalOpen: false }),

  sidebarOpen: false,
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
