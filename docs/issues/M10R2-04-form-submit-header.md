---
title: "[UX] M10R2-04 Formulaire : bouton Enregistrer accessible sans scroll (icône header)"
labels: [enhancement, priority-high, epic/collection, size/s, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : sur le formulaire d'ajout, le bouton **Enregistrer** se
trouve en bas du `ScrollView` (`src/components/magazine-form.tsx`, l.303-311) —
il faut scroller pour l'atteindre sur petit écran.

Cible retenue (décision M-10R2) : **icône `Valider` (`check`) dans le header,
en haut à droite**, toujours visible pendant la saisie. Le bouton plein largeur
en pied de formulaire est conservé (accessibilité / découverte).

# Tâche

- Ajouter au header des écrans formulaire (`scan/manual.tsx`, `edit.tsx`) un
  bouton **check** (Feather `check`, ≥ 44px, `testID="submit-header"`) qui
  déclenche la même `handleSubmit` que le bouton bas ;
- Désactiver le bouton header quand `canSubmit` est faux (a11y state,
  raison affichée) et afficher le spinner pendant `submitting` ;
- Conserver le bouton plein largeur en pied (inchangé) ;
- Si `AppHeader` est réutilisé, permettre un slot droit optionnel par-dessus le
  lien scan (sinon header local sur ces 2 écrans).

# Critères de fin (DoD)

- [x] Enregistrer déclenchable en 1 tap depuis le header (top) sur ajout + edit
- [x] État désactivé → hint conservé ; spinner pendant le submit
- [x] Bouton bas plein largeur toujours présent
- [x] `lint` + `typecheck` verts, tests (submit via header, disabled)

# Tests

- Manuel : ajout manuel et modification → valider via l'icône header.
- Composant : press `submit-header` → `onSubmit` appelé ; `disabled` quand vide.