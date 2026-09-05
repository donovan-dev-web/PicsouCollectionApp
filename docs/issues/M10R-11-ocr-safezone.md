---
title: "[Bug] M10R-11 OCR : bouton code-barres masqué par la gesture bar"
labels: [bug, priority-high, epic/identification, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Comportement attendu

US-UX-12. Bouton « Scanner le code-barres » (`ocr-barcode`) de la page OCR
entièrement visible et tappable au-dessus des boutons de navigation du téléphone.

# Comportement observé (test physique)

Bouton trop bas, sous la gesture bar / boutons système.

# Reproduction

1. Scan → Caméra (OCR) ;
2. Le bouton « Scanner le code-barres » chevauche la zone système basse.

# Environnement

- Appareil Android physique (build preview M-10), navigation par gestes

# Correctif proposé

`src/app/scan/camera.tsx:693` (`secondaryButton`) : ajouter
`marginBottom: insets.bottom + 16` (`insets` déjà injectés dans `makeStyles`) ;
vérifier aussi `ocr-override-manual` / panneaux `resultCard` (`maxHeight 85 %`
déjà en place) et l'overlay `confirm` ; pas de régression `ocr-barcode`.

# Critères de fin (DoD)

- [ ] Bouton visible + 44px au-dessus de la gesture bar (device, gestes + boutons)
- [ ] `lint` + `typecheck` verts, tests caméra verts
