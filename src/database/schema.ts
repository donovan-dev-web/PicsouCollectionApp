export const SCHEMA_VERSION = 1;

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
