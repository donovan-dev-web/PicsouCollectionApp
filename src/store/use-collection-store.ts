import { create } from 'zustand';

import { getDeps } from '@/dependencies';
import type { CreateMagazineInput, Magazine, MagazineListItem } from '@/types';

interface CollectionState {
  magazines: MagazineListItem[];
  recent: MagazineListItem[];
  detail: Magazine | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
  loaded: boolean;
  totalMagazines: number;
  load: () => Promise<void>;
  /** Résumé léger (accueil) : compteur d'éditions + dernières ajoutées. */
  loadSummary: () => Promise<void>;
  loadDetail: (id: string) => Promise<Magazine | null>;
  addMagazine: (input: CreateMagazineInput) => Promise<MagazineListItem | null>;
  updateMagazine: (id: string, input: CreateMagazineInput) => Promise<void>;
  removeMagazine: (id: string) => Promise<void>;
}

export const useCollectionStore = create<CollectionState>((set, get) => ({
  magazines: [],
  recent: [],
  detail: null,
  loading: false,
  detailLoading: false,
  error: null,
  loaded: false,
  totalMagazines: 0,

  load: async () => {
    set({ loading: true, error: null });
    try {
      const { magazineRepository } = getDeps();
      const magazines = await magazineRepository.list();
      set({ magazines, totalMagazines: magazines.length, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Erreur inconnue' });
    }
  },

  loadSummary: async () => {
    set({ loading: true, error: null });
    try {
      const { magazineRepository } = getDeps();
      const [recent, totalMagazines] = await Promise.all([
        magazineRepository.findRecent(5),
        magazineRepository.countAll(),
      ]);
      set({ recent, totalMagazines, loading: false, loaded: true });
    } catch (err) {
      set({ loading: false, error: err instanceof Error ? err.message : 'Erreur inconnue' });
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

  addMagazine: async (input) => {
    const { magazineRepository } = getDeps();
    const magazine = await magazineRepository.create(input);
    set((state) => ({
      magazines: [magazine, ...state.magazines],
      recent: [magazine, ...state.recent].slice(0, 5),
      totalMagazines: state.totalMagazines + 1,
    }));
    return magazine;
  },

  updateMagazine: async (id, input) => {
    const { magazineRepository } = getDeps();
    const updated = await magazineRepository.update(id, input);
    if (!updated) {
      throw new Error('Édition introuvable.');
    }
    set((state) => ({
      magazines: state.magazines.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      recent: state.recent.map((m) => (m.id === id ? { ...m, ...updated } : m)),
      detail:
        state.detail && state.detail.id === id ? { ...state.detail, ...updated } : state.detail,
    }));
  },

  removeMagazine: async (id) => {
    const { magazineRepository } = getDeps();
    await magazineRepository.delete(id);
    set((state) => {
      const present =
        state.magazines.some((m) => m.id === id) ||
        state.recent.some((m) => m.id === id) ||
        state.detail?.id === id;
      return {
        magazines: state.magazines.filter((m) => m.id !== id),
        recent: state.recent.filter((m) => m.id !== id),
        totalMagazines: Math.max(0, state.totalMagazines - (present ? 1 : 0)),
        detail: state.detail && state.detail.id === id ? null : state.detail,
      };
    });
  },
}));
