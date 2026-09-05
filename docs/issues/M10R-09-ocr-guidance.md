---
title: "[UX] M10R-09 OCR texte stylisé : guidage + replis visibles"
labels: [enhancement, epic/identification, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-11. Test physique : l'OCR (ML Kit standard) peine sur textes « designer »
type comics (titres déformés, lettrages). Limite moteur connue — compenser par
l'UX, pas par un nouveau moteur (non-objectif : pas de reco d'image couverture).

# Tâche

- Surcouche `/scan/camera` : conseils contextuels discrets (Feather `info`,
  ex. « Texte stylisé ? Cadrez le N° en chiffres ou utilisez le code-barres »),
  affichés après N s sans détection ou en confiance faible ;
- Rendre les replis permanents et visibles pendant l'analyse : boutons
  « Code-barres » (existant `ocr-barcode`) + « Manuel » persistants, pas seulement
  en échec ;
- Doc : noter la limite dans `docs/design/M10-TOKENS.md` ou spec (1 ligne).

# Critères de fin (DoD)

- [ ] Couverture comics → l'utilisateur trouve code-barres/manuel en < 5 s
- [ ] `lint` + `typecheck` verts, tests (affichage conseils, replis persistants)
