---
title: "[UI] M10-11 Empty / Loading / Error + Toast partagés"
labels: [enhancement, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

US-UX-06. Chaque écran bricole ses états : `Chargement…` texte seul (collection,
multiple, detail), `Aucune édition.` sans CTA, erreurs store ignorées (home, collection),
succès sans toast (`manual`, `edit`, `addExistingCopy`).

# Tâche

- Créer `src/components/empty-state.tsx` (icône Feather + titre + sous-titre + CTA primaire),
  `loading-view.tsx` (`ActivityIndicator` + texte + `accessibilityLiveRegion`),
  `error-view.tsx` (icône + message + `Réessayer`), `toast.ts` (helper `Alert`/`Snackbar`
  léger ou `ToastAndroid` + iOS fallback — sans nouvelle dép si possible).
- Migrer 7 écrans : `(tabs)/index|collection|settings`, `scan/multiple|result|camera`,
  `collection/[id]/index`.
- Toast succès : ajout manuel, ajout exemplaire, export/import, update édition.

# Critères de fin (DoD)

- [ ] 0 `Chargement…` texte seul restant
- [ ] Chaque vide/erreur a CTA
- [ ] Chaque ajout a feedback succès

# Tests

- Rendu 3 composants (CTA, retry, live-region).
- Manuel : avion (offline), base vide, import invalide.
