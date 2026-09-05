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
    textSecondary: '#404B5E',
    background: '#FFFFFF',
    backgroundElement: '#F0F3F7',
    accent: '#FDD835',
    accentText: '#1F1B00',
    /** Texte « jaune » lisible sur fond clair — ne jamais utiliser `accent` en texte (M10-01). */
    accentTextOnLight: '#5C5200',
    /** Actif navigation — visible sur fond clair (M10-03). */
    navActive: '#00629E',
    danger: '#B3261E',
    onDanger: '#FFFFFF',
    /** Fond teinté pour bandeaux d'erreur (M10-09/11). */
    dangerBg: '#FDE8E8',
    success: '#1B7F3B',
    onSuccess: '#FFFFFF',
    /** Badges statut — Possédé = vert positif, Absent = neutre (M10-07, sémantique inversée). */
    ownedBg: '#E6F4EA',
    ownedText: '#1B7F3B',
    absentBg: '#E8EDF3',
    absentText: '#404B5E',
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B6C2',
    background: '#0B1B33',
    backgroundElement: '#16304F',
    accent: '#FDD835',
    accentText: '#1F1B00',
    accentTextOnLight: '#FDD835',
    navActive: '#4FC3F7',
    danger: '#F2B8B5',
    onDanger: '#410002',
    dangerBg: '#3A1A18',
    success: '#7BC67E',
    onSuccess: '#062B0A',
    ownedBg: '#1E3A2A',
    ownedText: '#7BC67E',
    absentBg: '#26334A',
    absentText: '#B0B6C2',
  },
} as const;

export type ThemeColors = { [K in keyof (typeof Colors)['light']]: string };

export const Spacing = {
  zero: 0,
  one: 4,
  two: 8,
  twoHalf: 12,
  three: 16,
  four: 24,
  five: 32,
} as const;

export type SpacingScale = typeof Spacing;

/** Échelle typographique minimale (M10-01) — 13px min en UI, jamais 12px. */
export const Typography = {
  display: { fontSize: 48, lineHeight: 56, fontWeight: '800' },
  headline: { fontSize: 24, lineHeight: 32, fontWeight: '700' },
  title: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodySm: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  label: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
} as const;

/** Cible tactile minimale (M10-02/M10-10). */
export const HitTarget = { minHeight: 44, hitSlop: 8 } as const;
