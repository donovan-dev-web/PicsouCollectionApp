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

# Tâche

- Installer `@react-navigation/drawer` (+ `react-native-gesture-handler` déjà présent,
  vérifier `react-native-reanimated` — déjà en dépendances) via `npx expo install` ;
  utiliser `Drawer` d'`expo-router/drawer` dans la hiérarchie navigation ;
- Contenu : Accueil `/`, Scan `/scan` + 3 sous-liens (`/scan/camera` OCR,
  `/scan/barcode`, `/scan/manual`), Collection `/(tabs)/collection`, Paramètres ;
- Header minimal avec burger (Feather `menu`, 44px) sur écrans tabs ; thème
  Vault (fond `background`, actif `navActive`, icônes Feather 22px) ;
- Drawer + tabs cohabitent : drawer = accès direct, tabs = geste premier.

# Critères de fin (DoD)

- [ ] Drawer ouvrable (burger + geste) depuis Accueil/Collection/Scan, items ≥ 44px
- [ ] Sous-catégories Scan naviguent direct (OCR / code-barres / manuel)
- [ ] `expo-doctor` 21/21 (nouvelles déps natives), `lint` + `typecheck` verts, tests nav
