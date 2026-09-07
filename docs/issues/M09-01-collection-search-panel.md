---
title: "[UX] M09-01 Collection : panneau de recherche repliable (bouton Rechercher)"
labels: [enhancement, epic/collection, size/m, to-do]
milestone: "M-09 — Tests terrain & publication"
---

# Contexte

Test physique du build preview v0.9.2 : sur l'écran **Ma Collection**
(`src/app/(tabs)/collection/index.tsx`), la section de filtres (Numéro,
Édition, Tri) prend trop de place au-dessus de la liste — les trois champs
sont en pleine largeur, empilés verticalement, ce qui masque la collection et
réduit la lisibilité.

# Tâche

Revoir la section de filtres pour une meilleure lisibilité :

- Un **bouton jaune « Rechercher »** (`colors.accent`) en tête de liste ;
- Au tap, un **panneau repliable** se déplie avec les champs à l'intérieur ;
- Dans le panneau :
  - **Numéro** et **Tri** côte à côte (demi-largeur chacun, même ligne) ;
  - **Édition** en dessous (pleine largeur) ;
- Le panneau est **replié par défaut** : la collection est visible dès
  l'ouverture de l'écran ;
- Ouverture automatique quand un pré-filtre vient du drawer
  (`useLocalSearchParams` `edition`, M10R-05) ;
- Bouton « Effacer les filtres » conservé dans le panneau tant que des filtres
  sont actifs.

# Critères de fin (DoD)

- [x] Bouton jaune « Rechercher » + panneau repliable (ouvert/fermé au tap)
- [x] Numéro + Tri sur la même ligne, Édition en dessous
- [x] Ouverture auto quand le drawer pré-filtre (param `edition`)
- [x] Pagination, filtrage, tri inchangés (retour page 1 à chaque application)
- [x] `lint` + `typecheck` verts, tests composant mis à jour
- [x] Doc mise à jour (09-ISSUE.md, 08-USER-STORIES.md, 11-ROADMAP.md)

# Tests

- Composant : panneau replié par défaut, ouverture via « Rechercher », filtres
  et tri combinables, combinaison filtre édition + tri.
- Manuel : collection fournie, petit écran, pré-filtre drawer (éditions),
  clavier ouvert.