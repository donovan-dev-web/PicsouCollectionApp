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
| Version du schéma | `4` |
| Tables | `magazines`, `collection_items`, `settings` |

---

## 2. Table `magazines`

```sql
CREATE TABLE IF NOT EXISTS magazines (
    id               TEXT PRIMARY KEY NOT NULL,
    publication      TEXT NOT NULL,
    issue_number     INTEGER,
    edition          TEXT,
    language         TEXT,
    condition        TEXT,
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
- **`language`** : langue de l'édition ou valeur normalisée (ex. `FR`) ;
- **`condition`** : état de l'édition (ex. `neuf`, `usé`) ;
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
- **`notes`** : notes personnelles de l'exemplaire ;
- **`date_added`** : timestamp ISO 8601 d'ajout ;
- `ON DELETE CASCADE` : supprimer une édition supprime ses exemplaires ;
- Une ligne = un exemplaire physique. Le nombre d'exemplaires = nombre de lignes.
- L'état (`condition`) caractérise désormais l'**édition** (`magazines`), plus l'exemplaire. Il a été migré en v3. La valeur retenue est celle de l'exemplaire le plus récent selon `date_added`.

---

## 4. Index

```sql
-- Recherche code-barres immédiate (scan) — index simple, non unique
CREATE INDEX IF NOT EXISTS idx_magazines_barcode
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
| `idx_magazines_barcode` | normal | Recherche par scan instantanée. **Non unique** : certains codes-barres ne reflètent pas un numéro exact et peuvent correspondre à plusieurs éditions/numéros (depuis v4) |
| `idx_magazines_publication_issue` | normal | Tri et regroupement de la collection par publication puis numéro |
| `idx_collection_items_magazine_id` | normal | Jointure `LEFT JOIN` et comptage des exemplaires |

---

## 5. Migrations

Le schéma est géré via un mécanisme de **version incrémentale**. Chaque migration est un script appliqué dans l'ordre.

### Migration `001_initial.sql`

```sql
-- Création initiale (schéma v1)
CREATE TABLE IF NOT EXISTS magazines ( /* ... y compris country ... */ );
CREATE TABLE IF NOT EXISTS collection_items ( /* ... y compris condition ... */ );

CREATE UNIQUE INDEX IF NOT EXISTS idx_magazines_barcode ON magazines(barcode);
CREATE INDEX IF NOT EXISTS idx_magazines_publication_issue ON magazines(publication, issue_number);
CREATE INDEX IF NOT EXISTS idx_collection_items_magazine_id ON collection_items(magazine_id);

PRAGMA user_version = 1;
```

### Migration `002_settings.sql`

```sql
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);
```

### Migration `003_modele.sql` (renommage + optimisation du modèle)

```sql
-- v2 → v3 : `country` devient `language`
ALTER TABLE magazines ADD COLUMN language TEXT;
UPDATE magazines SET language = country;
ALTER TABLE magazines DROP COLUMN country;

-- v2 → v3 : `condition` migre de l'exemplaire vers l'édition
ALTER TABLE magazines ADD COLUMN condition TEXT;
UPDATE magazines SET condition = (
    SELECT ci.condition FROM collection_items ci
    WHERE ci.magazine_id = magazines.id
    ORDER BY ci.date_added DESC
    LIMIT 1
);
ALTER TABLE collection_items DROP COLUMN condition;
```

### Migration `004_barcode_non_unique.sql` (barcodes multiples)

```sql
-- v3 → v4 : le code-barres n'est plus unique
-- (un même code peut correspondre à des numéros/éditions différents)
DROP INDEX IF EXISTS idx_magazines_barcode;
CREATE INDEX IF NOT EXISTS idx_magazines_barcode
ON magazines(barcode);
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
INSERT INTO magazines (id, publication, issue_number, edition, language, condition,
                       publication_date, barcode, notes, ocr_text, created_at, updated_at)
VALUES ('3f2b4e5a-1111-2222-3333-444455556666',
        'Picsou Magazine', 547, 'standard', 'FR', 'good',
        '2023-03', '3271234567890', NULL, NULL,
        '2026-08-30T14:30:00Z', '2026-08-30T14:30:00Z');

INSERT INTO collection_items (id, magazine_id, notes, date_added)
VALUES ('9c1d2e3f-aaaa-bbbb-cccc-ddddeeeeffff',
        '3f2b4e5a-1111-2222-3333-444455556666',
        'Acheté 0,50 € en brocante à Lille',
        '2026-08-30T14:30:00Z');
```

### Édition sans code-barres (ancien magazine)

```sql
INSERT INTO magazines (id, publication, issue_number, edition, language, condition,
                       publication_date, barcode, notes, ocr_text, created_at, updated_at)
VALUES ('7a1b2c3d-0000-1111-2222-333344445555',
        'Super Picsou Géant', 30, 'standard', 'FR', NULL,
        '1987-05', NULL, 'Sans code-barres', NULL,
        '2026-09-01T09:00:00Z', '2026-09-01T09:00:00Z');
```

---

## Récapitulatif

| Élément | Valeur |
|---|---|
| Version du schéma | `4` |
| Tables | `magazines`, `collection_items`, `settings` |
| Index | `idx_magazines_barcode`, `idx_magazines_publication_issue`, `idx_collection_items_magazine_id` |
| Version stockée dans | `PRAGMA user_version` |
| Migrations | `001_initial.sql`, `002_settings.sql`, `003_modele.sql`, `004_barcode_non_unique.sql` |
