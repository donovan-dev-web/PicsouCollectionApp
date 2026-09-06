---
title: "[Bug] M10R2-01 Drawer latéral : pas de SafeZone (en-tête sous l'encoche)"
labels: [bug, priority-high, size/s, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : sur téléphone à encoche, le drawer latéral custom
`DrawerMenu` fait passer son titre et son premier item sous la barre de statut.

`src/components/drawer-content.tsx` n'utilise **aucune** inset :
- `drawerHeader` : `padding: Spacing.four` fixe (pas de `paddingTop: insets.top`) ;
- `drawerPanel` : `top: 0, bottom: 0` (le contenu peut aussi frôler la gesture
  bar en bas).

Rappel : la SafeZone est un critère M10-02 (US-UX-02) — titres/boutons
toujours visibles, à 1 main.

# Tâche

- `useSafeAreaInsets()` dans `src/components/drawer-content.tsx` ;
- `drawerHeader` : `paddingTop: insets.top` (ou placer le header dans un
  conteneur avec `paddingTop: insets.top`) ;
- `drawer` / liste : `paddingBottom: insets.bottom` (ou `contentInset`) pour le
  dernier item ;
- Vérifier que le `Modal` transparent n'introduit pas de double inset.

# Critères de fin (DoD)

- [x] Titre + premier item du drawer visibles sous l'encoche (téléphone notched)
- [x] Dernier item (Paramètres) accessible au-dessus de la gesture bar
- [x] Pas de régression du rendu sans encoche
- [x] `lint` + `typecheck` verts, tests drawer (insets + testID)

# Tests

- Manuel : téléphone avec encoche + gesture bar, ouvrir/fermer le drawer.
- Composant : vérifier `paddingTop`/`paddingBottom` appliqués avec insets mockées.