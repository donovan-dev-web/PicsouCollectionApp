---
title: "[UX] M10R2-06 Paramètres : refonte en sous-menus (Apparence, Sauvegarde, Accessibilité, Retour)"
labels: [enhancement, priority-medium, size/l, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : l'écran Paramètres n'a que 2 sections plates (Apparence
= thème, Sauvegarde = export/import) et **aucun moyen de remonter un bug / une
idée / une suggestion**. `src/app/(tabs)/settings/index.tsx`.

# Tâche

Refonte en **sous-menus** :

- **Apparence** : thème (Système/Clair/Sombre — existant), + options identifiées
  (ex. taille de texte, densité) si pertinent ;
- **Sauvegarde** : Export / Import (JSON/CSV — existant), derniers exports ;
- **Accessibilité** : sous-menus à identifier — ex. taille de police /
  agrandissement du texte, réduction des animations, contraste renforcé
  (inventaire des options raisonnables pour l'app) ;
- **Rapport bug / idée / suggestion** : 3 entrées (ou une sous-section
  « Aide & retours ») qui ouvrent **la page Discussions du dépôt GitHub** dans
  le navigateur via `expo-linking`/`Linking.openURL`
  (`https://github.com/donovan-dev-web/PicsouCollectionApp/discussions`) ;
- Conserver les états busy/erreur de sauvegarde et l'accessibilité existante.

Structure : chaque sous-menu est un écran dédié (nested `Stack.Screen` /
section) avec titre + retour, ou une section accordéon repliable si plus léger
— cohérent avec le design Vault.

# Critères de fin (DoD)

- [ ] Paramètres = sous-menus (Apparence, Sauvegarde, Accessibilité, Aide & retours)
- [ ] Bug / idée / suggestion → ouvre les Discussions GitHub dans le navigateur
- [ ] Options d'accessibilité identifiées et implémentées (au moins 1 pertinente)
- [ ] `lint` + `typecheck` verts, tests (sous-menus, lien GitHub, options)

# Tests

- Manuel : parcourir les sous-menus ; tap « Signaler » → navigateur GitHub.
- Composant : rendu des sections, actions (export/import/busy conservés).