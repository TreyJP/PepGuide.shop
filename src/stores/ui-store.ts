'use client';

import { create } from 'zustand';

type UiState = {
  signInModalOpen: boolean;
  signInModalMessage: string;
  openSignInModal: (message?: string) => void;
  closeSignInModal: () => void;

  proSubscribeModalOpen: boolean;
  proSubscribeFeature: string;
  openProSubscribeModal: (feature?: string) => void;
  closeProSubscribeModal: () => void;

  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  signInModalOpen: false,
  signInModalMessage:
    'Sign in to start researching with PepGuide AI and save your chats.',
  openSignInModal: (message) =>
    set({
      signInModalOpen: true,
      signInModalMessage:
        message ??
        'Sign in to start researching with PepGuide AI and save your chats.',
    }),
  closeSignInModal: () => set({ signInModalOpen: false }),

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
