---
title: "[UX] M10R-10 Accès rapide scan global (hors écrans scan)"
labels: [enhancement, priority-high, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-12. Test physique : depuis Collection/Fiche/Paramètres, lancer un scan
demande trop de navigation. Exigé : **bouton d'accès rapide au scan sur toutes
les pages hors scan**. Aucun FAB dans `src/` (grep Ø).

# Tâche (revue : header au lieu du FAB 56px)

> **Décision de conception post-test physique** : le gros FAB 56px bas-droit
> risquait de chevaucher la gestuelle de navigation et les actions principales.
> À la place, l'accès rapide scan est un **petit bouton discret dans le header**
> commun des écrans tabs : burger (menu) à gauche, titre au centre, **scan à
> droite** (icône `crop` ~20px, `textSecondary`).

- Nouveau `src/components/app-header.tsx` : header fixe commun — bouton menu
  (`Feather menu`, 44px, → drawer), titre centré, lien scan (`Feather crop`,
  `testID="header-scan"`, `accessibilityLabel="Scanner un magazine"`) ;
- Intégrer sur les écrans tabs : Accueil, Collection, Paramètres ;
  (`collection/[id]` reste un modal sans header, back native) ;
- `onPress → router.push('/scan')` (choix OCR/Code-barres/Manuel) ;
- Ancien `scan-fab.tsx` supprimé (FAB 56px remplacé par le header).

# Critères de fin (DoD)

- [ ] Scan lançable en 1 tap depuis l'en-tête des 4 écrans (Accueil/Collection/Paramètres)
- [ ] `lint` + `typecheck` verts, tests (rendu, navigation)
