# 🦆 Picsou Collection — Modèle de données

> **Document de référence — v1.0**
>
> Ce document décrit le modèle de données logique : les entités persistées, leurs attributs, les types TypeScript associés et les requêtes principales. Le DDL SQL complet figure dans `07-DATABASE-SCHEMA.md`.

---

## Table des matières

1. [Décision d'architecture](#1-décision-darchitecture)
2. [Rationalisation du schéma initial](#2-rationalisation-du-schéma-initial)
3. [Entités persistées](#3-entités-persistées)
4. [Types TypeScript](#4-types-typescript)
5. [Requêtes principales](#5-requêtes-principales)
6. [Format d'export JSON v1](#6-format-dexport-json-v1) (CSV v1 en 6.1)
7. [Index et performance](#7-index-et-performance)
8. [Récapitulatif](#8-récapitulatif)

---

## 1. Décision d'architecture

> **SQLite via `expo-sqlite`, avec un schéma simple et orienté document.**

Le MVP utilise **deux tables** :

- `magazines` — l'édition (entité centrale) ;
- `collection_items` — les exemplaires physiques possédés.

Contrairement à la version 0.2 qui prévoyait quatre tables (`magazines`, `magazine_barcodes`, `magazine_details`, `collection_items`), le schéma a été **rationalisé** pour un projet personnel de volume modéré (moins de ~5 000 magazines).

Nous n'utilisons **pas** :
- AsyncStorage comme base principale ;
- MMKV comme base principale ;
- Realm ;
- WatermelonDB ;
- serveur externalisé ;
- base NoSQL externe.

---

## 2. Rationalisation du schéma initial

### 2.1 Suppression de `magazine_details`
Les champs `metadata`, `notes`, `ocr_text` étaient séparés dans une table dédiée. Pour un volume réduit, cette séparation est **contre-productive** :

- elle complique les requêtes (jointure systématique pour la fiche) ;
- les métadonnées JSON libres apportent peu pour des champs simples et stables ;
- SQLite reste très performant même sans cette optimisation dans ces volumes.

**Décision :** les champs réellement utiles deviennent des **colonnes simples** de `magazines` (`notes`, `ocr_text`). Le champ `metadata` JSON générique est abandonné faute de besoin concret.

### 2.2 Simplification de `magazine_barcodes`
La séparation des codes-barres dans une table dédiée (1:N) n'est **pas nécessaire dans le MVP** : une édition a au plus un code-barres dans la quasi-totalité des cas réels.

**Décision :** le code-barres devient un **attribut `barcode`** de la table `magazines`, avec un index simple (non unique) pour autoriser les doublons (un même code peut correspondre à plusieurs numéros/éditions).

> **Évolution possible :** si un besoin réel de plusieurs codes-barres par édition apparaît, une migration vers une table `magazine_barcodes` (1:N) pourra être réalisée. Le format d'export JSON a volontairement été conçu pour supporter cette évolution (champ `barcodes` sous forme de tableau).

---

## 3. Entités persistées

### 3.1 `magazines` — l'édition

Identifie et décrit une édition précise d'un magazine.

| Colonne | Type SQL | Type TS | Obligatoire | Description |
|---|---|---|---|---|
| `id` | TEXT | `string` | ✅ | Identifiant interne (UUID) |
| `publication` | TEXT | `string` | ✅ | Nom de la série |
| `issue_number` | INTEGER | `number \| null` | ❌ | Numéro (peut être null pour hors-séries) |
| `edition` | TEXT | `string \| null` | ❌ | Édition |
| `language` | TEXT | `string \| null` | ❌ | Langue de l'édition (ex. "FR") |
| `condition` | TEXT | `string \| null` | ❌ | État de l'édition (ex. "neuf", "usé") |
| `publication_date` | TEXT | `string \| null` | ❌ | Date ISO (ex. "2023-03") |
| `barcode` | TEXT | `string \| null` | ❌ | Code-barres (EAN-13 / ISBN), index non unique (doublons permis) |
| `notes` | TEXT | `string \| null` | ❌ | Notes sur l'édition |
| `ocr_text` | TEXT | `string \| null` | ❌ | Texte brut OCR éphémère conservé en aide |
| `created_at` | TEXT | `string` | ✅ | Timestamp ISO 8601 |
| `updated_at` | TEXT | `string` | ✅ | Timestamp ISO 8601 |

### 3.2 `collection_items` — l'exemplaire

Un exemplaire physique réellement possédé d'une édition.

| Colonne | Type SQL | Type TS | Obligatoire | Description |
|---|---|---|---|---|
| `id` | TEXT | `string` | ✅ | Identifiant unique (UUID) |
| `magazine_id` | TEXT | `string` | ✅ | Référence vers `magazines.id` |
| `notes` | TEXT | `string \| null` | ❌ | Notes personnelles de l'exemplaire |
| `date_added` | TEXT | `string` | ✅ | Timestamp ISO 8601 d'ajout |

---

## 4. Types TypeScript

```ts
// ===== Édition (table magazines) =====

type Magazine = {
  id: string;
  publication: string;
  issueNumber: number | null;
  edition: string | null;
  language: string | null;
  condition: string | null;
  publicationDate: string | null;
  barcode: string | null;
  notes: string | null;
  ocrText: string | null;
  createdAt: string;
  updatedAt: string;
};

// Objet retourné par les requêtes de liste légère (avec comptage)
type MagazineListItem = Magazine & {
  quantity: number; // nombre d'exemplaires possédés
};

// ===== Exemplaire (table collection_items) =====

type CollectionItem = {
  id: string;
  magazineId: string;
  notes: string | null;
  dateAdded: string;
};

// ===== Identification =====

type MagazineIdentification = {
  publication: string;
  issueNumber?: number | null;
  edition?: string | null;
  language?: string | null;
  publicationDate?: string | null;
  barcode?: string | null;
  confidence: number; // 0..1
};

// ===== Fiche complète (magazine + exemplaires) =====

type MagazineDetail = Magazine & {
  copies: CollectionItem[];
};
```

> Les noms TypeScript utilisent le **camelCase** (mapping explicite depuis le snake_case SQL). Ce mapping est défini dans les repositories (voir `05-ARCHITECTURE.md`).

---

## 5. Requêtes principales

### 5.1 Recherche par code-barres (scan)

```sql
SELECT id, publication, issue_number, edition, language, condition, publication_date, barcode
FROM magazines
WHERE barcode = ?;
```

Résultat : l'édition associée au code-barres, ou aucune ligne si `code-barres inconnu`.

### 5.2 Vérification de présence dans la collection

```sql
SELECT COUNT(*) AS quantity
FROM collection_items
WHERE magazine_id = ?;
```

| `quantity` | Interprétation |
|---|---|
| `0` | 🟢 Absent |
| `> 0` | 🔴 Possédé (afficher le nombre exact) |

### 5.3 Liste légère de la collection

```sql
SELECT
    m.id,
    m.publication,
    m.issue_number,
    m.edition,
    m.language,
    m.condition,
    m.publication_date,
    m.barcode,
    COUNT(c.id) AS quantity
FROM magazines m
LEFT JOIN collection_items c ON c.magazine_id = m.id
GROUP BY m.id
ORDER BY m.publication, m.issue_number;
```

Ne charge **pas** `notes` / `ocr_text` pour rester léger.

### 5.4 Fiche détaillée

```sql
-- 1. Édition complète
SELECT * FROM magazines WHERE id = ?;

-- 2. Exemplaires
SELECT * FROM collection_items WHERE magazine_id = ? ORDER BY date_added DESC;
```

Les deux requêtes peuvent être exécutées de manière indépendante par le repository.

### 5.5 Recherche textuelle (collection)

```sql
SELECT id, publication, issue_number, edition, language, condition, publication_date, barcode
FROM magazines
WHERE publication LIKE ? OR CAST(issue_number AS TEXT) LIKE ?
ORDER BY publication, issue_number;
```

---

## 6. Format d'export JSON v1

Le format d'export est **indépendant** de l'implémentation SQLite. Il est conçu pour être :
- lisible par un humain ;
- portable (échange, archivage) ;
- évolutif (versionnage).

### Exemple complet

```json
{
  "format": "picsou-collection",
  "version": 1,
  "exportedAt": "2026-08-30T14:30:00Z",
  "appVersion": "0.1.0",

  "magazines": [
    {
      "id": "3f2b4e5a-...",
      "publication": "Picsou Magazine",
      "issueNumber": 547,
      "edition": "standard",
      "language": "FR",
      "condition": "good",
      "publicationDate": "2023-03",
      "barcode": "3271234567890",
      "notes": null,
      "ocrText": null,

      "copies": [
        {
          "id": "9c1d2e3f-...",
          "notes": "Acheté 0,50 € en brocante à Lille",
          "dateAdded": "2026-08-30T14:30:00Z"
        }
      ]
    }
  ]
}
```

### Règles du format v1

- `format` doit être `"picsou-collection"` ;
- `version` est un entier, actuellement `1` ;
- `exportedAt` : timestamp ISO 8601 de l'export ;
- `appVersion` : version de l'application qui a produit l'export ;
- `magazines[]` : liste des éditions, chacune avec sa liste `copies[]` ;
- Les champs nullables sont sérialisés en `null` (jamais absents de l'objet) ;
- Le numéro d'une édition sans numéro est `null`.

### Évolutivité
Le champ `version` permet des migrations futures :

```
JSON v1  →  migration  →  SQLite actuelle
```

Toute modification de structure incrémente `version` et documente la migration.

### 6.1 Export CSV v1 (livré M-07R, v0.7.1)

Un **export tabulaire** `CSV` est proposé en complément du JSON (fichier exploitable dans un tableur). Il reprend une ligne par **exemplaire** (une édition à plusieurs exemplaires apparaît sur plusieurs lignes).

**En-têtes** : `publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded`

**Exemple** :
```csv
publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded
Picsou Magazine,547,standard,FR,good,2023-03,3271234567890,,,Acheté 0,50 € en brocante à Lille,2026-08-30T14:30:00Z
```

**Règles** :
- **séparateur** : virgule (`,`), valeurs entre guillemets si besoin ;
- caractère d'échappement : `"` (doublé à l'intérieur d'une valeur) ;
- **une ligne = un exemplaire** (dénormalisation des `copies[]` JSON) ; les éditions **sans exemplaire** sont conservées via une ligne aux champs exemplaire vides ;
- **l'import CSV est validé sur la présence des en-têtes attendus** (§13.2 FONCTIONNAL-SPEC) ;
- les champs vides sont exportés vides (pas de `null`).

> Le **JSON reste le format complet** (structure, métadonnées, version) et le seul garanti pour une **restauration fidèle** ; le CSV est un format d'exploitation/échange.

---

## 7. Index et performance

### 7.1 Index requis

| Table | Index | Type | Rôle |
|---|---|---|---|
| `magazines` | `barcode` | normal (non unique) | Recherche scan immédiate ; doublons permis |
| `magazines` | `(publication, issue_number)` | normal | Tri et recherche collection |
| `collection_items` | `magazine_id` | normal | Jointure et comptage |

### 7.2 Stratégie

Les champs fréquemment recherchés restent des colonnes indexées. Les champs lourds (`ocr_text`) ne sont jamais chargés dans les requêtes de liste ou de scan.

Pour une collection de quelques milliers de magazines, SQLite reste très performant. Les index visent donc la **simplicité et la cohérence** plutôt qu'une optimisation agressive.

---

## 8. Récapitulatif

| Sujet | Décision |
|---|---|
| Moteur | SQLite (`expo-sqlite`) |
| Tables | `magazines`, `collection_items` |
| Schéma | Simple et orienté document |
| `magazine_details` | Supprimée (champs inlines dans `magazines`) |
| `magazine_barcodes` | Simplifiée en colonne `barcode` (non unique) |
| Code-barres | EAN-13 / ISBN, index non unique (doublons permis) |
| Export JSON | Format `picsou-collection` v1 |
| Export CSV | v1 (livré M-07R) — une ligne = un exemplaire |
| TypeScript | camelCase, mapping explicit dans les repositories |
| Index | barcode (non unique), (publication, issue_number), collection_items.magazine_id |
