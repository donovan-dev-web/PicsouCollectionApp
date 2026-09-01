/**
 * Design tokens minimal — Phase 1 (M-01).
 *
 * Les couleurs reprennent la palette de marque définie dans le design system
 * (docs/design). Le design system complet (Vault & Venture / Obsidian Vault)
 * sera intégré lors de la Phase 3 (US-QA-01).
 */

export const Colors = {
  light: {
    text: '#001B3D',
    textSecondary: '#5A6478',
    background: '#FFFFFF',
    backgroundElement: '#F0F3F7',
    accent: '#FDD835',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B6C2',
    background: '#001B3D',
    backgroundElement: '#0F2747',
    accent: '#FDD835',
  },
} as const;

export const Spacing = {
  two: 8,
  three: 16,
  four: 24,
} as const;
