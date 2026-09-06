---
title: "[Nav] M10R2-07 Fiche magazine : header menu/titre/scan (app-header)"
labels: [enhancement, priority-high, epic/collection, size/s, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : la fiche magazine (`src/app/collection/[id]/index.tsx`)
est un modal Stack sans **aucun header** (`headerShown:false` global,
`_layout.tsx:37`) → pas de retour visible, pas d'accès drawer, pas d'accès scan.
Navigation peu fluide depuis une fiche.

# Tâche

- Ajouter le **même `AppHeader`** que les écrans tabs (burger menu / titre /
  scan) sur l'écran fiche :
  - Burger → `useDrawer().open()` ;
  - Titre : « Fiche magazine » (ou publication) ;
  - Scan (icône `crop`) → `router.push('/scan')` ;
- Conserver un moyen de **fermer le modal** (bouton retour/croix — le back
  natif n'est pas visible) ;
- Vérifier le rendu dans le modal (insets, fond, SafeZone) et le drawer
  toujours utilisable depuis la fiche.

# Critères de fin (DoD)

- [x] Header fiche : burger → drawer, titre, scan → `/scan`
- [x] Fermeture du modal explicite (back visible)
- [x] Pas de régression des écrans tabs (AppHeader réutilisé)
- [x] `lint` + `typecheck` verts, tests (rendu header fiche)

# Tests

- Manuel : ouvrir une fiche → burger/scan actifs, fermer le modal.
- Composant : header de la fiche (AppHeader réutilisé + close).