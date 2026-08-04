'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ComparisonState = {
  peptideIds: string[];
  addPeptide: (peptideId: string, max?: number) => boolean;
  removePeptide: (peptideId: string) => void;
  clear: () => void;
};

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      peptideIds: [],
      addPeptide: (peptideId, max = 4) => {
        const current = get().peptideIds;
        if (current.includes(peptideId)) return true;
        if (current.length >= max) return false;
        set({ peptideIds: [...current, peptideId] });
        return true;
      },
      removePeptide: (peptideId) =>
        set({ peptideIds: get().peptideIds.filter((id) => id !== peptideId) }),
      clear: () => set({ peptideIds: [] }),
    }),
    { name: 'pepguide-comparison' },
  ),
);
