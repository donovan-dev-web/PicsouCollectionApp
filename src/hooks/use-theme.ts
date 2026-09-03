import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';
import { useSettingsStore } from '@/store/use-settings-store';

/** Renvoie le schéma effectif ('light' | 'dark') selon le réglage manuel (US-SET-01). */
export function useEffectiveColorScheme(): 'light' | 'dark' {
  const setting = useSettingsStore((s) => s.colorScheme);
  const systemScheme = useColorScheme();
  if (setting === 'light' || setting === 'dark') {
    return setting;
  }
  return systemScheme === 'dark' ? 'dark' : 'light';
}

/** Renvoie les couleurs du thème courant (clair ou sombre). */
export function useThemeColors(): ThemeColors {
  const scheme = useEffectiveColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
