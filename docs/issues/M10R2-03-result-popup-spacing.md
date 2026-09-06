---
title: "[Bug] M10R2-03 Popup « Couverture reconnue » : espacement des boutons"
labels: [bug, priority-high, epic/identification, size/s, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : le popup OCR « **Couverture reconnue** »
(`src/app/scan/camera.tsx`, l.488-529) a un problème de mise en page /
d'espacement entre les boutons.

État actuel :
- `resultCard` : overlay absolu centré (`maxHeight:'85%'`, `alignItems:'center'`),
  **pas de ScrollView** → peut déborder/clipper sur petit écran ;
- 3 boutons empilés avec `gap: Spacing.two` (8px) seulement (primary
  « Confirmer », secondaires « Réessayer » / « Saisie manuelle ») ;
- La SafeZone haute n'est pas couverte (seul `secondaryButton` utilise
  `insets.bottom`).

# Tâche

- Espacer les actions avec un `gap` ≥ `Spacing.three` (16px) et regrouper les
  boutons secondaires avec la même logique que `scan/result.tsx`
  (hiérarchie primary > secondary) ;
- Rendre le contenu défilable (`ScrollView`) si le card dépasse 85 % ;
- Appliquer les insets (encoche + gesture bar) à l'ensemble du popup ;
- Vérifier les états `found` et `unknown` (« Non trouvé en collection »).

# Critères de fin (DoD)

- [x] Boutons du popup bien espacés (≥ 16px) et hiérarchisés
- [x] Pas de clipping petit écran (scroll si nécessaire)
- [x] SafeZone encoche + gesture bar respectée
- [x] `lint` + `typecheck` verts, tests (rendu overlay found/unknown)

# Tests

- Manuel : OCR, couverture reconnue → vérifier espacement + scroll petit écran ;
  couverture inconnue → « Non trouvé » sans débordement.