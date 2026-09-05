---
title: "[UX] M10-04 Accueil cockpit brocante"
labels: [enhancement, epic/accueil, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

US-UX-04. `(tabs)/index.tsx` : 2 CTA concurrents même taille (`📷 Scanner` + `+ Ajouter`),
titre avec emoji 🦆 lu par VoiceOver, compteur jaune illisible, `recentItem ~40px <44`,
empty `Aucun ajout...` sans CTA, erreur store jamais affichée, date `slice(0,10)` brute,
`marginTop:auto` fragile dans ScrollView.

# Tâche

- Hiérarchie : `Scanner` primaire (jaune, icône Feather `camera`, 56px, `ripple`) >
  `Ajouter` secondaire (outline). Supprimer emojis boutons.
- Compteur : couleur texte contrastée (token M10-01), `accessibilityLiveRegion="polite"`,
  label `exemplaires possédés`.
- `recentItem minHeight:48 + chevron-right Feather`, titre sans emoji (icône décorative
  `importantForAccessibility="no"`), date localisée `Intl.DateTimeFormat('fr-FR')`.
- Empty illustré (`EmptyState`, voir M10-11) + CTA Scanner ; afficher `error` store via `ErrorView`.
- `Screen` SafeArea + `contentContainer flexGrow` robuste.

# Critères de fin (DoD)

- [ ] 1 seul primaire visible en <3s à 1 main
- [ ] Cibles ≥ 44px, contraste AA, VoiceOver annonce items + compteur
- [ ] Tests maj (empty, error, récents cliquables)

# Tests

- Composant : empty vs liste, CTA navigation, error affichée.
- Manuel : brocante (1 main, soleil), lecteur d'écran.
