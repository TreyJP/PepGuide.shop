'use client';

import { create } from 'zustand';

import {
  cycleRepository,
  type CycleItemInput,
} from '@/src/services/firestore/cycle';
import type { CycleItem } from '@/src/types';

type CycleState = {
  items: CycleItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  loadItems: () => Promise<void>;
  addItem: (input: CycleItemInput) => Promise<CycleItem>;
  updateItem: (
    id: string,
    patch: Partial<CycleItemInput>,
  ) => Promise<CycleItem>;
  deleteItem: (id: string) => Promise<void>;
  hasPeptide: (peptideId: string) => boolean;
};

export const useCycleStore = create<CycleState>((set, get) => ({
  items: [],
  loading: false,
  loaded: false,
  error: null,

  async loadItems() {
    set({ loading: true, error: null });
    try {
      const items = await cycleRepository.listItems();
      set({ items, loading: false, loaded: true });
    } catch (error) {
      set({
        loading: false,
        loaded: true,
        error:
          error instanceof Error ? error.message : 'Unable to load cycle log.',
      });
    }
  },

  async addItem(input) {
    const item = await cycleRepository.addItem(input);
    set((state) => ({ items: [item, ...state.items] }));
    return item;
  },

  async updateItem(id, patch) {
    const item = await cycleRepository.updateItem(id, patch);
    set((state) => ({
      items: state.items.map((entry) => (entry.id === id ? item : entry)),
    }));
    return item;
  },

  async deleteItem(id) {
    await cycleRepository.deleteItem(id);
    set((state) => ({
      items: state.items.filter((entry) => entry.id !== id),
    }));
  },

  hasPeptide(peptideId) {
    return get().items.some((item) => item.peptideId === peptideId);
  },
}));
