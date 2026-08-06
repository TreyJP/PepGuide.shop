'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  DEFAULT_LIBRARY_DESIGN,
  LIBRARY_DESIGN_IDS,
  type LibraryDesignId,
} from '@/src/constants/library-designs';

type LibraryDesignState = {
  designId: LibraryDesignId;
  setDesignId: (id: LibraryDesignId) => void;
};

function isLibraryDesignId(value: unknown): value is LibraryDesignId {
  return (
    typeof value === 'string' &&
    (LIBRARY_DESIGN_IDS as readonly string[]).includes(value)
  );
}

export const useLibraryDesignStore = create<LibraryDesignState>()(
  persist(
    (set) => ({
      designId: DEFAULT_LIBRARY_DESIGN,
      setDesignId: (id) => set({ designId: id }),
    }),
    {
      name: 'pepguide-library-design',
      partialize: (state) => ({ designId: state.designId }),
      merge: (persisted, current) => {
        const raw = persisted as { designId?: unknown } | undefined;
        return {
          ...current,
          designId: isLibraryDesignId(raw?.designId)
            ? raw.designId
            : current.designId,
        };
      },
    },
  ),
);
