---
title: "[UX] M10R2-05 Premier lancement : écran de présentation (onboarding) + permission caméra"
labels: [enhancement, priority-high, size/l, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 : au premier lancement, l'app ouvre directement l'accueil.
Aucune présentation des fonctionnalités, pas d'explication d'utilisation, et la
permission caméra n'est demandée qu'à la première ouverture d'un écran caméra.

État : aucune notion de premier lancement (grep Ø onboarding / first-run) ; le
store settings ne persiste que `colorScheme` (table `settings` clé/valeur,
générique).

# Tâche

Écran de présentation **au premier lancement uniquement** (parcours
onboarding) :
1. **Écrans de présentation / branding** (2-3 pages ou une page scrollable :
   nom + visuel, fonctionnalités clés, description / utilisation) avec bouton
   **« Commencer »** ;
2. **Écran de demande d'autorisation caméra** (bouton « Autoriser la caméra »,
   lien « Plus tard » acceptable) — SafeZone (M10R2-02) ;
3. Après validation → **accueil**. Persister un flag `onboarding_done` dans la
   table `settings` (via `SettingsRepository`) ; redirect conditionnel dans
   `_layout.tsx` (rendre l'onboarding si pas encore vu) ;
4. Le flag se réinitialise « proprement » (désinstall/réinstall = nouveau
   premier lancement ; aucune rétroaction nécessaire).

# Critères de fin (DoD)

- [x] 1er lancement → présentation → permission caméra (si demandée) → accueil
- [x] Lancements suivants → accueil directement (flag persistant en base, table `settings`)
- [x] Bouton « Commencer » + permission caméra SafeZone (M10R2-02)
- [x] `lint` + `typecheck` verts, tests (onboarding flag, flow, skip)

# Tests

- Manuel : réinstaller → onboarding visible ; relancer → accueil direct.
- Store/repo : flag `onboarding_done` persisté/rechargé ; tests du flux.