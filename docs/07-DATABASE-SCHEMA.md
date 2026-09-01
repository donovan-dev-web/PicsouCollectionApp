# 🦆 Picsou Collection — Schéma SQLite

> **Document de référence — v1.0**
>
> Ce document contient le DDL SQL complet (création des tables, des index et des migrations) du schéma cible du MVP. Il complète `06-DATA-MODEL.md`.

---

## Table des matières

1. [Version officielle du schéma](#1-version-officielle-du-schéma)
2. [Table `magazines`](#2-table-magazines)
3. [Table `collection_items`](#3-table-collection_items)
4. [Index](#4-index)
5. [Migrations](#5-migrations)
6. [Gestion de la version de schéma](#6-gestion-de-la-version-de-schéma)
7. [Exemples de données](#7-exemples-de-données)

---

## 1. Version officielle du schéma

| Élément | Valeur |
|---|---|
| Version du schéma | `1` |
| Tables | `magazines`, `collection_items` |

---

## 2. Table `magazines`

```sql
CREATE TABLE IF NOT EXISTS magazines (
    id               TEXT PRIMARY KEY NOT NULL,
    publication      TEXT NOT NULL,
    issue_number     INTEGER,
    edition          TEXT,
    country          TEXT,
    publication_date TEXT,
    barcode          TEXT,
    notes            TEXT,
    ocr_text         TEXT,
    created_at       TEXT NOT NULL,
    updated_at       TEXT NOT NULL
);
```

### Contraintes et règles

- **`id`** : UUID généré par l'application, clé primaire ;
- **`publication`** : obligatoire ;
- **`issue_number`** : facultatif (certaines publications sont des hors-séries) ;
- **`edition`** : facultative ;
- **`country`** : code pays ou valeur normalisée (ex. `FR`) ;
- **`publication_date`** : texte ISO selon la précision disponible (`2023-03-01` ou `2023-03`) ;
- **`barcode`** : EAN-13 ou ISBN. Index unique (voir section Index). `NULL` autorisé (magazine sans code-barres) ;
- **`notes`** : notes libres sur l'édition ;
- **`ocr_text`** : texte brut OCR éventuellement conservé. Ne contient **jamais** d'image ;
- **`created_at` / `updated_at`** : timestamps ISO 8601.

Le numéro n'est **jamais** utilisé comme clé primaire.

---

## 3. Table `collection_items`

```sql
CREATE TABLE IF NOT EXISTS collection_items (
    id          TEXT PRIMARY KEY NOT NULL,
    magazine_id TEXT NOT NULL,
    condition   TEXT,
    notes       TEXT,
    date_added  TEXT NOT NULL,

    FOREIGN KEY (magazine_id)
        REFERENCES magazines(id)
        ON DELETE CASCADE
);
```

### Contraintes et règles

- **`id`** : UUID généré par l'application ;
- **`magazine_id`** : référence vers `magazines.id` ;
- **`condition`** : état de l'exemplaire (ex. `good`, `average`) ;
- **`notes`** : notes personnelles de l'exemplaire ;
- **`date_added`** : timestamp ISO 8601 d'ajout ;
- `ON DELETE CASCADE` : supprimer une édition supprime ses exemplaires ;
- Une ligne = un exemplaire physique. Le nombre d'exemplaires = nombre de lignes.

---

## 4. Index

```sql
-- Recherche code-barres immédiate (scan)
CREATE UNIQUE INDEX IF NOT EXISTS idx_magazines_barcode
ON magazines(barcode);

-- Tri / filtrage collection
CREATE INDEX IF NOT EXISTS idx_magazines_publication_issue
ON magazines(publication, issue_number);

-- Jointure / comptage exemplaires
CREATE INDEX IF NOT EXISTS idx_collection_items_magazine_id
ON collection_items(magazine_id);
```

### Justification

| Index | Type | Justification |
|---|---|---|
| `idx_magazines_barcode` | UNIQUE | Recherche par scan instantanée ; garantit un code-barres → max une édition. SQLite n'impose qu'une seule valeur `NULL` par colonne indexée, ce qui est accepté ici (magazines sans barcode) |
| `idx_magazines_publication_issue` | normal | Tri et regroupement de la collection par publication puis numéro |
| `idx_collection_items_magazine_id` | normal | Jointure `LEFT JOIN` et comptage des exemplaires |

---

## 5. Migrations

Le schéma est géré via un mécanisme de **version incrémentale**. Chaque migration est un script appliqué dans l'ordre.

### Migration `001_initial.sql`

```sql
-- Création initiale (schéma v1)
CREATE TABLE IF NOT EXISTS magazines ( /* ... */ );
CREATE TABLE IF NOT EXISTS collection_items ( /* ... */ );

CREATE UNIQUE INDEX IF NOT EXISTS idx_magazines_barcode ON magazines(barcode);
CREATE INDEX IF NOT EXISTS idx_magazines_publication_issue ON magazines(publication, issue_number);
CREATE INDEX IF NOT EXISTS idx_collection_items_magazine_id ON collection_items(magazine_id);

PRAGMA user_version = 1;
```

> La table de métadonnées `migrations` (facultative) peut stocker l'historique des migrations appliquées :

```sql
CREATE TABLE IF NOT EXISTS migrations (
    version   INTEGER PRIMARY KEY NOT NULL,
    applied_at TEXT NOT NULL
);
```

---

## 6. Gestion de la version de schéma

La version de schéma est stockée dans `PRAGMA user_version` (entier).

### Stratégie de migration

```
À l'initialisation de l'application :

1. Lire PRAGMA user_version
2. Si version < cible :
     a. Appliquer les migrations manquantes dans l'ordre
     b. Mettre à jour PRAGMA user_version
3. Sinon, ne rien faire
```

### Exemple TypeScript (structure du module de migration)

```ts
const MIGRATIONS: Array<{ version: number; up: (db: SQLiteDatabase) => void }> = [
  {
    version: 1,
    up: (db) => {
      db.execSync(`CREATE TABLE IF NOT EXISTS magazines ( ... )`);
      db.execSync(`CREATE TABLE IF NOT EXISTS collection_items ( ... )`);
      db.execSync(`CREATE UNIQUE INDEX IF NOT EXISTS idx_magazines_barcode ...`);
      // ...
    },
  },
  // futures migrations ici
];
```

---

## 7. Exemples de données

### Insertion d'une édition avec un exemplaire

```sql
INSERT INTO magazines (id, publication, issue_number, edition, country,
                       publication_date, barcode, notes, ocr_text, created_at, updated_at)
VALUES ('3f2b4e5a-1111-2222-3333-444455556666',
        'Picsou Magazine', 547, 'standard', 'FR',
        '2023-03', '3271234567890', NULL, NULL,
        '2026-08-30T14:30:00Z', '2026-08-30T14:30:00Z');

INSERT INTO collection_items (id, magazine_id, condition, notes, date_added)
VALUES ('9c1d2e3f-aaaa-bbbb-cccc-ddddeeeeffff',
        '3f2b4e5a-1111-2222-3333-444455556666',
        'good', 'Acheté 0,50 € en brocante à Lille',
        '2026-08-30T14:30:00Z');
```

### Édition sans code-barres (ancien magazine)

```sql
INSERT INTO magazines (id, publication, issue_number, edition, country,
                       publication_date, barcode, notes, ocr_text, created_at, updated_at)
VALUES ('7a1b2c3d-0000-1111-2222-333344445555',
        'Super Picsou Géant', 30, 'standard', 'FR',
        '1987-05', NULL, 'Sans code-barres', NULL,
        '2026-09-01T09:00:00Z', '2026-09-01T09:00:00Z');
```

---

## Récapitulatif

| Élément | Valeur |
|---|---|
| Version du schéma | `1` |
| Tables | `magazines`, `collection_items` |
| Index | `idx_magazines_barcode` (UNIQUE), `idx_magazines_publication_issue`, `idx_collection_items_magazine_id` |
| Version stockée dans | `PRAGMA user_version` |
| Migration initiale | `001_initial.sql` |
