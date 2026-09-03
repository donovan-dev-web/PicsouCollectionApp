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

Garantir qu'**aucun code cassé n'est fusionné** dans `develop` ou `main`, et automatiser la **vérification de qualité** (typecheck, lint, format, doctor, tests, coverage) ainsi que le **build de production**.

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
│   install (npm ci) → typecheck → lint →      │
│   format → doctor → tests → coverage         │
└──────────────────────────────────────────────┘
         │
         ▼
   Fusion green seulement
```

> ⚠️ Pipeline conditionnée par la présence de `package.json` (garde `initialized`) : tant que le projet Expo n'était pas initialisé, les checks étaient ignorés. Depuis M-01, le projet est à la racine et **tous les checks s'exécutent**.

---

## 3. Configuration de base

### 3.1 Fichiers nécessaires

```
.github/
├── workflows/
│   └── ci.yml              # CI principale
└── ISSUE_TEMPLATE/
    ├── bug_report.md
    └── feature_request.md
```

> Le workflow `eas-build.yml` (build EAS automatique) n'existe pas encore : les builds EAS sont déclenchés **manuellement** (`eas build`). Voir [section 5](#5-build-eas).

### 3.2 Versions Node / npm
- **Node 20** (compatible Expo SDK 57) ;
- **npm 10.9.4** imposé par le champ `packageManager` dans `package.json`. Le lockfile doit être régénéré avec npm 10, sinon `npm ci` échoue côté EAS/CI (« Missing: … from lock file ») lorsque le lockfile est en format npm 11.

---

## 4. Workflow CI principal

### 4.1 Fichier `.github/workflows/ci.yml` (réel)

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
    outputs:
      initialized: ${{ steps.check.outputs.initialized }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      # Garde : tant que le projet Expo (package.json) n'existe pas, le
      # pipeline sort en succès sans exécuter les checks.
      - name: Vérifier l'initialisation du projet
        id: check
        run: |
          if [ -f "package.json" ]; then
            echo "initialized=true" >> "$GITHUB_OUTPUT"
          else
            echo "initialized=false" >> "$GITHUB_OUTPUT"
          fi
        shell: bash

      - name: Setup Node
        if: steps.check.outputs.initialized == 'true'
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        if: steps.check.outputs.initialized == 'true'
        run: npm ci

      - name: Typecheck
        if: steps.check.outputs.initialized == 'true'
        run: npm run typecheck

      - name: Lint
        if: steps.check.outputs.initialized == 'true'
        run: npm run lint

      - name: Format
        if: steps.check.outputs.initialized == 'true'
        run: npm run format:check

      - name: Doctor
        if: steps.check.outputs.initialized == 'true'
        run: npm run doctor

      - name: Tests
        if: steps.check.outputs.initialized == 'true'
        run: npm test -- --ci

      - name: Coverage report
        if: steps.check.outputs.initialized == 'true'
        run: npm run test:coverage

      - name: Upload coverage artifact
        if: steps.check.outputs.initialized == 'true'
        uses: actions/upload-artifact@v4
        with:
          name: coverage
          path: coverage/
```

### 4.2 Étapes et commandes

| Étape | Commande | Rôle |
|---|---|---|
| Install | `npm ci` | Installation reproductible (npm 10 épinglé) |
| Typecheck | `npm run typecheck` | Vérification TypeScript (`tsc --noEmit`) |
| Lint | `npm run lint` | Vérification ESLint (`expo lint`) |
| Format | `npm run format:check` | Vérification Prettier (format du code) |
| Doctor | `npm run doctor` | Vérification de l'écosystème Expo (`expo-doctor`) |
| Tests | `npm test -- --ci` | Tests unitaires + composants |
| Coverage | `npm run test:coverage` | Rapport de couverture |

---

## 5. Build EAS

> **Actuellement** : les builds EAS sont lancés **manuellement** via `eas build` (profils `development`, `preview`, `production` définis dans `eas.json`). Le build `preview` produit un **APK** installable sur téléphone ; le build `production` produit un **AAB** prêt pour le Play Store.

### 5.0 Validation M-05 sur téléphone physique (OCR)

Le module OCR `expo-mlkit-ocr` (Google ML Kit) est **natif** : il n'est pas disponible dans Expo Go. Pour le valider sur un **téléphone Android physique** :

```bash
eas build --profile preview --platform android   # produit un APK installable
# ou, pour un Development Build (débogage JS + module natif) :
eas build --profile development --platform android
```

À la première exécution, le module est récupéré via le prebuild (config plugins `expo-mlkit-ocr` + `expo-build-properties` déjà paramétrés dans `app.json`). Une fois l'APK installé, ouvrir **Scan → Caméra / OCR** et viser une couverture : le texte reconnu doit alimenter l'écran `/scan/camera`.

### 5.1 À venir — Workflow GitHub (build automatique sur release)

Le workflow ci-dessous sera activé pour automatiser le build de production sur `main` ou sur un tag `v*` :

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

### 5.2 Retour d'expérience (M-01)
- `eas-cli` est utilisé en **global / `npx`** (pas en devDependency) ; la version est épinglée via `cli.version` dans `eas.json` ;
- Le lockfile doit être généré avec **npm 10** (voir 3.2) ;
- Le **keystore Android** est hébergé côté EAS (généré au premier build).

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

> Les seuils pourront faire échouer la CI si non atteints, via `coverageThreshold` dans Jest (voir `12-TESTING.md`). Seuil actuel : 70 % global.

---

## 7. Règles avant fusion

Pour garantir la qualité, toute **pull request** vers `develop` ou `main` doit :

1. passer la **CI** (typecheck + lint + format + doctor + tests + coverage) ;
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
| CI | GitHub Actions (typecheck + lint + format + doctor + tests + coverage) |
| Déclencheurs | PR / push sur develop et main |
| Build EAS | manuel pour l'instant (`eas build`) ; workflow auto à venir |
| Couverture cible | 70 % global (actuel), ≥ 80 % (objectif) |
| Fusion | CI verte + revue obligatoires |