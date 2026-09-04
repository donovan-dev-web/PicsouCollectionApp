/**
 * Design tokens — design system (Phase 3, US-QA-01).
 *
 * Palette claire et sombre (Vault & Venture / Obsidian Vault). Les composants
 * consomment ces couleurs via le hook `useThemeColors`, pour basculer de
 * manière réactive entre les modes clair et sombre du système.
 */

export const Colors = {
  light: {
    text: '#001B3D',
    textSecondary: '#5A6478',
    background: '#FFFFFF',
    backgroundElement: '#F0F3F7',
    accent: '#FDD835',
    accentText: '#1F1B00',
    danger: '#B3261E',
    onDanger: '#FFFFFF',
    success: '#1B7F3B',
    onSuccess: '#FFFFFF',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B6C2',
    background: '#0B1B33',
    backgroundElement: '#16304F',
    accent: '#FDD835',
    accentText: '#1F1B00',
    danger: '#F2B8B5',
    onDanger: '#410002',
    success: '#7BC67E',
    onSuccess: '#062B0A',
  },
} as const;

export type ThemeColors = { [K in keyof (typeof Colors)['light']]: string };

export const Spacing = {
  two: 8,
  three: 16,
  four: 24,
} as const;

export type SpacingScale = typeof Spacing;
