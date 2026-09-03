export const SCHEMA_VERSION = 4;

export const MIGRATION_001 = `
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

CREATE UNIQUE INDEX IF NOT EXISTS idx_magazines_barcode
ON magazines(barcode);

CREATE INDEX IF NOT EXISTS idx_magazines_publication_issue
ON magazines(publication, issue_number);

CREATE INDEX IF NOT EXISTS idx_collection_items_magazine_id
ON collection_items(magazine_id);
`;

export const MIGRATION_002 = `
CREATE TABLE IF NOT EXISTS settings (
    key   TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
);
`;

/**
 * v3 — Refonte de modèle (M-04R) :
 * - `country` est renommé `language` (le champ saisi désigne la langue de
 *   l'édition, pas un pays physique) ;
 * - `condition` (état) est déplacé de `collection_items` vers `magazines`
 *   (l'état caractérise l'édition, pas l'exemplaire).
 */
export const MIGRATION_003 = `
ALTER TABLE magazines ADD COLUMN language TEXT;
UPDATE magazines SET language = country;
ALTER TABLE magazines DROP COLUMN country;

ALTER TABLE magazines ADD COLUMN condition TEXT;
UPDATE magazines SET condition = (
    SELECT ci.condition FROM collection_items ci
    WHERE ci.magazine_id = magazines.id
    ORDER BY ci.date_added DESC
    LIMIT 1
);
ALTER TABLE collection_items DROP COLUMN condition;
`;

/**
 * v4 — Barcodes non uniques :
 * Le même code-barres peut correspondre à des éditions/numéros différents
 * (certains codes ne reflètent pas un numéro exact). L'index unique est donc
 * remplacé par un index simple, pour autoriser la saisie de doublons.
 */
export const MIGRATION_004 = `
DROP INDEX IF EXISTS idx_magazines_barcode;
CREATE INDEX IF NOT EXISTS idx_magazines_barcode
ON magazines(barcode);
`;
