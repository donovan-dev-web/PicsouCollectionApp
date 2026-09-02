import type { Database } from '@/database/types';
import type { Magazine, CreateMagazineInput, MagazineListItem } from '@/types';
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
      `SELECT m.id, m.publication, m.issue_number, m.edition, m.country,
              m.publication_date, m.barcode, m.created_at, m.updated_at,
              COUNT(c.id) AS quantity
       FROM magazines m
       LEFT JOIN collection_items c ON c.magazine_id = m.id
       GROUP BY m.id
       ORDER BY m.publication, m.issue_number`,
    );

    return rows.map((row) => ({ ...toMagazine(row), quantity: row.quantity }));
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
