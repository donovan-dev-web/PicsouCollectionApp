import type { Database } from '@/database/types';
import type { Magazine, CreateMagazineInput, MagazineListItem } from '@/types';
import { generateId } from '@/utils/id';

type MagazineRow = {
  id: string;
  publication: string;
  issue_number: number | null;
  edition: string | null;
  language: string | null;
  condition: string | null;
  publication_date: string | null;
  barcode: string | null;
  notes: string | null;
  ocr_text: string | null;
  created_at: string;
  updated_at: string;
};

const DETAIL_SELECT = `
  SELECT id, publication, issue_number, edition, language, condition, publication_date,
         barcode, notes, ocr_text, created_at, updated_at
  FROM magazines`;

/** Liste légère : pas de notes ni d'ocr_text (colonnes potentiellement lourdes). */
const LIST_SELECT = `
  SELECT id, publication, issue_number, edition, language, condition, publication_date,
         barcode, created_at, updated_at
  FROM magazines`;

function toMagazine(
  row: Omit<MagazineRow, 'notes' | 'ocr_text'> & {
    notes?: string | null;
    ocr_text?: string | null;
  },
): Magazine {
  return {
    id: row.id,
    publication: row.publication,
    issueNumber: row.issue_number,
    edition: row.edition,
    language: row.language,
    condition: row.condition ?? null,
    publicationDate: row.publication_date,
    barcode: row.barcode,
    notes: row.notes ?? null,
    ocrText: row.ocr_text ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Tri stable, insensible à la casse et aux accents (collation française) :
 * le `ORDER BY` SQLite utilise la collation BINARY et `lower()` est ASCII-only.
 */
function compareByPublication(a: Magazine, b: Magazine): number {
  const byPublication = a.publication.localeCompare(b.publication, 'fr', {
    sensitivity: 'base',
  });
  if (byPublication !== 0) {
    return byPublication;
  }
  const byIssue = (a.issueNumber ?? Infinity) - (b.issueNumber ?? Infinity);
  if (byIssue !== 0) {
    return byIssue;
  }
  return a.id.localeCompare(b.id);
}

/** Normalise une chaîne : casse + accents (prétraitement en JS, SQLite est ASCII-only). */
function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase('fr')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export class MagazineRepository {
  constructor(private readonly db: Database) {}

  async findManyByBarcode(barcode: string): Promise<MagazineListItem[]> {
    const rows = await this.db.getAllAsync<MagazineRow>(
      `${DETAIL_SELECT}
       WHERE barcode = ?
       ORDER BY publication, issue_number`,
      barcode,
    );

    return rows.map(toMagazine);
  }

  /**
   * Recherche une édition par publication + numéro. Sert au rapprochement OCR
   * (M-05) : on connaît « Picsou Magazine, n° 547 » et on cherche l'édition en base.
   */
  async findByPublicationAndIssue(
    publication: string,
    issueNumber: number | null,
  ): Promise<Magazine | null> {
    const safePublication = publication.trim();
    if (!safePublication || issueNumber === null) {
      return null;
    }

    const row = await this.db.getFirstAsync<MagazineRow>(
      `${DETAIL_SELECT}
       WHERE lower(publication) = lower(?) AND issue_number = ?
       ORDER BY created_at ASC
       LIMIT 1`,
      safePublication,
      issueNumber,
    );

    return row ? toMagazine(row) : null;
  }

  async list(): Promise<MagazineListItem[]> {
    const rows = await this.db.getAllAsync<MagazineRow>(`${LIST_SELECT}`);

    return rows.map(toMagazine).sort(compareByPublication);
  }

  async search(query: string): Promise<MagazineListItem[]> {
    const term = normalizeText(query.trim());
    if (!term) {
      return this.list();
    }

    const numeric = Number(term);
    const isNumeric = Number.isFinite(numeric);

    const all = await this.list();
    return all
      .filter(
        (magazine) =>
          (isNumeric && magazine.issueNumber === numeric) ||
          normalizeText(magazine.publication).includes(term),
      )
      .sort(compareByPublication);
  }

  /** Dernières éditions ajoutées (accueil), les plus récentes d'abord. */
  async findRecent(limit = 5): Promise<MagazineListItem[]> {
    const rows = await this.db.getAllAsync<MagazineRow>(
      `${LIST_SELECT}
       ORDER BY created_at DESC, rowid DESC
       LIMIT ?`,
      limit,
    );

    return rows.map(toMagazine);
  }

  async countAll(): Promise<number> {
    const row = await this.db.getFirstAsync<{ count: number }>(
      'SELECT COUNT(*) AS count FROM magazines',
    );
    return Number(row?.count ?? 0);
  }

  async findById(id: string): Promise<Magazine | null> {
    const row = await this.db.getFirstAsync<MagazineRow>(
      `${DETAIL_SELECT}
       WHERE id = ?`,
      id,
    );

    return row ? toMagazine(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM magazines WHERE id = ?', id);
  }

  async create(input: CreateMagazineInput): Promise<Magazine> {
    const publication = input.publication.trim();
    if (!publication) {
      throw new Error('La publication est obligatoire.');
    }

    const now = new Date().toISOString();
    const magazine: Magazine = {
      id: generateId(),
      publication,
      issueNumber: input.issueNumber ?? null,
      edition: input.edition ?? null,
      language: input.language ?? null,
      condition: input.condition ?? null,
      publicationDate: input.publicationDate ?? null,
      barcode: input.barcode ?? null,
      notes: input.notes ?? null,
      ocrText: input.ocrText ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.runAsync(
      `INSERT INTO magazines
        (id, publication, issue_number, edition, language, condition, publication_date,
         barcode, notes, ocr_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      magazine.id,
      magazine.publication,
      magazine.issueNumber,
      magazine.edition,
      magazine.language,
      magazine.condition,
      magazine.publicationDate,
      magazine.barcode,
      magazine.notes,
      magazine.ocrText,
      magazine.createdAt,
      magazine.updatedAt,
    );

    return magazine;
  }

  async update(id: string, input: CreateMagazineInput): Promise<Magazine | null> {
    const current = await this.db.getFirstAsync<MagazineRow>(
      `${DETAIL_SELECT}
       WHERE id = ?`,
      id,
    );

    if (!current) {
      return null;
    }

    const publication = input.publication.trim();
    if (!publication) {
      throw new Error('La publication est obligatoire.');
    }

    const updatedAt = new Date().toISOString();
    await this.db.runAsync(
      `UPDATE magazines
       SET publication = ?, issue_number = ?, edition = ?, language = ?,
           condition = ?, publication_date = ?, barcode = ?, notes = ?,
           ocr_text = COALESCE(?, ocr_text), updated_at = ?
       WHERE id = ?`,
      publication,
      input.issueNumber ?? null,
      input.edition ?? null,
      input.language ?? null,
      input.condition ?? null,
      input.publicationDate ?? null,
      input.barcode ?? null,
      input.notes ?? null,
      input.ocrText ?? null,
      updatedAt,
      id,
    );

    return {
      ...toMagazine(current),
      publication,
      issueNumber: input.issueNumber ?? null,
      edition: input.edition ?? null,
      language: input.language ?? null,
      condition: input.condition ?? null,
      publicationDate: input.publicationDate ?? null,
      barcode: input.barcode ?? null,
      notes: input.notes ?? null,
      ocrText: input.ocrText ?? current.ocr_text,
      updatedAt,
    };
  }
}
