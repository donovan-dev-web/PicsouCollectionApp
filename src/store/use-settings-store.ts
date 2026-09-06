import { create } from 'zustand';

import { getDeps } from '@/dependencies';

export type ColorSchemeSetting = 'light' | 'dark' | 'system';

interface SettingsState {
  colorScheme: ColorSchemeSetting;
  loaded: boolean;
  onboardingDone: boolean;
  onboardingLoaded: boolean;
  reducedMotion: boolean;
  setColorScheme: (colorScheme: ColorSchemeSetting) => void;
  loadColorScheme: () => Promise<void>;
  loadOnboardingDone: () => Promise<void>;
  markOnboardingDone: () => void;
  setReducedMotion: (reduced: boolean) => void;
  loadReducedMotion: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  colorScheme: 'system',
  loaded: false,
  onboardingDone: false,
  onboardingLoaded: false,
  reducedMotion: false,

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

  loadOnboardingDone: async () => {
    const onboardingDone = await getDeps().settingsRepository.getOnboardingDone();
    set({ onboardingDone, onboardingLoaded: true });
  },

  markOnboardingDone: () => {
    set({ onboardingDone: true });
    try {
      void getDeps()
        .settingsRepository.setOnboardingDone(true)
        .catch(() => undefined);
    } catch {
      // dépendances pas encore initialisées : on ignore la persistance
    }
  },

  setReducedMotion: (reduced) => {
    set({ reducedMotion: reduced });
    try {
      void getDeps()
        .settingsRepository.setReducedMotion(reduced)
        .catch(() => undefined);
    } catch {
      // dépendances pas encore initialisées : on ignore la persistance
    }
  },

  loadReducedMotion: async () => {
    const reducedMotion = await getDeps().settingsRepository.getReducedMotion();
    set({ reducedMotion });
  },
}));