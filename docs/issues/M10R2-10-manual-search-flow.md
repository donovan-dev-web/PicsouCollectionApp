---
title: "[Nav] M10R2-10 Saisie manuelle du flux identification → écran Recherche (pas le formulaire d'ajout)"
labels: [enhancement, priority-high, epic/identification, size/m, to-do]
milestone: "M-10R2 — 2ᵉ passe retours test physique (v0.9.2)"
---

# Contexte

Test physique v0.9.2 — retour terrain : dans l'écran de **choix du type de
scan** (`/scan`), le bouton **« Saisir manuellement »** renvoie aujourd'hui au
**formulaire d'ajout** (`/scan/manual`), alors que l'utilisateur est dans le
**flux d'identification** (rechercher si un magazine existe déjà). Il faut
qu'il mène à un **mode recherche**, pas à un ajout direct.

Rappel cohérence : le bouton **« Ajouter »** de l'accueil
(`src/app/(tabs)/index.tsx:88-96` → `/scan/manual`) reste bien un **ajout**
(c'est son rôle). Seul le chemin **saisie manuelle du flux identification**
change de cible.

# État actuel

- `src/app/scan/index.tsx:51-60` : bouton `method-manual` → `router.push('/scan/manual')`
  (**à changer** → vers un écran de recherche).
- `src/components/drawer-content.tsx:244-250` : sous-item Scan « Saisie manuelle »
  → `route="/scan/manual"` (**à changer** → écran de recherche).
- `src/app/scan/manual.tsx` : formulaire d'ajout (pré-rempli via params `barcode`,
  `publication`, `issueNumber`, `year`) — **inchangé** (toujours appelé par le
  flux résultat « non trouvé » et par l'accueil).
- Capacités existantes à réutiliser pour la recherche :
  - `identificationService.searchByOcrFields(publication, issueNumber, date)`
    (`src/identification/identificationService.ts:133-156`) ;
  - `magazineRepository.findByPublicationAndIssue(publication, issueNumber)`
    (`src/database/repositories/magazine-repository.ts:88`) ;
  - `CollectionStore.findByPublicationAndIssue` (via le store) si dispo.

# Tâche

1. **Créer l'écran de recherche** `src/app/scan/search.tsx` (route `/scan/search`) :
   - champs **Publication** + **Numéro** (réutiliser les primitives du
     formulaire / `SelectField` si pertinent) ;
   - sur soumission → `findByPublicationAndIssue` :
     - **trouvé** → afficher le résultat (nom, N°, statut Possédé/Absent) et
       proposer les actions du flux identification (Voir la fiche /
       Ajouter exemplaire / Rescanner) — cohérence avec `result.tsx` ;
     - **non trouvé** → proposer « Saisir manuellement » qui mène à
       `/scan/manual` **pré-rempli** (`publication`, `issueNumber`) ;
   - bouton Annuler (retour) comme les autres écrans de scan.
2. **Repoint les 2 entrées** : `/scan` `method-manual` et drawer « Saisie
   manuelle » → `/scan/search`.
3. Adapter le libellé si utile (« Rechercher un magazine », « Saisir
   manuellement » restant un intitulé acceptable pour le drawer).
4. Tests du nouvel écran (trouvé / non trouvé / pré-remplissage du repli).

# Critères de fin (DoD)

- [x] `/scan` (bouton Saisir manuellement) ouvre **l'écran de recherche**
- [x] Drawer « Saisie manuelle » ouvre **l'écran de recherche**
- [x] Recherche non trouvée → repli vers le **formulaire d'ajout pré-rempli**
- [x] Recherche trouvée → résultat et actions du flux identification
- [x] Bouton « Ajouter » de l'accueil **inchangé** (formulaire) + tests à jour,
      `lint` + `typecheck` verts

# Tests

- Manuel : `/scan` → Saisir manuellement → recherche ; couverture existante /
  nouvelle ; drawer → même parcours.
- Composant : rendu, champ vide → soumission désactivée ; non trouvé →
  navigation `/scan/manual` pré-rempli.