import { create } from 'zustand';

import { getDeps } from '@/dependencies';
import type { CreateMagazineInput, MagazineListItem, RecentCopy } from '@/types';

interface CollectionState {
  magazines: MagazineListItem[];
  recentCopies: RecentCopy[];
  loading: boolean;
  error: string | null;
  loaded: boolean;
  totalCopies: number;
  load: () => Promise<void>;
  loadRecent: () => Promise<void>;
  addMagazine: (input: CreateMagazineInput) => Promise<MagazineListItem | null>;
  removeMagazine: (id: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  magazines: [],
  recentCopies: [],
  loading: false,
  error: null,
  loaded: false,
  totalCopies: 0,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const { magazineRepository } = getDeps();
      const magazines = await magazineRepository.list();
      const totalCopies = magazines.reduce((sum, m) => sum + m.quantity, 0);
      set({ magazines, totalCopies, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Erreur inconnue' });
    }
  },

  loadRecent: async () => {
    try {
      const { collectionRepository } = getDeps();
      const recentCopies = await collectionRepository.listRecentCopies(5);
      set({ recentCopies });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Erreur inconnue' });
    }
  },

  addMagazine: async (input) => {
    const { magazineRepository, collectionRepository } = getDeps();
    const magazine = await magazineRepository.create(input);
    await collectionRepository.addCopy(magazine.id);
    const item: MagazineListItem = { ...magazine, quantity: 1 };
    set((state) => ({
      magazines: [item, ...state.magazines],
      totalCopies: state.totalCopies + 1,
    }));
    return item;
  },

  removeMagazine: async (id) => {
    const { magazineRepository } = getDeps();
    await magazineRepository.delete(id);
    set((state) => {
      const removed = state.magazines.find((m) => m.id === id);
      return {
        magazines: state.magazines.filter((m) => m.id !== id),
        totalCopies: state.totalCopies - (removed?.quantity ?? 0),
      };
    });
  },
}));
