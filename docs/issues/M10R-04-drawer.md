---
title: "[Nav] M10R-04 Menu latéral (drawer) permanent + liens directs"
labels: [enhancement, priority-high, size/m, to-do]
milestone: "M-10R — Retours test physique (v0.9.1)"
---

# Contexte

US-UX-09. Test physique : navigation exigée — menu latéral **toujours visible**
(burger/header ou geste) avec liens directs :
Accueil | Scan (sous-catégories : OCR / Code-barres / Manuel) |
Collection | Paramètres.

État actuel : zéro `Drawer` dans `src/` (grep Ø), pas de dépendance drawer.

> **Contrainte runtime (appliquée)** : `@react-navigation/drawer` est
> **incompatible avec expo-router SDK 57** (crash au démarrage). Le drawer est
> donc un composant **custom** `DrawerMenu` (Animated + PanResponder + Modal),
> piloté par un `DrawerProvider` context (`useDrawer()`).

> **Persistance de session** : le `Modal` reste **toujours monté**
> (`visible={visible}`, sans `return null`), ce qui préserve l'état plié/déplié
> « Par édition » entre deux ouvertures (revue de code v0.9.1). La section est
> pilotée par l'état parent `editionsExpanded` (Collapsible contrôlé :
> `expanded` + `onToggle`).

# Tâche

- `src/components/drawer-content.tsx` : panneau latéral animated custom
  (Modal transparent + Animated.spring + PanResponder glisser-ouvrir depuis le
  bord gauche) — zéro dépendance nav ;
- Contenu : Accueil `/`, Scan `/scan` + 3 sous-liens (`/scan/camera` OCR,
  `/scan/barcode`, `/scan/manual`), Collection `/(tabs)/collection` (via
  « Toute la collection »), Paramètres ;
- Header commun `src/components/app-header.tsx` avec burger (Feather `menu`,
  44px) sur écrans tabs ; thème Vault (fond `background`, icônes Feather
  20-22px) ;
- Drawer + tabs cohabitent : drawer = accès direct, tabs = geste premier.

# Critères de fin (DoD)

- [x] Drawer ouvrable (burger header + geste bord gauche) depuis écrans tabs, items ≥ 44px
- [x] Sous-catégories Scan naviguent direct (OCR / code-barres / manuel)
- [x] `lint` + `typecheck` verts, tests nav
