'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  AFFILIATE_DESIGN_IDS,
  DEFAULT_AFFILIATE_DESIGN,
  type AffiliateDesignId,
} from '@/src/constants/affiliate-designs';

type AffiliateDesignState = {
  designId: AffiliateDesignId;
  setDesignId: (id: AffiliateDesignId) => void;
};

function isAffiliateDesignId(value: unknown): value is AffiliateDesignId {
  return (
    typeof value === 'string' &&
    (AFFILIATE_DESIGN_IDS as readonly string[]).includes(value)
  );
}

export const useAffiliateDesignStore = create<AffiliateDesignState>()(
  persist(
    (set) => ({
      designId: DEFAULT_AFFILIATE_DESIGN,
      setDesignId: (id) => set({ designId: id }),
    }),
    {
      name: 'pepguide-affiliate-design',
      partialize: (state) => ({ designId: state.designId }),
      merge: (persisted, current) => {
        const raw = persisted as { designId?: unknown } | undefined;
        return {
          ...current,
          designId: isAffiliateDesignId(raw?.designId)
            ? raw.designId
            : current.designId,
        };
      },
    },
  ),
);
