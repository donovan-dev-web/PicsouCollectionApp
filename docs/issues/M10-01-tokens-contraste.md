---
title: "[UI] M10-01 Tokens + typo + contraste WCAG AA"
labels: [enhancement, priority-high, epic/quality, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

US-UX-01. `src/constants/theme.ts` n'a que `Spacing {8,16,24}`, pas d'échelle typo,
et `colors.accent #FDD835` est utilisé **en texte** sur fond clair dans 7 endroits
(`(tabs)/index.tsx:123` compteur, `magazine-card.tsx:60`, `scan/multiple.tsx:175`,
`collection/[id]:233` copyIndex, `scan/barcode.tsx:440`, `scan/camera.tsx:584`,
`magazine-form.tsx:331`, `select-field.tsx:146`, `+not-found.tsx:48`) → ratio ~1.6:1.
`status-badge.tsx` + `scan/result.tsx` ont des couleurs en dur hors thème (pas de dark-mode).

# Tâche

- Étendre `theme.ts` : `Spacing {0,1,2,3,4,5,6}` (0/4/8/12/16/24/32), `Typography`
  (display 48/32/24, body 16/14/13 + lineHeight, label 14/12), `HitTarget.min=44`,
  `Status` tokens (`ownedBg/ownedText/absentBg/absentText` light+dark, vert positif),
  `accentTextOnLight` lisible (`#5C4B00` ou `#00629E`).
- Remplacer **tous** les `color: colors.accent` en texte par token lisible ;
  `accent` réservé aux fonds de boutons (avec `accentText`) et fonds sombres.
- Tokeniser `status-badge.tsx` (via `useThemeColors`) + `scan/result.tsx:195-214` +
  overlays caméra (`#FFF`/`rgba` → tokens).
- Supprimer valeurs magiques (`gap:4`, `marginTop:-8`, `fontSize:12` épars).

# Critères de fin (DoD)

- [ ] Aucun texte `accent #FDD835` sur fond clair (grep `color: colors.accent` = 0 en texte)
- [ ] Contraste texte ≥ 4.5:1 en clair ET sombre (vérifié à l'œil + `npx` contraste si besoin)
- [ ] `lint` + `typecheck` verts
- [ ] Tests : snapshot/contrat tokens + non-régression `status-badge`

# Tests

- Unitaires : tokens exposés, `StatusBadge` owned/absent utilise thème (mock light/dark).
- Manuel : Accueil, carte, fiche, pending barcode, detected OCR, toggle form, lien 404 — clair + sombre.
