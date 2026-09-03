# 🦆 Picsou Collection — Spécification Technique

> **Document de référence — v1.0**
>
> Ce document décrit la stack technique, les choix d'implémentation, les dépendances et les contraintes techniques du projet.

---

## Table des matières

1. [Stack technique](#1-1-stack-technique)
2. [Choix d'implémentation](#2-choix-dimplémentation)
3. [Gestion d'état](#3-gestion-détat)
4. [Tests](#4-tests)
5. [OCR](#5-ocr)
6. [Scan code-barres](#6-scan-code-barres)
7. [Build et publication](#7-build-et-publication)
8. [Contraintes de performance](#8-contraintes-de-performance)
9. [Liste des dépendances](#9-liste-des-dépendances)

---

## 1. Stack technique

| Domaine | Technologie | Version cible |
|---|---|---|
| Framework | React Native | via Expo (SDK ~52) |
| Runtime | Expo (Development Build) | — |
| Langage | TypeScript | ~5.x |
| Navigation | Expo Router | — |
| Base de données | SQLite (`expo-sqlite`) | — |
| Gestion d'état | Zustand | — |
| Caméra | `expo-camera` | — |
| Scan code-barres | `expo-barcode-scanner` ou `expo-camera` (scan) | — |
| OCR | Google ML Kit Text Recognition (module natif) | — |
| Fichiers | `expo-file-system` + `expo-document-picker` + `expo-sharing` | — |
| Tests | Jest + React Native Testing Library | — |
| Build | EAS Build (cloud) + Build local (Gradle) | — |

---

## 2. Choix d'implémentation

### 2.1 Expo Development Build
Le projet utilise **Expo**, avec un **Development Build** installé sur un téléphone Android physique.

Cela permet :
- d'utiliser les modules Expo standards ;
- d'intégrer des modules natifs supplémentaires (ML Kit OCR) ;
- de tester caméra/OCR sur un véritable appareil ;
- de déboguer directement sur le matériel cible.

> Le développement sur téléphone physique est indispensable pour évaluer les performances caméra/OCR dans des conditions réelles.

### 2.2 TypeScript
Le projet est entièrement typé en TypeScript. Les types de domaine sont définis dans `06-DATA-MODEL.md`. Le mode strict est activé.

### 2.3 Expo Router
Navigation par fichiers, alignée sur la structure décrite dans `05-ARCHITECTURE.md`.

---

## 3. Gestion d'état

**Zustand** est choisi pour la gestion d'état applicatif.

### Pourquoi Zustand
- léger et sans boilerplate ;
- simple à intégrer avec React Native ;
- performant (pas de re-renders superflus) ;
- TypeScript-friendly.

### Stores prévus

| Store | Responsabilité |
|---|---|
| `useCollectionStore` | Liste de la collection, compteur, opérations CRUD sur magazines/exemplaires |
| `useSettingsStore` | Thème, langue (FR), préférences |
| `useIdentificationStore` | État du flux d'identification (méthode courante, résultat, confiance) |

> La source de vérité de la collection reste **SQLite** : les stores Zustand servent de cache/état UI synchronisé avec la base via les repositories.

---

## 4. Tests

Stratégie détaillée dans `12-TESTING.md`.

| Type | Outil | Couverture cible |
|---|---|---|
| Tests unitaires | Jest | Services, repositories, validation |
| Tests composants | React Native Testing Library | Écrans et composants critiques |

### Commandes prévues

```bash
npm test                 # exécute Jest (mode watch en dev)
npm run test:coverage    # génère le rapport de couverture
npm run lint             # ESLint
npm run typecheck        # tsc --noEmit
```

---

## 5. OCR

### 5.1 Technologie
**Google ML Kit Text Recognition** (module natif Android, on-device) via le module Expo **`expo-mlkit-ocr`** (`recognizeText(uri)`), compatible Development Build / EAS.

### 5.2 Contraintes
- doit être **suffisamment rapide** ;
- doit fonctionner **hors ligne** ;
- ne doit **pas enregistrer les images** (analyse éphémère) ;
- doit **limiter la consommation CPU** et ne pas bloquer l'interface ;
- ne doit **pas analyser chaque frame** à pleine résolution.

### 5.3 Stratégie d'analyse
```
Flux caméra (affichage continu)
        │
        └── quelques frames / seconde
                    ↓
                OCR (extraction texte)
                    ↓
            résultat suffisamment fiable ?
                    ↓
               arrêt de l'analyse
```

### 5.4 Extraction et confiance
L'OCR extrait :
- le titre / la **publication** ;
- le **numéro** (`N° 547`) ;
- la **date** lorsque disponible.

Un **niveau de confiance** (0..1) est calculé. En cas de confiance insuffisante, l'utilisateur peut réessayer ou saisir manuellement. L'application n'invente jamais une identification avec certitude.

> **Note technique (M-05) :** le pipeline logique (parsing `ocrTextParser.ts`, confiance, rapprochement base `findByPublicationAndIssue`) est livré et **testé**, et dépend d'une interface `OcrEngine` injectée. Le moteur natif est **branché par défaut** (`MlKitOcrEngine`) via `expo-mlkit-ocr` (Google ML Kit Text Recognition, on-device, hors ligne) : `dependencies.initialize()` l'utilise, l'écran `/scan/camera` capture une photo via `expo-camera` (`takePictureAsync`) puis appelle `recognizeText(uri)`. L'import du module natif est **paresseux** pour ne pas bloquer la CI. `expo-build-properties` force le iOS `deploymentTarget` à 16.4 (exigence ML Kit). **La reconnaissance se valide sur un Development Build (téléphone physique) via `eas build`** ; hors bibliothèque native, `recognize` retourne `null` (repli `NoopOcrEngine`).

---

## 6. Scan code-barres

### 6.1 Formats supportés
- **EAN-13** (principal) ;
- **ISBN** (pour les magazines avec ISBN).

### 6.2 Flux
```
Caméra → détection du code-barres → lecture du code
        → recherche locale (magazines.barcode) → édition trouvée ?
```

### 6.3 Point critique
La recherche par code-barres utilise l'index `idx_magazines_barcode` (non unique : un même code peut correspondre à plusieurs numéros/éditions). La requête reste très légère et ne charge jamais `notes` / `ocr_text`.

---

## 7. Build et publication

Deux modes de build :

### 7.1 Build local (développement)
- `expo run:android` pour lancer le Development Build sur le téléphone ;
- Gradle local pour générer un APK de test.

### 7.2 EAS Build (release)
- Configuration de `eas.json` pour les builds de production (AAB) ;
- Génère l'**AAB** (Android App Bundle) pour le Play Store.

### 7.3 Configuration `eas.json` (indicative)

```json
{
  "cli": { "version": ">= 5.0.0", "appVersionSource": "remote" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development"
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 8. Contraintes de performance

L'application est destinée à être utilisée sur un **téléphone Android potentiellement peu performant**.

Priorités :
1. réactivité de l'interface ;
2. démarrage rapide ;
3. scanner rapide ;
4. OCR raisonnablement rapide ;
5. faible consommation mémoire ;
6. faible consommation de stockage ;
7. fonctionnement hors ligne.

### Optimisation requêtes
- les données essentielles (`publication`, `issue_number`, `edition`, `language`, `publication_date`, `barcode`) restent indexées ;
- les requêtes de liste/scan ne chargent jamais `notes` et `ocr_text` inutilement ;
- l'OCR n'analyse qu'une fraction des frames.

---

## 9. Liste des dépendances

### Dépendances principales

```json
{
  "expo": "^52.0.0",
  "expo-router": "^4.0.0",
  "expo-sqlite": "^15.0.0",
  "expo-camera": "^16.0.0",
  "expo-file-system": "^18.0.0",
  "expo-document-picker": "^13.0.0",
  "expo-sharing": "^13.0.0",
  "react-native": "0.76.x",
  "react": "18.3.x",
  "zustand": "^5.0.0"
}
```

### Dépendances de développement

```json
{
  "typescript": "^5.x",
  "jest": "^29.x",
  "jest-expo": "~52.0.0",
  "@testing-library/react-native": "^12.x",
  "eslint": "^8.x",
  "eslint-config-expo": "~8.0.0"
}
```

### Dépendance OCR (module natif, à valider)
```json
{
  "@react-native-ml-kit/text-recognition": "^2.x"
}
```

---

## Récapitulatif des décisions techniques

| Sujet | Décision |
|---|---|
| Framework | React Native + Expo (Development Build) |
| Langage | TypeScript strict |
| Navigation | Expo Router |
| DB | SQLite via `expo-sqlite` |
| État | Zustand |
| Tests | Jest + RTL |
| OCR | Google ML Kit via `expo-mlkit-ocr` (on-device) |
| Scan | EAN-13 / ISBN |
| Build | EAS Build + Gradle local |
| Performance | Optimisée pour téléphone modeste |
