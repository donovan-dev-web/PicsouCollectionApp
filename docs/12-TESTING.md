# 🦆 Picsou Collection — Stratégie de Tests

> **Document de référence — v1.0**
>
> Ce document décrit la stratégie de tests du projet : les types de tests, l'outillage, les seuils de couverture et le suivi de la santé du projet.

---

## Table des matières

1. [Objectif](#1-objectif)
2. [Deux perspectives de test](#2-deux-perspectives-de-test)
3. [Catégorie A — Tests de fonctionnalité](#3-catégorie-a--tests-de-fonctionnalité)
4. [Catégorie B — Tests orientés utilisateur](#4-catégorie-b--tests-orientés-utilisateur)
5. [Types de tests](#5-types-de-tests)
6. [Outillage](#6-outillage)
7. [Structure des tests](#7-structure-des-tests)
8. [Niveau de couverture](#8-niveau-de-couverture)
9. [Suivi de la santé du projet](#9-suivi-de-la-santé-du-projet)
10. [Commandes](#10-commandes)
11. [Intégration CI](#11-intégration-ci)

---

## 1. Objectif

Garantir la **fiabilité** et la **robustesse** de l'application, élément crucial pour objectif de publication Play Store et de qualité professionnelle.

> Vision : *qualité pro et bonnes pratiques*, avec un suivi continu de la santé du projet, mais aussi une **attention constante à l'expérience utilisateur**.

---

## 2. Deux perspectives de test

L'objectif des tests n'est pas uniquement de vérifier la **qualité du code**. Il faut distinguer **deux perspectives complémentaires**, chacune répondant à une question différente :

| | **Catégorie A** | **Catégorie B** |
|---|---|---|
| **Nom** | Tests de fonctionnalité | Tests orientés utilisateur |
| **Question** | *« Le code fait-il ce qui lui est demandé ? »* | *« Le code fait-il ce que l'utilisateur attend ? »* |
| **Point de vue** | Technique (développeur) | Utilisateur / produit |
| **Focal** | Logique, comportement interne, contrats | Parcours, résultat perçu, valeur pour l'utilisateur |
| **Référence** | Spécifications techniques | User stories & critères d'acceptation |

Les deux catégories sont **réalisées en parallèle et sont toutes deux nécessaires** : une fonctionnalité peut être *techniquement correcte* (catégorie A) sans *répondre au besoin réel* de l'utilisateur (catégorie B), et inversement.

> **Principe directeur :** *le résultat d'une fonctionnalité est évalué avant tout du point de vue de l'utilisateur.*
> Un test de fonctionnalité ne suffit jamais seul : il doit être complété par un test orienté utilisateur qui valide que le comportement a bien du **sens** pour celui qui utilise l'application.

---

## 3. Catégorie A — Tests de fonctionnalité

> **Objectif :** vérifier que le **code effectue bien ce qui lui est demandé**, du point de vue technique et de la logique interne.

Ces tests valident les **contrats de code** : entrées → sorties, gestion des cas limites, intégrité des données. Ils sont **indépendants de l'interface**.

### Exemples de volets vérifiés
- le `collectionService` retourne le bon statut Possédé / Absent selon le nombre d'exemplaires ;
- le parseur EAN-13/ISBN lit correctement un code donné ;
- la validation d'import rejette un fichier au mauvais format ;
- l'export JSON produit un fichier bien formé ;
- le CRUD du repository inscrit/retrouve/supprime correctement en base.

### Types de tests concernés (détaillés à la section 5)
- **Tests unitaires** : validation de la logique métier et des services de façon isolée ;
- **Tests d'intégration de la couche de données** : validation du comportement réel avec SQLite.

---

## 4. Catégorie B — Tests orientés utilisateur

> **Objectif :** vérifier que le code **effectue bien ce que l'utilisateur attend**, du point de vue du parcours et du résultat perçu.

Ces tests s'appuient sur les **user stories** et leurs **critères d'acceptation** (voir `08-USER-STORIES.md`). Ils valident que la fonctionnalité remplit effectivement le besoin pour lequel elle a été conçue.

### Question à chaque test
- *En tant qu'utilisateur, en faisant cette action, est-ce que j'obtiens bien le résultat attendu ?*
- *Le parcours est-il clair, sans blocage, du point de vue de l'utilisateur ?*

### Exemples de parcours validés
- ouvrir l'application → scannner un code-barres → identifier ↑ savoir immédiatement si je possède ce magazine ;
- quand un code-barres est inconnu → l'application me propose la méthode suivante (je ne reste jamais bloqué) ;
- quand j'ajoute une édition déjà possédée → l'application m'avertit et me laisse le choix ;
- quand j'importe un fichier invalide → ma collection n'est pas corrompue et un message clair s'affiche ;
- quand je pointe la caméra sur une couverture → l'OCR me donne une identification accompagnée de sa confiance.

### Types de tests concernés (détaillés à la section 5)
- **Tests de composants orientés parcours** : reproduction des parcours utilisateur clés au niveau de l'UI ;
- **Tests manuels (terrain)** : validation réelle en conditions d'utilisation (brocante, vrais magazines).

---

## 5. Types de tests

### 5.1 Tests unitaires (catégorie A)
Couvrent les **services** et **repositories** de façon isolée.

**Cibles :**
- `collectionService` : logique de possession (Possédé / Absent) ;
- `identificationService` : identification par barcode / OCR ;
- `confidence` : calcul et seuils de confiance ;
- `backup/export` : sérialisation JSON ;
- `backup/import` : validation et import ;
- `magazineRepository` : CRUD et requêtes ;

**But :** vérifier la logique métier sans dépendre de l'UI ni du matériel.

### 5.2 Tests de composants (React Native Testing Library)
Couvrent le rendu et les interactions des **écrans et composants critiques**. Ils servent **aux deux catégories** :
- **catégorie A** : l'écran réagit-il correctement aux données / événements qu'on lui fournit ?
- **catégorie B** : en suivant le parcours utilisateur, obtient-on bien le résultat attendu ?

**Cibles :**
- Écran Accueil (compteur, boutons) ;
- Écran Résultat (Possédé / Absent) ;
- Fiche magazine ;
- Formulaire de saisie manuelle ;
- Composants réutilisables (`StatusBadge`, `MagazineCard`).

### 5.3 Tests manuels (terrain) [catégorie B]
Tests sur **téléphone physique** avec de vrais magazines, notamment pour caméra et OCR (difficilement automatisables). C'est le cas le plus évident de validation **du point de vue de l'utilisateur** : le résultat est-il réellement utilisable en brocante ?

---

## 6. Outillage

| Outil | Usage |
|---|---|
| **Jest** | Framework de test (runner + assertions) |
| **jest-expo** | Preset Jest pour React Native / Expo |
| **@types/jest** | Types TS pour Jest (29.5.14, aligné Expo SDK 57) |
| **react-test-renderer** | Rendu des composants en environnement de test |
| **expo-doctor** | Vérification de la santé du projet / écosystème Expo (21 checks) |

> **À venir** : React Native Testing Library (tests de composants interactifs) et `ts-jest` seront ajoutés quand les écrans seront développés (M-03).

---

## 7. Structure des tests

Les tests sont placés **à côté du code source** qu'ils couvrent, convention `*.test.ts` :

```
src/
├── collection/
│   ├── collectionService.ts
│   └── __tests__/
│       └── collectionService.test.ts
│
├── identification/
│   ├── scanBarcode.ts
│   └── __tests__/
│       └── scanBarcode.test.ts
```

Alternativement, les tests peuvent être co-localisés `collectionService.test.ts` au même niveau.

---

## 8. Niveau de couverture

### 8.1 Seuils (Jest `coverageThreshold` — config dans `package.json`)

```json
"coverageThreshold": {
  "global": {
    "branches": 70,
    "functions": 70,
    "lines": 70,
    "statements": 70
  }
}
```

| Zone | Couverture actuelle | Couverture cible |
|---|---|---|
| Global | **100 %** (seuil CI ≥ 70 %) | ≥ 80 % |
| Services / repositories | consolidée (M-02) | ≥ 85 % |
| Composants critiques | à consolider (M-03) | ≥ 70 % |

> État M-02 : 29 tests / 7 suites, **100 % de couverture** sur `src/`, branches 93,93 %, seuils globaux 70 %.

### 8.2 Exclusion de couverture
Certains fichiers sont exclus du calcul :
- fichiers de configuration ;
- code purement de démarrage (entry points) ;
- types uniquement.

---

## 9. Suivi de la santé du projet

Pour un suivi continu, le **rapport de couverture** est généré par la CI et :

- téléchargé comme **artifact** GitHub Actions ;
- publié sur un service de coverage (Codecov / Coveralls) si configuré ;
- consultable dans `coverage/` en local.

### Indicateurs de santé suivis
| Indicateur | Source |
|---|---|
| Taux de couverture global | Coverage CI |
| Tendance de couverture | Historique CI |
| Nombre de tests | Jest |
| Temps d'exécution des tests | Jest / CI |
| Taux de réussite CI | GitHub Actions |

Ces indicateurs sont rapportés dans les revues de PR et lors des milestones.

---

## 10. Commandes

```bash
npm test                  # Exécute Jest (--watch en mode dev)
npm test -- --ci          # Exécution CI non interactive
npm run test:coverage     # Génère le rapport de couverture
npm run typecheck         # Vérification TypeScript
npm run lint              # Vérification ESLint
npm run format:check      # Vérification Prettier
npm run doctor            # Vérification écosystème Expo (expo-doctor)
```

### Scripts dans `package.json` (réels)

```json
{
  "scripts": {
    "test": "jest",
    "test:coverage": "jest --coverage",
    "test:watch": "jest --watch",
    "typecheck": "tsc --noEmit",
    "lint": "expo lint",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "doctor": "expo-doctor"
  }
}
```

---

## 11. Intégration CI

La CI (voir `10-CI-CD.md`) exécute :

1. `npm run typecheck` ;
2. `npm run lint` ;
3. `npm run format:check` ;
4. `npm run doctor` ;
5. `npm test -- --ci` ;
6. `npm run test:coverage` ;
7. Téléchargement du rapport de coverage.

**Règle :** une PR ne peut être fusionnée que si la CI est **verte** (incluant couverture ≥ seuils).

---

## Récapitulatif

| Élément | Valeur |
|---|---|
| Catégorie A — Fonctionnalité | *Le code fait-il ce qui lui est demandé ?* |
| Catégorie B — Orienté utilisateur | *Le code fait-il ce que l'utilisateur attend ?* |
| Tests unitaires | Jest (services, repositories) |
| Tests composants | React Native Testing Library (parcours Cat. B + rendu Cat. A) |
| Tests manuels terrain | Catégorie B, sur téléphone physique |
| Couverture globale cible | ≥ 80 % |
| Couverture services | ≥ 85 % |
| Couverture composants critiques | ≥ 70 % |
| CI | Les tests bloquent la fusion |
| Rapport | Généré et archivé en CI |
