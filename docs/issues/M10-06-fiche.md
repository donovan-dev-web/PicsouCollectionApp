---
title: "[UX] M10-06 Fiche + Edit"
labels: [enhancement, epic/collection, size/s]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

`collection/[id]/index.tsx|edit.tsx` : `issue marginTop:-8` chevauche si wrap,
`copyDate 12px`, `copyIndex` jaune illisible, pas d'ajout direct d'exemplaire ici,
`Supprimer` sans Hint, `detail-<label>` avec accent (`detail-édition` fragile),
edit sans dirty-guard ni Retour explicite, loading/not-found sans CTA.

# Tâche

- Fiche : bannière statut nouveau code (vert Possédé, voir M10-01/07), chips métas,
  `copyDate ≥13px`, `infoRow` avec `flex` anti-troncature, bouton **Ajouter exemplaire**
  (primaire, ouvre modal état/notes), `Modifier` secondaire, `Supprimer` danger + Hint,
  `testID` slugifiés sans accent.
- Edit : dirty-guard (`Alert` si modifications non sauvées + back geste), bouton
  Annuler/Retour explicite, feedback toast après `update`, `Screen` SafeArea.
- Loading `ActivityIndicator`, not-found + CTA Retour.

# Critères de fin (DoD)

- [ ] Ajout direct possible depuis fiche
- [ ] Aucune perte de saisie silencieuse
- [ ] Tests fiche/edit verts

# Tests

- Dirty-guard, ajout exemplaire, suppression cascade confirmée.
