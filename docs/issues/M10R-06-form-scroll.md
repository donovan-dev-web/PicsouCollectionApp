---
title: "[Bug] M10R-06 Formulaire : champs Mois/Année non scrollables"
labels: [bug, epic/collection, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Comportement attendu

US-UX-10. Choisir Mois/Année au pouce, sans lutte avec le scroll (test physique :
listes Mois/Année **non scrollables** dans le formulaire d'ajout).

# Comportement observé

`src/components/select-field.tsx` : `FlatList` imbriquée dans le `ScrollView` de
`MagazineForm` (conflit de scroll vertical, `maxHeight:240` sur le contenu sans
`nestedScrollEnabled`) → la liste des 40 années est inatteignable au tactile.

# Reproduction

1. Scan → Manuel (ou Fiche → Modifier) → « Plus de détails » ;
2. Taper « Année » → tenter de scroller les options → la page parente scrolle.

# Correctif proposé

Remplacer la `FlatList` interne par un rendu inline (`options.map`, liste courte
12/40 items, pas de virtualisation nécessaire) + `nestedScrollEnabled` si
FlatList conservée ; options 44px conservées ; fermer au choix (déjà le cas).

# Critères de fin (DoD)

- [ ] Mois + Année sélectionnables au pouce sur device (12 et 40 options)
- [ ] `lint` + `typecheck` verts, tests select/form verts
