import { create } from 'zustand';

import { getDeps } from '@/dependencies';
import type { CreateMagazineInput, MagazineDetail, MagazineListItem, RecentCopy } from '@/types';

interface CollectionState {
  magazines: MagazineListItem[];
  recentCopies: RecentCopy[];
  detail: MagazineDetail | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  loaded: boolean;
  totalCopies: number;
  load: () => Promise<void>;
  loadRecent: () => Promise<void>;
  loadDetail: (id: string) => Promise<MagazineDetail | null>;
  addMagazine: (input: CreateMagazineInput) => Promise<MagazineListItem | null>;
  updateMagazine: (id: string, input: CreateMagazineInput) => Promise<void>;
  removeMagazine: (id: string) => Promise<void>;
  clearDetail: () => void;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  magazines: [],
  recentCopies: [],
  detail: null,
  loading: false,
  detailLoading: false,
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

  loadDetail: async (id) => {
    set({ detailLoading: true, error: null });
    try {
      const { magazineRepository } = getDeps();
      const detail = await magazineRepository.findById(id);
      set({ detail, detailLoading: false });
      return detail;
    } catch (err) {
      set({ detailLoading: false, error: err instanceof Error ? err.message : 'Erreur inconnue' });
      return null;
    }
  },

  clearDetail: () => set({ detail: null }),

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

  updateMagazine: async (id, input) => {
    const { magazineRepository } = getDeps();
    const updated = await magazineRepository.update(id, input);
    if (!updated) {
      throw new Error('Édition introuvable.');
    }
    set((state) => ({
      magazines: state.magazines.map((m) =>
        m.id === id ? { ...m, ...updated, quantity: m.quantity } : m,
      ),
      detail:
        state.detail && state.detail.id === id ? { ...state.detail, ...updated } : state.detail,
    }));
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
