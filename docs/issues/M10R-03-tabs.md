---
title: "[Nav] M10R-03 Tabs : Accueil | Scan | Collection"
labels: [enhancement, priority-high, epic/accueil, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-09. Test physique : le scan est le geste premier (brocante) mais n'a pas
d'entrée directe. Cible : TabBar **Accueil | Scan | Collection** —
`src/app/(tabs)/_layout.tsx` actuel : Accueil/Collection/Paramètres.

# Tâche

- Remplacer l'onglet Collection→Scan ? Non : ordre **Accueil, Scan, Collection** ;
  l'onglet Scan ouvre `/scan` (choix OCR/Code-barres/Manuel, M10-03) ;
- Paramètres sort des tabs → accessible via drawer (M10R-04) ; prévoir redirection
  d'ancien deep-link `/ (tabs)/settings` si nécessaire ;
- Icônes Feather : `home`, `crop` (scan), `book-open` ; `navActive` conservé ;
  badge compteur collection sur l'onglet Collection (rappel M10-03).

# Critères de fin (DoD)

- [ ] 3 onglets avec icônes, actif visible clair/sombre, cibles ≥ 44px
- [ ] Deep-link `/scan` direct depuis l'onglet, retour tabs cohérent
- [ ] `lint` + `typecheck` verts, tests tabs maj (icônes + routes)
