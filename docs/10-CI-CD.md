# 🦆 Picsou Collection — CI / CD

> **Document de référence — v1.0**
>
> Ce document décrit la stratégie d'intégration continue (CI) et de déploiement continu (CD) du projet : workflows GitHub Actions, étapes, déclencheurs et intégration avec EAS Build.

---

## Table des matières

1. [Objectif](#1-objectif)
2. [Vue d'ensemble](#2-vue-densemble)
3. [Configuration de base](#3-configuration-de-base)
4. [Workflow CI principal](#4-workflow-ci-principal)
5. [Build EAS](#5-build-eas)
6. [Notification de qualité (coverage)](#6-notification-de-qualité-coverage)
7. [Règles avant fusion](#7-règles-avant-fusion)
8. [Secrets et variables](#8-secrets-et-variables)

---

## 1. Objectif

Garantir qu'**aucun code cassé n'est fusionné** dans `develop` ou `main`, et automatiser la **vérification de qualité** (lint, typecheck, tests, coverage) ainsi que le **build de production**.

---

## 2. Vue d'ensemble

```
Déclencheurs :
  - Pull Request vers develop / main
  - Push sur develop / main
  - Workflow manuel (workflow_dispatch)
         │
         ▼
┌──────────────────────────────────────────────┐
│              GitHub Actions                  │
│   install (cache) → lint → typecheck → test  │
│   → coverage → build (release)  │
└──────────────────────────────────────────────┘
         │
         ▼
   Fusion green seulement
```

---

## 3. Configuration de base

### 3.1 Fichiers nécessaires

```
.github/
├── workflows/
│   ├── ci.yml              # CI principale
│   └── eas-build.yml       # Build EAS (optionnel sur release)
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
└── PULL_REQUEST_TEMPLATE.md
```

### 3.2 Versions Node
Le projet exige une version Node compatible Expo SDK 52 (Node 18+).

---

## 4. Workflow CI principal

### 4.1 Fichier `.github/workflows/ci.yml` (indicatif)

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]
  push:
    branches: [develop, main]
  workflow_dispatch:

jobs:
  quality:
    name: Quality
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Tests
        run: npm test -- --ci

      - name: Coverage report
        run: npm run test:coverage

      - name: Upload coverage artifact
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### 4.2 Étapes et commandes

| Étape | Commande | Rôle |
|---|---|---|
| Install | `npm ci` | Installation reproductible |
| Typecheck | `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| Lint | `npm run lint` | Vérification ESLint |
| Tests | `npm test -- --ci` | Tests unitaires + composants |
| Coverage | `npm run test:coverage` | Rapport de couverture |

---

## 5. Build EAS

### 5.1 Optionnel — Build de release

```yaml
name: EAS Build

on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    name: EAS Build production
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - name: Install
        run: npm ci
      - name: EAS Build
        uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EAS_TOKEN }}
          command: eas build --platform android --profile production --non-interactive
```

### 5.2 Lien avec CI-CD
- Le build EAS de **production** est déclenché sur `main` ou sur un **tag** `v*` ;
- Il produit un **AAB** prêt pour le Play Store ;
- Le build **local** (Gradle) reste disponible pour le développement et les tests sur téléphone.

---

## 6. Notification de qualité (coverage)

Pour un suivi continu de la santé du projet (objectif *qualité pro*), un **rapport de couverture** est produit à chaque pipeline. Il est :
- téléchargé comme **artifact** ;
- idéalement publié via un service dédié (ex. Codecov / Coveralls) ou commentaire de PR via une action dédiée.

### Seuil de couverture cible
| Métrique | Cible |
|---|---|
| Couverture globale | ≥ 80 % |
| Couverture services/repositories | ≥ 85 % |
| Couverture composants critiques | ≥ 70 % |

> Les seuils pourront faire échouer la CI si non atteints, via `coverageThreshold` dans Jest (voir `12-TESTING.md`).

---

## 7. Règles avant fusion

Pour garantir la qualité, toute **pull request** vers `develop` ou `main` doit :

1. passer la **CI** (typecheck + lint + tests + coverage) ;
2. être **relue** ;
3. être **à jour** avec la branche cible (rebase si nécessaire) ;
4. mettre à jour la **documentation** si le changement l'impacte.

### Protection de branches
- `main` et `develop` sont **protégées** ;
- La CI verte est un **prérequis à la fusion** ;
- Pas de push direct sur `main` / `develop`.

---

## 8. Secrets et variables

| Secret / Variable | Usage | Où |
|---|---|---|
| `EAS_TOKEN` | Authentification EAS | Secrets GitHub |
| `NODE_VERSION` | (optionnel) Version Node | Variables |

---

## Récapitulatif

| Élément | Valeur |
|---|---|
| CI | GitHub Actions (typecheck + lint + tests + coverage) |
| Déclencheurs | PR / push sur develop et main |
| Build production | EAS Build (sur main / tag `v*`) |
| Build local | Gradle (`expo run:android`) |
| Couverture cible | ≥ 80 % global |
| Fusion | CI verte + revue obligatoires |