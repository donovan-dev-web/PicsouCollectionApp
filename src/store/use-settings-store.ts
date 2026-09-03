import { create } from 'zustand';

import { getDeps } from '@/dependencies';

export type ColorSchemeSetting = 'light' | 'dark' | 'system';

interface SettingsState {
  colorScheme: ColorSchemeSetting;
  loaded: boolean;
  setColorScheme: (colorScheme: ColorSchemeSetting) => void;
  loadColorScheme: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  colorScheme: 'system',
  loaded: false,

  setColorScheme: (colorScheme) => {
    set({ colorScheme });
    try {
      void getDeps()
        .settingsRepository.setColorScheme(colorScheme)
        .catch(() => undefined);
    } catch {
      // dépendances pas encore initialisées : on ignore la persistance
    }
  },

  loadColorScheme: async () => {
    const colorScheme = await getDeps().settingsRepository.getColorScheme();
    set({ colorScheme, loaded: true });
  },
}));
