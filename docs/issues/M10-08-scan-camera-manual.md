---
title: "[UX] M10-08 Scan camera OCR + saisie manuelle"
labels: [enhancement, epic/identification, size/m]
milestone: "M-10 — Refonte UI/UX"
---

# Contexte

`scan/camera.tsx` (722 lignes) + `scan/manual.tsx` + `magazine-form.tsx` :
`backButton top:48`, overlay sans scroll (clavier masque override OCR),
`fieldLabel` non liés aux `TextInput`, `Number('')→0 / Number('abc')→NaN`,
`detectedValueEmpty rgba(255,255,255,0.45)` ~2:1 illisible, 2 `testID ocr-manual`
dupliqués, `secondaryButton` chevauchement bas, `YEARS 2025` hardcodé, `manual`
sans toast ni Annuler, `back` après `replace` confus.

# Tâche

- Overlay : `KeyboardAvoidingView + keyboardVerticalOffset`, `resultCard` scrollable,
  `secondaryButton` ancré SafeArea bottom, réticule responsive.
- A11y : `accessibilityLabel` sur chaque input override, `detectedBoard` live,
  contraste `detectedValueEmpty ≥ 4.5` (`rgba(255,255,255,0.75)` min), `testID` uniques.
- Validation inline : numéro `regex ^\d+$`, erreur bloquante si `NaN`, `YEARS` dynamique
  (`currentYear → 1970`), `MONTHS` localisés.
- `manual` : bouton Annuler/Retour explicite + fallback `replace('/')`, toast succès,
  `barcodeRow` bouton `Scan Feather 44px`, `submitDisabled` avec raison affichée.

# Critères de fin (DoD)

- [ ] Clavier ne masque jamais `Rechercher`
- [ ] `NaN` impossible à soumettre
- [ ] Tests OCR override + form verts

# Tests

- Validation numéro, YEARS dynamique, toast, fallback nav.
- Manuel : couverture abîmée, faible lumière, petit écran + clavier.
