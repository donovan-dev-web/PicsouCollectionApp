---
title: "[UX] M10R2-08 Collection : bouton Tri (numéros croissant/décroissant)"
labels: [enhancement, priority-medium, epic/collection, size/m, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : la collection est triée uniquement par le SQL
(`magazine-repository.list()` : `ORDER BY m.publication, m.issue_number`) —
impossible de trier autrement (ex. numéros décroissants, ou par date d'ajout).

La page `src/app/(tabs)/collection/index.tsx` a déjà des filtres (numéro,
édition) + pagination client (`PAGE_SIZE = 20`) mais **aucun contrôle de tri**.

# Tâche

- Ajouter un **bouton Tri** dans la barre de filtres (ex. près de « Effacer les
  filtres ») avec les options :
  - **Numéro ↑** (croissant, défaut actuel) / **Numéro ↓** (décroissant) ;
  - éventuellement : Ajout récent d'abord, Édition (A→Z / Z→A) ;
- Trier dans le `useMemo` `filtered` du screen (pas dans le SQL — garder une
  base stable) ;
- Refleter le tri sur la pagination (repagination depuis la page 1),
  `accessibilityLabel` + `accessibilityState` (ex. `expanded` menu) ;
- Menu : modal/sheet léger (cohérent SelectField) ou cycle au tap — choisir le
  plus simple à tester.

# Critères de fin (DoD)

- [x] Tri numéro croissant/décroissant fonctionnel (filtres combinés OK)
- [x] Tri visible/accessible (≥ 44px, label a11y)
- [x] Pagination repart de la page 1 au changement de tri
- [x] `lint` + `typecheck` verts, tests (tri, combinaison filtres+tri)

# Tests

- Manuel : trier ↑/↓ et associer à un filtre édition.
- Composant : options de tri, ordre du rendu, combinaison filtres+tri.