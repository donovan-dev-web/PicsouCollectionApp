---
title: "[UX] M10-09 Settings backup"
labels: [enhancement, epic/backup, size/s]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

`(tabs)/settings/index.tsx` : `Alert` export/import **sans `Annuler`** (user forcé),
busy sans `ActivityIndicator`/`aria-busy`, `linkButton Fermer ~34px <44`,
`option borderColor: backgroundElement` quasi invisible, `statusBox` même fond que boutons.

# Tâche

- `Alert` : ajouter `{text:'Annuler', style:'cancel'}` aux 2 popups format.
- Busy : `ActivityIndicator + accessibilityState.disabled + aria-busy`, texte `Export en cours…`.
- Cibles : `Fermer` + options `minHeight:44`, bordure selected `2px accent` visible.
- Hiérarchie : `statusBox/errorBox` fond teinté succès/danger (tokens M10-01), pas `backgroundElement`.

# Critères de fin (DoD)

- [ ] Échappatoire Annuler partout
- [ ] Busy annoncé par lecteur d'écran
- [ ] Tests settings export/import maj

# Tests

- Alert cancel, busy state, error invalide affichée.
