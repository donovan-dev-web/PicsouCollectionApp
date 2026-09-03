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
│   useCollectionStore · useSettingsStore · ...        │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                     Services                         │
│   IdentificationService · CollectionService ·        │
│   BackupService                                      │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  Repositories                        │
│   magazineRepository · collectionRepository          │
└──────────────────────────┬──────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                  SQLite (expo-sqlite)                │
│              magazines · collection_items            │
└─────────────────────────────────────────────────────┘
```

L'architecture sépare clairement les responsabilités :
- **UI** : affichage et interaction ;
- **Stores** : état applicatif synchronisé avec la source de vérité ;
- **Services** : logique métier (identification, collection, sauvegarde) ;
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
├── database/
│   ├── schema.ts               # DDL + migrations
│   ├── migrations.ts           # Gestion de version de schéma
│   ├── database.ts             # Initialisation de la connexion
│   └── repositories/
│       ├── magazineRepository.ts
│       └── collectionRepository.ts
│
├── identification/
│   ├── scanBarcode.ts          # Détection / lecture code-barres
│   ├── ocr.ts                  # Reconnaissance texte + extraction
│   ├── confidence.ts           # Calcul de confiance
│   └── identificationService.ts
│
├── collection/
│   └── collectionService.ts
│
├── backup/
│   ├── format.ts               # Types du format JSON
│   ├── export.ts               # Export SQLite → JSON
│   └── import.ts               # Import JSON → SQLite
│
├── store/
│   ├── useCollectionStore.ts
│   ├── useSettingsStore.ts
│   └── useIdentificationStore.ts
│
├── components/
│   ├── ScanButton.tsx
│   ├── StatusBadge.tsx
│   ├── MagazineCard.tsx
│   └── ...                     # composants réutilisables
│
├── theme/
│   ├── colors.ts               # Palette (clair + sombre)
│   ├── typography.ts
│   └── index.ts                # Thème contextuel
│
├── types/
│   └── index.ts                # Types de domaine
│
└── utils/
    ├── id.ts                   # Génération UUID
    ├── date.ts                 # Formatage dates
    └── normalize.ts            # Normalisation texte (recherche)
```

---

## 4. Navigation (Expo Router)

Structure des écrans via `app/` (Expo Router).

```
app/
├── _layout.tsx                 # Layout racine (nav inférieure)
├── index.tsx                   # Accueil
│
├── scan/
│   ├── _layout.tsx
│   ├── index.tsx               # Choix de méthode
│   ├── barcode.tsx             # Scanner code-barres
│   ├── camera.tsx              # Caméra / OCR
│   ├── manual.tsx              # Saisie manuelle
│   └── result.tsx              # Résultat (Possédé / Absent)
│
├── collection/
│   ├── index.tsx               # Liste de la collection
│   └── [id].tsx                # Fiche magazine
│
└── settings/
    ├── index.tsx               # Paramètres
    ├── export.tsx              # Export
    └── import.tsx              # Import
```

### Racine de navigation
Le `_layout.tsx` racine déclare les écrans **Accueil**, **Ma Collection**, **Paramètres** dans la barre de navigation inférieure. Les écrans de **Scanner** et **Fiche magazine** sont présentés en modal/hors onglets pour concentrer l'attention.

---

## 5. Les couches logicielles

### 5.1 Repositories

#### `magazineRepository.ts`
Opérations sur les éditions :

```ts
findByBarcode(barcode): Promise<Magazine | null>
findManyByBarcode(barcode): Promise<MagazineListItem[]>
findByPublicationAndIssue(publication, issueNumber): Promise<Magazine | null>
findById(id): Promise<MagazineDetail | null>
list(): Promise<MagazineListItem[]>
search(query): Promise<MagazineListItem[]>
create(input: CreateMagazineInput): Promise<Magazine>
update(id, input): Promise<Magazine>
delete(id): Promise<void>
```

#### `collectionRepository.ts`
Opérations sur les exemplaires :

```ts
countByMagazine(magazineId): Promise<number>
listByMagazine(magazineId): Promise<CollectionItem[]>
addCopy(magazineId, input): Promise<CollectionItem>
deleteCopy(id): Promise<void>
```

### 5.2 Services

#### `identificationService.ts`
```ts
identifyByBarcode(barcode): Promise<BarcodeLookupResult>
// found (1 édition) / ambiguous (plusieurs pour le même code) / unknown / invalid
identifyByOCR(text): Promise<OcrLookupResult>
// found / weak (confiance insuffisante) / unknown / no-text
identifyManually(data): Promise<MagazineIdentification>
```

#### `ocr/` — moteur OCR (M-05, US-ID-03)
```ts
// ocrTypes.ts
interface OcrEngine { recognize(frame): Promise<OcrFrameResult> }  // OcrFrameResult = { text } | null

// ocrTextParser.ts  (pur, testable)
parseOcrText(raw): OcrParseResult      // publication, issueNumber, date, confidence (0..1)
isConfident(parse): boolean            // seuil MIN_CONFIDENCE

// ocrEngine.ts      (défaut CI-safe)
NoopOcrEngine                        // retourne toujours null (ne bloque pas la CI)

// mlKitOcrEngine.ts (natif, à tester physiquement)
MlKitOcrEngine                       // Google ML Kit Text Recognition, chargement paresseux
```

**Isolation** : l'écran `/scan/camera` dépend uniquement de l'interface `OcrEngine`
injectée via `dependencies.getDeps()`. Le moteur par défaut est `NoopOcrEngine` ;
l'implémentation native (`MlKitOcrEngine`) est **isolée** et doit être **activée dans
`initialize()`** après validation sur Development Build — elle ne bloque pas la CI.

#### `collectionService.ts`
```ts
checkPossession(magazineId): Promise<{ owned: boolean; quantity: number }>
addCopy(magazineId): Promise<void>
```

#### `backup` (export/import)
```ts
// export.ts
exportCollection(): Promise<BackupFile>

// import.ts
importCollection(file): Promise<ImportResult>
validateAndRead(file): Promise<BackupFile>
```

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
Écran → CollectionService.addCopy()
   ↓
magazineRepository / collectionRepository (SQL)
   ↓
   mise à jour du store → re-render
```

### 6.3 Identification par code-barres
```
Écran Barcode → scanBarcode (caméra)
   ↓  code détecté
identificationService.identifyByBarcode(code)
   ↓
magazineRepository.findManyByBarcode(code)   // liste des éditions partageant ce code
   ↓
found (1)     → Navigation vers result.tsx
ambiguous (>1) → Navigation vers multiple.tsx (compte + liste cliquable)
unknown       → Navigation vers result.tsx (Absent)
```

### 6.4 Identification par OCR
```
Écran /scan/camera → intervalle d'analyse (ou 3 frames/s max)
   ↓
ocrEngine.recognize(frame)            // OcrEngine injecté (NoopEngine par défaut, ML Kit sur device)
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
  identificationService: new IdentificationService(...),
  collectionService: new CollectionService(...),
  backupService: new BackupService(...),
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
