'use client';

import { create } from 'zustand';

type UiState = {
  signInModalOpen: boolean;
  signInModalMessage: string;
  openSignInModal: (message?: string) => void;
  closeSignInModal: () => void;
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
}));
