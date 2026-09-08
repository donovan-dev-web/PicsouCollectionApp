import type { Database } from '@/database/types';
import { APP_VERSION } from '@/utils/app-version';
import { parseJsonBackup } from './backup-parsers';
import { parseCsvBackup, toCsv as toCsvFn } from './backup-csv';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupFile,
  type BackupFormat,
  type BackupMagazine,
  type ImportSummary,
} from './backup-types';

export { InvalidBackupError } from './backup-parsers';
export { BACKUP_CSV_HEADERS, escapeCsvField, parseCsv, toCsv } from './backup-csv';

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

type CopyRow = {
  id: string;
  magazine_id: string;
  notes: string | null;
  date_added: string;
};

export class BackupService {
  constructor(private readonly db: Database) {}

  async exportCollection(): Promise<BackupFile> {
    const magazineRows = await this.db.getAllAsync<MagazineRow>(
      `SELECT id, publication, issue_number, edition, language, condition,
              publication_date, barcode, notes, ocr_text, created_at, updated_at
       FROM magazines
       ORDER BY publication, issue_number`,
    );

    const copyRows = await this.db.getAllAsync<CopyRow>(
      `SELECT id, magazine_id, notes, date_added
       FROM collection_items
       ORDER BY date_added, id`,
    );

    const copiesByMagazine = new Map<
      string,
      { id: string; notes: string | null; dateAdded: string }[]
    >();
    for (const row of copyRows) {
      const copies = copiesByMagazine.get(row.magazine_id) ?? [];
      copies.push({
        id: row.id,
        notes: row.notes,
        dateAdded: row.date_added,
      });
      copiesByMagazine.set(row.magazine_id, copies);
    }

    const magazines: BackupMagazine[] = magazineRows.map((row) => ({
      id: row.id,
      publication: row.publication,
      issueNumber: row.issue_number,
      edition: row.edition,
      language: row.language,
      condition: row.condition,
      publicationDate: row.publication_date,
      barcode: row.barcode,
      notes: row.notes,
      ocrText: row.ocr_text,
      copies: copiesByMagazine.get(row.id) ?? [],
    }));

    return {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      appVersion: APP_VERSION,
      magazines,
    };
  }

  toJson(file: BackupFile): string {
    return JSON.stringify(file, null, 2);
  }

  toCsv(file: BackupFile): string {
    return toCsvFn(file);
  }

  private parseBackupRaw(raw: string, format: BackupFormat): BackupFile {
    if (format === 'csv') {
      return parseCsvBackup(raw);
    }
    return parseJsonBackup(raw);
  }

  async validateCollection(raw: string, format: BackupFormat = 'json'): Promise<ImportSummary> {
    const file = this.parseBackupRaw(raw, format);
    return {
      magazines: file.magazines.length,
      copies: file.magazines.reduce((total, magazine) => total + magazine.copies.length, 0),
    };
  }

  async importCollection(raw: string, format: BackupFormat = 'json'): Promise<ImportSummary> {
    const file = this.parseBackupRaw(raw, format);

    await this.db.execAsync('BEGIN');
    try {
      await this.db.execAsync('DELETE FROM collection_items');
      await this.db.execAsync('DELETE FROM magazines');

      for (const magazine of file.magazines) {
        await this.db.runAsync(
          `INSERT INTO magazines
             (id, publication, issue_number, edition, language, condition,
              publication_date, barcode, notes, ocr_text, created_at, updated_at)
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
          new Date().toISOString(),
          new Date().toISOString(),
        );

        for (const copy of magazine.copies) {
          await this.db.runAsync(
            `INSERT INTO collection_items (id, magazine_id, notes, date_added)
             VALUES (?, ?, ?, ?)`,
            copy.id,
            magazine.id,
            copy.notes,
            copy.dateAdded || new Date().toISOString(),
          );
        }
      }

      await this.db.execAsync('COMMIT');
    } catch (error) {
      try {
        await this.db.execAsync('ROLLBACK');
      } catch {
        // Ignorer l'échec du rollback : on renvoie l'erreur d'origine.
      }
      throw error;
    }

    return {
      magazines: file.magazines.length,
      copies: file.magazines.reduce((total, magazine) => total + magazine.copies.length, 0),
    };
  }
}
