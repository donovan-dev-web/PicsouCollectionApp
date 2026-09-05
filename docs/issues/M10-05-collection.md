---
title: "[UX] M10-05 Collection : filtres + pagination + carte"
labels: [enhancement, epic/collection, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

`(tabs)/collection/index.tsx` + `magazine-card.tsx` : loading texte seul, empty
`Aucune édition.` sans CTA, erreur ignorée, pagination affichée même à 1 page,
boutons `36px` symboles `‹ › 16px`, `filters gap:4` magique, pas de clear/reset,
`Number(issue)` égalité stricte, `header baseline` casse si titre long, issue jaune illisible.

# Tâche

- `FlatList` : `ListEmptyComponent (EmptyState + CTA)`, `ActivityIndicator`,
  `refreshControl`, `keyboardShouldPersistTaps="handled"`, `ErrorView` si erreur.
- Pagination : masquée si `totalPages<=1`, boutons `44px` `chevron-left/right 20px Feather`,
  `accessibilityState disabled/selected`, SafeArea bottom.
- Filtres : bouton clear/reset, `returnKeyType="done"`, labels liés (`accessibilityLabelledBy`).
- `magazine-card.tsx` : `numberOfLines=1 ellipsize`, issue couleur lisible (M10-01),
  `StatusBadge` nouveau code, `pressed + android_ripple`, `accessibilityHint`.

# Critères de fin (DoD)

- [ ] 0 cible <44px, pagination silencieuse à 1 page
- [ ] Empty/error/loading tous maquetés + CTA
- [ ] Tests FlatList maj

# Tests

- Pagination masquée/affichée, empty CTA, filtre clear.
- Manuel : 200+ items, petit écran, clavier ouvert.
