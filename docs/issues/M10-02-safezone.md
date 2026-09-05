---
title: "[UI] M10-02 SafeZone globale (encoche + gesture bar + caméra)"
labels: [enhancement, priority-high, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

US-UX-02. **0 `SafeArea` dans `src`** (seul `StatusBar`). Titres collés sous encoche,
boutons/pagination collés à la tabBar, caméra en dur `top:48` (`scan/barcode.tsx`,
`scan/camera.tsx`, `scan/form-barcode.tsx`) → collision Dynamic Island / notch Android.

# Tâche

- `src/app/_layout.tsx` : ajouter `SafeAreaProvider` (import `react-native-safe-area-context`,
  déjà en dépendances).
- Créer `src/components/screen.tsx` : `Screen` wrapper (`View` + `useSafeAreaInsets`,
  `paddingTop:insets.top`, `paddingBottom:insets.bottom`, prop `scrollable`).
- Migrer les 13 écrans vers `Screen` (ou `insets` direct pour overlays caméra) :
  `(tabs)/index, collection, settings, scan/index|barcode|camera|manual|form-barcode|multiple|result,
  collection/[id]/index|edit, +not-found`.
- Caméra : `continuousBar/backButton top:insets.top+12`, `invalidActions/startContinuous
  bottom:insets.bottom+24`, `pendingCard` avec `maxHeight` + `ScrollView`.
- Réticule : `220` fixe → `min(65% width)`.

# Critères de fin (DoD)

- [ ] Aucun `top:48` / `bottom:60|110` en dur restant (grep)
- [ ] Titres/boutons/pagination jamais masqués (encoche + gesture bar, petit écran)
- [ ] `lint` + `typecheck` verts

# Tests

- Composant `Screen` : applique insets (mock `useSafeAreaInsets`).
- Manuel : chaque écran, portrait, clair/sombre, avec encoche simulée.
