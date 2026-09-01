import { create } from 'zustand';

type ColorScheme = 'light' | 'dark' | 'system';

interface SettingsState {
  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  colorScheme: 'system',
  setColorScheme: (colorScheme) => set({ colorScheme }),
}));
