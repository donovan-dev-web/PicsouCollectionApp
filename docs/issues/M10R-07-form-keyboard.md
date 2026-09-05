---
title: "[UX] M10R-07 Formulaire : spacer clavier pour atteindre Notes"
labels: [enhancement, epic/collection, size/s, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-10. Test physique : quand on tape le texte, le clavier masque le champ
**Notes** (dernier champ) — impossible de le relire en haut de zone visible.
`MagazineForm` finit sur le submit sans espace de défilement.

# Tâche

- Ajouter en fin de formulaire un spacer adaptatif ≈ hauteur clavier :
  `KeyboardAvoidingView` (déjà sur `/scan/manual`, absent du form lui-même) ou
  écoute `Keyboard` (`keyboardDidShow/Hide` → `paddingBottom` dynamique, min 320) ;
- Objectif : Notes + submit remontent **au-dessus** du clavier, relisibles pendant
  la frappe ; conserver `keyboardShouldPersistTaps="handled"` et le scroll ;
- Vérifier Edit (`collection/[id]/edit`, sans `KeyboardAvoidingView`) du même coup.

# Critères de fin (DoD)

- [ ] Notes lisible au-dessus du clavier pendant la frappe (device, portrait)
- [ ] Pas de régression scroll/submit ; `lint` + `typecheck` verts, tests form verts
