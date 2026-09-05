---
title: "[UX] M10R-08 Torche caméra (OCR + code-barres)"
labels: [enhancement, epic/identification, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-11. Test physique (brocantes sombres, granges) : couvertures illisibles
sans appoint de lumière. `expo-camera` expose `enableTorch` — aucun usage dans
`src/` (grep Ø).

# Tâche

- Bouton torche (Feather `zap`/`zap-off`, 44px, `testID` dédié) sur
  `/scan/camera`, `/scan/barcode`, `/scan/form-barcode`, ancré SafeZone
  (haut-droit, sous `backButton`) ; état `torchOn` local, `enableTorch` sur
  `CameraView` ;
- Accessibilité : `accessibilityLabel` « Activer/Couper la torche », état annoncé.

# Critères de fin (DoD)

- [ ] Torche pilotable sur les 3 écrans caméra (device, faible lumière)
- [ ] `lint` + `typecheck` verts, tests (toggle on/off, prop `enableTorch`)
