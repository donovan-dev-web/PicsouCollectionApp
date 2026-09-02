import type { Database } from '@/database/types';
import type {
  Magazine,
  CollectionItem,
  CreateMagazineInput,
  MagazineDetail,
  MagazineListItem,
} from '@/types';
import { generateId } from '@/utils/id';

type MagazineRow = {
  id: string;
  publication: string;
  issue_number: number | null;
  edition: string | null;
  country: string | null;
  publication_date: string | null;
  barcode: string | null;
  notes: string | null;
  ocr_text: string | null;
  created_at: string;
  updated_at: string;
};

const LIST_SELECT = `
  SELECT m.id, m.publication, m.issue_number, m.edition, m.country,
         m.publication_date, m.barcode, m.created_at, m.updated_at,
         COUNT(c.id) AS quantity
  FROM magazines m
  LEFT JOIN collection_items c ON c.magazine_id = m.id`;

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
    country: row.country,
    publicationDate: row.publication_date,
    barcode: row.barcode,
    notes: row.notes ?? null,
    ocrText: row.ocr_text ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class MagazineRepository {
  constructor(private readonly db: Database) {}

  async findByBarcode(barcode: string): Promise<Magazine | null> {
    const row = await this.db.getFirstAsync<MagazineRow>(
      `SELECT id, publication, issue_number, edition, country, publication_date,
              barcode, created_at, updated_at
       FROM magazines
       WHERE barcode = ?`,
      barcode,
    );

    return row ? toMagazine(row) : null;
  }

  async list(): Promise<MagazineListItem[]> {
    const rows = await this.db.getAllAsync<
      Omit<MagazineRow, 'notes' | 'ocr_text'> & { quantity: number }
    >(
      `${LIST_SELECT}
       GROUP BY m.id
       ORDER BY m.publication, m.issue_number`,
    );

    return rows.map((row) => ({ ...toMagazine(row), quantity: row.quantity }));
  }

  async search(query: string): Promise<MagazineListItem[]> {
    const term = query.trim();
    if (!term) {
      return this.list();
    }

    const numeric = Number(term);
    const isNumeric = Number.isFinite(numeric);

    const rows = await this.db.getAllAsync<
      Omit<MagazineRow, 'notes' | 'ocr_text'> & { quantity: number }
    >(
      `${LIST_SELECT}
       WHERE m.publication LIKE '%' || ? || '%'
          OR (? = 1 AND m.issue_number = ?)
       GROUP BY m.id
       ORDER BY m.publication, m.issue_number`,
      term,
      isNumeric ? 1 : 0,
      isNumeric ? numeric : 0,
    );

    return rows.map((row) => ({ ...toMagazine(row), quantity: row.quantity }));
  }

  async findById(id: string): Promise<MagazineDetail | null> {
    const row = await this.db.getFirstAsync<MagazineRow>(
      `SELECT id, publication, issue_number, edition, country, publication_date,
              barcode, notes, ocr_text, created_at, updated_at
       FROM magazines
       WHERE id = ?`,
      id,
    );

    if (!row) {
      return null;
    }

    const copyRows = await this.db.getAllAsync<{
      id: string;
      magazine_id: string;
      condition: string | null;
      notes: string | null;
      date_added: string;
    }>(
      `SELECT id, magazine_id, condition, notes, date_added
       FROM collection_items
       WHERE magazine_id = ?
       ORDER BY date_added DESC`,
      id,
    );

    const copies: CollectionItem[] = copyRows.map((r) => ({
      id: r.id,
      magazineId: r.magazine_id,
      condition: r.condition,
      notes: r.notes,
      dateAdded: r.date_added,
    }));

    return { ...toMagazine(row), copies };
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
      country: input.country ?? null,
      publicationDate: input.publicationDate ?? null,
      barcode: input.barcode ?? null,
      notes: input.notes ?? null,
      ocrText: input.ocrText ?? null,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.runAsync(
      `INSERT INTO magazines
        (id, publication, issue_number, edition, country, publication_date,
         barcode, notes, ocr_text, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      magazine.id,
      magazine.publication,
      magazine.issueNumber,
      magazine.edition,
      magazine.country,
      magazine.publicationDate,
      magazine.barcode,
      magazine.notes,
      magazine.ocrText,
      magazine.createdAt,
      magazine.updatedAt,
    );

    return magazine;
  }
}
