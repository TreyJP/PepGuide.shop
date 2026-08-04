'use client';

import { create } from 'zustand';

import type { UserProfile } from '@/src/types';

type AuthState = {
  user: UserProfile | null;
  initializing: boolean;
  setUser: (user: UserProfile | null) => void;
  setInitializing: (initializing: boolean) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  initializing: true,
  setUser: (user) => set({ user, initializing: false }),
  setInitializing: (initializing) => set({ initializing }),
  updateUser: (patch) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...patch } : null,
    })),
}));
