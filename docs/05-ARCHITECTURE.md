# 🦆 Picsou Collection — Architecture

> **Document de référence — v1.0**
>
> Ce document décrit l'architecture logicielle de l'application : les couches, la navigation, l'organisation du code source et les flux de données.

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Choix d'architecture](#2-choix-darchitecture)
3. [Structure du code source]( #3-structure-du-code-source)
4. [Navigation (Expo Router)](#4-navigation-expo-router)
5. [Les couches logicielles](#5-les-couches-logicielles)
6. [Flux de données](#6-flux-de-données)
7. [Injection de dépendances](#7-injection-de-dépendances)
8. [Gestion des erreurs et états](#8-gestion-des-erreurs-et-états)
9. [Règles de nommage](#9-règles-de-nommage)

---

## 1. Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                      UI (écrans)                     │
│   Accueil · Scanner · Identification · Collection    │
│   Fiche · Paramètres                                 │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│               Stores Zustand (état UI)               │
│   useCollectionStore · useSettingsStore ·            │
│   useBackupStore                                     │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                     Services                         │
│   IdentificationService · BackupService              │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  Repositories                        │
│   magazine-repository · collection-repository ·     │
│   settings-repository                               │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  SQLite (expo-sqlite)                │
│        magazines · collection_items · settings       │
└─────────────────────────────────────────────────────┘
```

L'architecture sépare clairement les responsabilités :
- **UI** : affichage et interaction ;
- **Stores** : état applicatif + logique de collection (via repositories) ;
- **Services** : logique métier (identification, sauvegarde) ;
- **Repositories** : accès aux données ;
- **SQLite** : persistance.

---

## 2. Choix d'architecture

### 2.1 Séparation UI / logique métier
Les écrans ne contiennent pas de logique métier. Ils appelent les stores/services et rendent l'état.

### 2.2 Repositories comme seule porte d'entrée SQL
Tout accès à la base passe par les repositories. Aucun écran ne manipule directement SQLite.

### 2.3 Identification indépendante de la méthode
Les trois méthodes d'identification produisent une structure commune `MagazineIdentification`. L'UI ne sait pas comment l'identification a été obtenue.

---

## 3. Structure du code source

```
src/
├── app/                          # Écrans + navigation (Expo Router)
│   ├── _layout.tsx               # Layout racine (providers, stack racine)
│   ├── +not-found.tsx            # 404
│   ├── onboarding.tsx
│   ├── collection/[id]/edit.tsx
│   ├── collection/[id]/index.tsx
│   ├── scan/
│   │   ├── barcode.tsx
│   │   ├── camera.tsx
│   │   ├── form-barcode.tsx
│   │   ├── index.tsx
│   │   ├── manual.tsx
│   │   ├── multiple.tsx
│   │   ├── result.tsx
│   │   └── search.tsx
│   └── (tabs)/
│       ├── _layout.tsx           # TabBar Accueil | Ma Collection | Paramètres
│       ├── index.tsx             # Accueil
│       └── collection/index.tsx  # Ma Collection
│       └── settings/
│           ├── _layout.tsx
│           ├── index.tsx
│           ├── accessibility.tsx
│           ├── appearance.tsx
│           ├── backup.tsx
│           └── help.tsx
│
├── database/
│   ├── schema.ts                 # DDL + migrations
│   ├── migrations.ts             # Gestion de version de schéma
│   ├── database.ts               # Initialisation de la connexion
│   ├── types.ts                  # Types SQLite / rows
│   └── repositories/
│       ├── magazine-repository.ts
│       └── settings-repository.ts
│
├── identification/
│   ├── barcodeStabilizer.ts      # Lissage des lectures récurrentes
│   ├── scanBarcode.ts            # Nettoyage / validation EAN-13, ISBN
│   ├── identificationService.ts  # Orchestration scan + recherche
│   └── ocr/
│       ├── ocrTypes.ts          # Interface OcrEngine + OcrFrameResult (+ zones, M-12)
│       ├── ocrTextParser.ts     # Extraction publication / numéro / date
│       ├── ocrTextStabilizer.ts # Vote multi-frames (2 lectures concordantes)
│       ├── ocrEngine.ts         # NoopOcrEngine (repli CI-safe)
│       ├── mlKitOcrEngine.ts    # Moteur natif Google ML Kit (par défaut)
│       ├── ocrImagePreprocessor.ts # Prétraitement éphémère (M-12, M12-01)
│       └── ocrCandidateAnalyzer.ts # Candidats par champ + confiance (M-12, M12-03)
│
├── backup/
│   ├── backup-service.ts         # Export / import JSON + CSV
│   ├── backup-format.ts          # Types du format JSON
│   └── file-gateway.ts           # Lecture / écriture fichiers (partage)
│
├── store/
│   ├── useCollectionStore.ts     # Collection, compteur, CRUD
│   ├── useSettingsStore.ts       # Thème
│   └── useBackupStore.ts         # État du flux export / import
│
├── lib/
│   ├── toast.ts                  # Toast partagé
│   ├── slug.ts                   # Génération d'identifiants de route
│   ├── pending-barcode.ts        # Code-barres en attente (focus)
│   └── drawer-context.tsx        # Contexte du drawer latéral
│
├── components/                   # Composants réutilisables
│   ├── ErrorState.tsx
│   ├── EmptyState.tsx
│   ├── LoadingState.tsx
│   ├── Toast.tsx                 # Toast partagé (ex. nursery, import)
│   └── ...
│
├── constants/
│   └── theme.ts                  # Tokens + palette (clair + sombre)
│
├── hooks/
│   └── use-theme.ts              # Hook thème contextuel
│
├── types/
│   └── index.ts                  # Types de domaine
│
├── dependencies.ts               # Injection de dépendances (stores, DB)
└── test-utils.tsx                # Helpers de test (RTL)
```

---

## 4. Navigation (Expo Router)

Structure des écrans via `src/app/` (Expo Router, SDK 57).

```
src/app/
├── _layout.tsx                  # Stack racine : onboarding, (tabs), scan/*, collection/[id]/*
├── onboarding.tsx               # Onboarding (thème, modèle de franchise)
├── +not-found.tsx               # 404
│
├── (tabs)/                      # TabBar : Accueil | Ma Collection | Paramètres
│   ├── _layout.tsx
│   ├── index.tsx                # Accueil (cockpit)
│   ├── collection/index.tsx     # Ma Collection
│   └── settings/
│       ├── index.tsx            # Paramètres (sous-menus)
│       ├── backup.tsx           # Export / Import JSON ou CSV
│       ├── appearance.tsx       # Thème
│       ├── accessibility.tsx    # Réductions de mouvements
│       └── help.tsx             # À propos, version
│
├── scan/                        # Écrans hors onglets (modal)
│   ├── index.tsx                # Choix de méthode
│   ├── barcode.tsx              # Scanner code-barres
│   ├── camera.tsx               # Caméra / OCR
│   ├── manual.tsx               # Saisie manuelle
│   ├── form-barcode.tsx         # Enregistrement d'un code-barres
│   ├── search.tsx               # Recherche franchise / titre / numéro
│   ├── result.tsx               # Résultat (Possédé / Absent)
│   └── multiple.tsx             # Code-barres → liste d'éditions
│
└── collection/
    ├── [id]/index.tsx           # Fiche magazine
    └── [id]/edit.tsx            # Édition
```

### Racine de navigation
Le `_layout.tsx` racine déclare une **stack** : `onboarding`, `(tabs)` (Accueil, Ma Collection, Paramètres), les écrans de **Scan** et la **Fiche magazine** hors onglets pour concentrer l'attention. Un drawer latéral custom (sans `@react-navigation/drawer`) est câblé dans la barre d'entête (burger + scan), avec éditions repliables et pré-filtrage.

---

## 5. Les couches logicielles

### 5.1 Repositories

#### `magazine-repository.ts` (`MagazineRepository`)
Opérations sur les éditions :

```ts
findByBarcode(barcode): Promise<Magazine | null>
findManyByBarcode(barcode): Promise<MagazineListItem[]>
findById(id): Promise<MagazineDetail | null>
list(): Promise<MagazineListItem[]>
search(query): Promise<MagazineListItem[]>
create(input: CreateMagazineInput): Promise<Magazine>
update(id, input): Promise<Magazine>
delete(id): Promise<void>
```

#### `collection-repository.ts` (`CollectionRepository`)
Opérations sur les exemplaires :

```ts
countByMagazine(magazineId): Promise<number>
countAllCopies(): Promise<number>
listByMagazine(magazineId): Promise<CollectionItem[]>
listRecentCopies(limit = 5): Promise<RecentCopy[]>
deleteCopy(id): Promise<void>
```

#### `settings-repository.ts` (`SettingsRepository`)
Paramètres applicatifs (table `settings`) :

```ts
getColorScheme(): Promise<ColorSchemeSetting>
setColorScheme(colorScheme): Promise<void>
getOnboardingDone(): Promise<boolean>
setOnboardingDone(done): Promise<void>
getReducedMotion(): Promise<boolean>
setReducedMotion(reduced): Promise<void>
```

### 5.2 Services

#### `identificationService.ts`
```ts
identifyByBarcode(barcode): Promise<BarcodeLookupResult>
// found (1 édition) / ambiguous (plusieurs pour le même code) / unknown / invalid
identifyByOCR(text): Promise<OcrLookupResult>
// found / weak (confiance insuffisante) / unknown / no-text
searchByOcrFields(publication, issueNumber, date): Promise<MagazineListItem[]>
// recherche ciblée depuis les champs extraits (écran caméra)
```

#### `ocr/` — moteur OCR (M-05, US-ID-03 / M10R2-09, US-UX-21)
```ts
// ocrTypes.ts
interface OcrEngine { recognize(frame): Promise<OcrFrameResult> }  // OcrFrameResult = { text } | null

// ocrTextParser.ts  (pur, testable)
parseOcrText(raw): OcrParseResult      // publication, issueNumber, date, confidence (0..1)
isConfident(parse): boolean            // seuil MIN_CONFIDENCE

// ocrTextStabilizer.ts (pur, testable) — vote multi-frames M10R2-09
OcrTextStabilizer(threshold = 2)       // exige 2 lectures OCR identiques avant de conclure

// ocrEngine.ts      (moteur de repli CI-safe)
NoopOcrEngine                        // retourne toujours null

// mlKitOcrEngine.ts (natif, à tester physiquement) — MOTEUR PAR DÉFAUT
MlKitOcrEngine                       // Google ML Kit via expo-mlkit-ocr (import paresseux, image-based)
```

**Isolation** : l'écran `/scan/camera` dépend uniquement de l'interface `OcrEngine`
injectée via `dependencies.getDeps()`. Par défaut (`dependencies.initialize()`), le
moteur est `MlKitOcrEngine` : il capture une photo via `expo-camera`
(`takePictureAsync`) et appelle `expo-mlkit-ocr`'s `recognizeText(uri)`. L'import du
module natif est **paresseux** (dans `recognize`) : sur CI / hors Development Build il
retourne `null` sans bloquer les tests. `NoopOcrEngine` reste disponible comme repli.
<b>La reconnaissance brute se valide sur téléphone physique</b> (Development Build).

**Évolution M-12 — OCR interactif & fiabilisation (livré, US-OCR-01..08)** :
- `OcrFrameResult` transporte le texte **et** les **zones** (`blocks`→`lines`,
  niveau **ligne**, chacune avec sa `boundingBox` en pixels image d'origine) —
  mappées par `ocrResultMapper` (issue M12-02 #206) ;
- `ocrImagePreprocessor` (prétraitement éphémère : redimensionnement ≤ 2600 px +
  ré-encodage JPEG, jamais d'écriture sur stockage) branché avant `recognize`
  (issue M12-01 #205) ;
- `ocrCandidateAnalyzer` produit des **candidats par champ** avec score de
  confiance (règles métier : pages/prix/année/numéro) (issue M12-03 #207) ;
- écran `/scan/ocr-review` : photo + **liste des textes détectés** cliquables
  (choix validé sur device à la place de l'overlay tap-image, M12-05/06) ;
- intégration des valeurs validées à `identificationService.searchByOcrFields`
  (issue M12-07 #211).

**Qualité lecture (M10R2-09, US-UX-21)** — textes stylisés / encres faibles :
- Capture **haute résolution** (`takePictureAsync({ quality: 1, skipProcessing: false })`)
  dans `camera.tsx` pour préserver les petites encres des titres dessinés ;
- **Vote multi-frames** : seules `OCR_STABLE_READS = 2` lectures concordantes
  (`publication|numéro|date`) concluent l'identification (`OcrTextStabilizer`),
  à l'image du `BarcodeStabilizer` (M-04R) ; une lecture isolée reste en analyse ;
- Extraction du numéro : priorité au préfixe « N° / No / numéro », exclusions
  renforcées (année `19xx/20xx`, nombre de pages, prix, date complète) ; en cas de
  multiples « N° », le plus proche du titre reconnu est retenu ;
- Le **repli code-barres** en confiance faible (M-05) et la règle nom + numéro
  (`isConfident`, US-ID-08) sont inchangés.

#### Couche métier collection — `store/useCollectionStore.ts`
La logique de collection (ancien `collectionService.ts`) vit dans le store Zustand,
synchronisé avec SQLite via les repositories :

```ts
load(): Promise<void>
loadSummary(): Promise<void>       // accueil léger : COUNT(*) + 5 récents
loadDetail(id): Promise<MagazineDetail | null>
addMagazine(input): Promise<MagazineListItem | null>
addExistingCopy(magazineId): Promise<void>
updateMagazine(id, input): Promise<void>
removeMagazine(id): Promise<void>
```

#### `backup` (export / import) — `backup-service.ts` (`BackupService`)
```ts
exportCollection(): Promise<BackupFile>        // JSON + CSV
toJson(file): string
toCsv(file): string
validateCollection(raw, format = 'json'): Promise<ImportSummary>
importCollection(raw, format = 'json'): Promise<ImportSummary>
```

- `backup-format.ts` : types des formats JSON / CSV ;
- `file-gateway.ts` : sélection / lecture / écriture de fichiers (via `expo-document-picker` + `expo-sharing`), injectable pour les tests.

### 5.3 Stores Zustand

Un store par domaine, comme décrit dans `03-TECHNICAL-SPEC.md`.

---

## 6. Flux de données

### 6.1 Lecture d'une liste
```
Écran Collection
   ↓ (subscribe)
useCollectionStore.magazines
   ↓
   (la liste est chargée une fois au démarrage et mise en cache)
```

### 6.2 Écriture (ajout d'un magazine)
```
Écran → useCollectionStore.addMagazine() / addExistingCopy()
   ↓
magazine-repository / collection-repository (SQL)
   ↓
   mise à jour du store → re-render
```

### 6.3 Identification par code-barres
```
Écran Barcode → scanBarcode (caméra)
   ↓  code détecté
identificationService.identifyByBarcode(code)
   ↓
magazine-repository.findManyByBarcode(code)   // liste des éditions partageant ce code
   ↓
found (1)     → Navigation vers result.tsx
ambiguous (>1) → Navigation vers multiple.tsx (compte + liste cliquable)
unknown       → Navigation vers result.tsx (Absent)
```

### 6.4 Identification par OCR
```
Écran /scan/camera → intervalle d'analyse (photo capturée via takePictureAsync)
   ↓
cameraRef.takePictureAsync() → uri       // photo éphémère, aucune image persistée
   ↓
ocrEngine.recognize({ native: uri })     // OcrEngine par défaut = MlKitOcrEngine (expo-mlkit-ocr)
   ↓  { text }
identificationService.identifyByOCR(text)
   ↓  parseOcrText → publication / issueNumber / date + confiance
found   → afiche la couverture reconnue + [Confirmer → /collection/[id]]
weak    → "Confiance insuffisante" + [Réessayer] [Saisie manuelle]
unknown → "Non trouvé" + [Saisie manuelle] [Réessayer]
no-text → on continue d'analyser
```

---

## 7. Injection de dépendances

Pour faciliter les tests, les repositories et services sont **injetés** plutôt qu'instanciés globalement. Approche légère : un module `dependencies.ts` exporte les singletons, remplaçables dans les tests.

```ts
// src/dependencies.ts
export const deps = {
  magazineRepository: new MagazineRepository(getDb()),
  collectionRepository: new CollectionRepository(getDb()),
  settingsRepository: new SettingsRepository(getDb()),
  identificationService: new IdentificationService(...),
  backupService: new BackupService(getDb()),
};
```

> Les tests remplacent `deps` par des mocks/fakes (voir `12-TESTING.md`).

---

## 8. Gestion des erreurs et états

Chaque écran distingue clairement les états :

| État | Comportement |
|---|---|
| `loading` | Afficher un indicateur de chargement |
| `error` | Message clair + action de réessayer |
| `empty` | Message « aucune donnée » + action primaire |
| `data` | Affichage du contenu |

### Erreurs typiques
- Échec d'accès à la base ;
- code-barres inconnu ;
- OCR de confiance insuffisante ;
- fichier d'import invalide/incompatible ;
- permission caméra refusée.

---

## 9. Règles de nommage

- Fichiers : `camelCase` pour les modules, `PascalCase` pour les composants React ;
- Tables SQL : `snake_case` ;
- Types TS : `PascalCase`, champs en `camelCase` ;
- Mapping snake_case ↔ camelCase assuré par les repositories ;
- Constants UI : `SCREAMING_SNAKE_CASE`.

---

## Récapitulatif

| Sujet | Décision |
|---|---|
| Couches | UI → Stores → Services → Repositories → SQLite |
| Accès DB | Uniquement via repositories |
| Identification | Structure commune, indépendante de la méthode |
| Navigation | Expo Router (fichiers) |
| État | Zustand (cache UI) |
| DI | Singletons injectables (`dependencies.ts`) |
| États écrans | loading / error / empty / data |
