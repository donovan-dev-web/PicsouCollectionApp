---
title: "[UX] M10R-10 Bouton flottant scan global (hors écrans scan)"
labels: [enhancement, priority-high, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-12. Test physique : depuis Collection/Fiche/Paramètres, lancer un scan
demande trop de navigation. Exigé : **bouton d'accès rapide au scan sur toutes
les pages hors scan**. Aucun FAB dans `src/` (grep Ø).

# Tâche

- Nouveau `src/components/scan-fab.tsx` : rond 56px `accent`, Feather `crop`,
  `testID="scan-fab"`, `accessibilityLabel="Scanner un magazine"`, ombre/élévation
  thème clair/sombre, positionné bas-droit avec `useSafeAreaInsets`
  (`bottom: insets.bottom + 88` pour ne pas chevaucher la TabBar) ;
- Intégrer sur : Accueil, Collection, Fiche, Edit/Manual ? (non : déjà en flux),
  Paramètres, Result/Multiple ? (non : écrans scan) → **Accueil, Collection,
  Fiche, Paramètres** ; masqué quand le clavier est ouvert (écoute `Keyboard`) ;
- `onPress → router.push('/scan')`.

# Critères de fin (DoD)

- [ ] Scan lançable en 1 tap depuis les 4 écrans, jamais sous TabBar/gesture bar
- [ ] `lint` + `typecheck` verts, tests (rendu, navigation, masquage clavier)
