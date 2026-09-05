---
title: "[UI] M10-03 TabBar à icônes + routes Stack"
labels: [enhancement, priority-high, epic/accueil, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

US-UX-03. `src/app/(tabs)/_layout.tsx` : 3 labels texte seuls, **zéro `tabBarIcon`**,
`tabBarActiveTintColor: colors.accent` (jaune sur fond blanc = invisible).
`src/app/_layout.tsx` ne déclare pas `scan/barcode|camera|multiple|result|form-barcode`
→ présentation implicite, pas de titre a11y, retours bricolés (`✕`/`router.back()` sans fallback).

# Tâche

- Installer `@expo/vector-icons` (compatible SDK 57) ; icônes **Feather** :
  Accueil `home`, Collection `book-open`, Paramètres `settings`.
- `(tabs)/_layout.tsx` : `tabBarIcon 24px`, `tabBarActiveTintColor` light `#00629E` /
  dark `#4FC3F7`, `tabBarInactiveTintColor: textSecondary`, `tabBarStyle` (thème),
  `tabBarLabelStyle 12px/16`, badge compteur collection (`tabBarBadge`, optionnel store).
- `_layout.tsx` : déclarer toutes les routes scan (`presentation: 'card'`, `result/multiple`
  en `card`, `edit` déjà `modal`), titres pour lecteurs d'écran, fallback `router.replace('/')`
  quand `canGoBack()===false` dans `scan/index` + `manual`.

# Critères de fin (DoD)

- [ ] Actif visible plein soleil (clair) + OLED (sombre)
- [ ] Icônes 24px, labels 12px, cibles tab ≥ 44px
- [ ] Deep-link `/scan` → Annuler ne donne plus écran vide
- [ ] `lint` + `typecheck` verts

# Tests

- Rendu tabs : icônes + couleurs selon schéma (mock `useThemeColors`).
- Manuel : navigation 3 onglets, deep-link scan, dark/light.
