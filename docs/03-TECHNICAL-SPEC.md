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
| Framework | React Native | via Expo (SDK ~57) |
| Runtime | Expo (Development Build) | — |
| Langage | TypeScript | ~6.x |
| Navigation | Expo Router | — |
| Base de données | SQLite (`expo-sqlite`) | — |
| Gestion d'état | Zustand | — |
| Caméra | `expo-camera` | — |
| Scan code-barres | `expo-camera` (scan EAN-13 / ISBN) | — |
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
| `useSettingsStore` | Thème (système / clair / sombre), langue (FR) |
| `useBackupStore` | État du flux export / import (fichier choisi, busy, erreurs) |

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

> **Note technique (M-05) :** le pipeline logique (parsing `ocrTextParser.ts`, confiance, rapprochement base `findByPublicationAndIssue`) est livré et **testé**, et dépend d'une interface `OcrEngine` injectée. Le moteur natif est **branché par défaut** (`MlKitOcrEngine`) via `expo-mlkit-ocr` (Google ML Kit Text Recognition, on-device, hors ligne) : `dependencies.initialize()` l'utilise, l'écran `/scan/camera` capture une photo via `expo-camera` (`takePictureAsync`) puis appelle `recognizeText(uri)`. L'import du module natif est **paresseux** pour ne pas bloquer la CI. `expo-build-properties` force le iOS `deploymentTarget` à 16.4 (exigence ML Kit). La reconnaissance a été **validée sur téléphone physique** (v0.5.0) ; hors bibliothèque native, `recognize` retourne `null` (repli `NoopOcrEngine`).

### 5.5 Flux OCR v2 interactif & fiabilisation (M-12 → v1.1.0)

Évolution cible du pipeline (voir `04-FONCTIONAL-SPEC.md` §5.6, US-OCR-01..08) :

```
Photo (takePictureAsync)
   → Prétraitement image (redimensionnement + contraste, éphémère)     [M12-01]
   → reconnaître : texte + bounding boxes (blocks/lines/elements)      [M12-02]
   → analyser des candidats par champ (titre, numéro/tome, année, …)
     avec score de confiance (règles métier + positions spatiales)     [M12-03]
   → seuiller les propositions automatiques                            [M12-04]
   → écran intermédiaire : overlay photo + zones cliquables
     (conversion coordonnées image → écran)                            [M12-05]
   → associer une zone à un champ / corriger rapidement                [M12-06]
   → intégrer à findByPublicationAndIssue / saisie pré-remplie         [M12-07]
   → fiabiliser sur jeu de couvertures réelles (mesure des erreurs)    [M12-08]
```

**Décisions structurantes (à confirmer en implémentation, M12-02/03)** :
- **Données** : faire évoluer `OcrFrameResult` (actuellement `{ text }`) vers un
  résultat avec zones `{ blocks, lines, elements }`, chacune avec sa
  `boundingBox` (gap à vérifier dans `expo-mlkit-ocr` — un wrapper natif ou un
  changement de module peut être nécessaire) ;
- **Prétraitement** : évaluer `expo-image-manipulator` (candidat, §9) pour le
  redimensionnement/contraste ; traitement en mémoire, jamais enregistré (R14.2) ;
- **Analyse** : le classifier `ocrTextParser.ts` évolue vers un module de
  **candidats** (une liste par champ) + règles de discrimination
  (`192 PAGES`, `€8,50`, `2026`, `TOME 12` / `N° 125`) ;
- **Seuils** : un score de confiance ≥ seuil ⇒ proposition automatique ; scores
  proches ⇒ validation utilisateur ;
- **Écran** : nouvelle route (`/scan/ocr-review`) ; conversion des coordonnées
  OCR (référentiel photo, `W×H` capturé) vers l'écran (proportions, `resizeMode`) ;
- **Perf** (§8) : traitement borné hors bandeau UI, import paresseux conservé.

> **Statut M-12 : livré ✅** — issues M12-01..08 (#205-#212) closés, intégrés à
> la release **v1.0.0** (modules `ocrImagePreprocessor`, `ocrResultMapper`,
> `ocrCandidateAnalyzer`, `ocrProposals`, écran `/scan/ocr-review`, PR #214/#215).

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
- Le profil `preview` (`buildType: apk`) génère l'**APK** de la release finale ;
- L'**APK** est publié comme **GitHub Release** téléchargeable (pas de Play Store, ni d'AAB).

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
      "channel": "preview",
      "android": {
        "buildType": "apk"
      }
    }
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

> **État (v0.8.0, M-08)** : conforme et verrouillé — accueil via résumé léger `COUNT(*)` + 5 ajouts récents (`loadSummary`, `countAllCopies`) ; la liste complète n'est chargée que sur l'écran « Ma Collection » ; chargement initial parallèle ; OCR borné à 1 analyse / 500 ms (`ANALYSIS_INTERVAL_MS`) ; seuil de couverture CI ≥ 80 % global.

---

## 9. Liste des dépendances

### Dépendances principales

```json
{
  "expo": "~57.0.20",
  "expo-router": "~57.0.19",
  "expo-sqlite": "~57.0.2",
  "expo-camera": "~57.0.4",
  "expo-file-system": "~57.0.6",
  "expo-document-picker": "~57.0.1",
  "expo-sharing": "~57.0.18",
  "react-native": "0.86.3",
  "react": "19.2.3",
  "zustand": "^5.0.15"
}
```

### Dépendances de développement

```json
{
  "typescript": "~6.0.3",
  "jest": "^29.7.0",
  "jest-expo": "^57.0.5",
  "@testing-library/react-native": "13.2.0",
  "eslint": "^9.39.5",
  "eslint-config-expo": "~57.0.2",
  "prettier": "^3.9.6"
}
```

### Dépendance OCR (module natif, validé)
```json
{
  "expo-mlkit-ocr": "^0.2.7",
  "expo-build-properties": "~57.0.17"
}
```
Plugins (`app.json`) : `["expo-mlkit-ocr", { "iosEngine": "auto" }]` et `["expo-build-properties", { "ios": { "deploymentTarget": "16.4" } }]`.

> **M-12 (livré)** : `expo-image-manipulator` **installé** (prétraitement, M12-01 —
> redimensionnement ≤ 2600 px + ré-encodage JPEG 0.85) ; les **bounding boxes**
> sont exposées nativement par `expo-mlkit-ocr` (niveau *ligne*, M12-02), sans
> wrapper : `mapRecognitionResult` les projette en `OcrTextZone`. Les zones sont
> proposées à la sélection en **liste cliquable** (M12-05, test physique).

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
