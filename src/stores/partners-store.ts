'use client';

import { create } from 'zustand';

import { partnersRepository } from '@/src/services/firestore/partners';
import type {
  AffiliatePartner,
  AffiliatePartnerInput,
} from '@/src/types/affiliates';

type PartnersState = {
  partners: AffiliatePartner[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  loadPartners: () => Promise<void>;
  upsertPartner: (
    id: string | null,
    input: AffiliatePartnerInput,
  ) => Promise<AffiliatePartner>;
  deletePartner: (id: string) => Promise<void>;
  getActivePartners: () => AffiliatePartner[];
};

export const usePartnersStore = create<PartnersState>((set, get) => ({
  partners: [],
  loading: false,
  error: null,
  loaded: false,

  async loadPartners() {
    set({ loading: true, error: null });
    try {
      const partners = await partnersRepository.listPartners();
      set({ partners, loading: false, loaded: true });
    } catch (error) {
      set({
        loading: false,
        loaded: true,
        error:
          error instanceof Error ? error.message : 'Unable to load partners.',
      });
    }
  },

  async upsertPartner(id, input) {
    const partner = await partnersRepository.upsertPartner(id, input);
    set((state) => {
      const exists = state.partners.some((item) => item.id === partner.id);
      const partners = exists
        ? state.partners.map((item) =>
            item.id === partner.id ? partner : item,
          )
        : [...state.partners, partner];
      return {
        partners: [...partners].sort((a, b) => a.sortOrder - b.sortOrder),
      };
    });
    return partner;
  },

  async deletePartner(id) {
    await partnersRepository.deletePartner(id);
    set((state) => ({
      partners: state.partners.filter((partner) => partner.id !== id),
    }));
  },

  getActivePartners() {
    return get()
      .partners.filter((partner) => partner.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
}));
