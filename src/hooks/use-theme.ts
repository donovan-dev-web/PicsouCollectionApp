import { useColorScheme } from 'react-native';

import { Colors, type ThemeColors } from '@/constants/theme';

/** Renvoie les couleurs du thème courant (clair ou sombre). */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? Colors.dark : Colors.light;
}
