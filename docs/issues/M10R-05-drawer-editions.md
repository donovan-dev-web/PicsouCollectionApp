---
title: "[Nav] M10R-05 Drawer : section éditions dynamique repliable"
labels: [enhancement, epic/collection, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-09. Test physique : dans le drawer, section **Collection** avec bouton
global (page collection) + **sous-catégories par édition, repliables et
dynamiques** (construites depuis la base : `SELECT DISTINCT edition`).

# Tâche (dépend de M10R-04)

- Section « Par édition » : liste repliable (`chevron-down/up`, 44px) alimentée
  par le store (`editions` dérivées de `magazines`, triées, `null` → « Sans édition ») ;
- Chaque édition → `/collection?edition=X` (pré-filtre `editionFilter` via params ;
  adapter `CollectionScreen` pour lire `useLocalSearchParams`) ;
- Bouton global « Toute la collection » (reset filtres) en tête de section ;
- Repliée par défaut si > 5 éditions ; état persistant en session (pas en base).

# Critères de fin (DoD)

- [ ] Ajout d'une édition en base → apparaît au prochain focus (focus reload)
- [ ] Tap édition → collection filtrée ; global → filtres reset
- [ ] `lint` + `typecheck` verts, tests (éditions dynamiques, pré-filtre par params)
