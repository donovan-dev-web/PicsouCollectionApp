import type { Database } from '@/database/types';
import { APP_VERSION } from '@/utils/app-version';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupCopy,
  type BackupFile,
  type BackupMagazine,
  type ImportSummary,
} from './backup-types';

/**
 * Erreur de validation d'un fichier d'import (US-BK-03).
 * L'import est rejeté sans aucune modification des données.
 */
export class InvalidBackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBackupError';
  }
}

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

function asNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'string') {
    throw new InvalidBackupError('Fichier invalide : certaines valeurs de texte sont mal formées.');
  }
  return value;
}

function asNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new InvalidBackupError(
      'Fichier invalide : certaines valeurs numériques sont mal formées.',
    );
  }
  return value;
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidBackupError(`Fichier invalide : le champ « ${field} » est manquant ou vide.`);
  }
  return value;
}

function parseBackupFile(raw: unknown): BackupFile {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new InvalidBackupError(
      'Fichier invalide : la structure racine doit être un objet de sauvegarde.',
    );
  }

  const root = raw as Record<string, unknown>;

  if (root['format'] !== BACKUP_FORMAT) {
    throw new InvalidBackupError('Fichier invalide : ce n’est pas un export de PicsouCollection.');
  }

  if (root['version'] !== BACKUP_VERSION) {
    throw new InvalidBackupError(
      `Fichier invalide : version non prise en charge (attendu : ${BACKUP_VERSION}).`,
    );
  }

  if (!Array.isArray(root['magazines'])) {
    throw new InvalidBackupError('Fichier invalide : la liste des éditions est absente.');
  }

  const magazines: BackupMagazine[] = [];
  for (const entry of root['magazines']) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new InvalidBackupError('Fichier invalide : une édition est mal formée.');
    }

    const magazine = entry as Record<string, unknown>;

    const id = asNonEmptyString(magazine['id'], 'identifiant d’édition');

    if (!Array.isArray(magazine['copies'])) {
      throw new InvalidBackupError('Fichier invalide : la liste des exemplaires est absente.');
    }

    const copies: BackupCopy[] = [];
    for (const copyEntry of magazine['copies']) {
      if (typeof copyEntry !== 'object' || copyEntry === null || Array.isArray(copyEntry)) {
        throw new InvalidBackupError('Fichier invalide : un exemplaire est mal formé.');
      }
      const copy = copyEntry as Record<string, unknown>;
      copies.push({
        id: asNonEmptyString(copy['id'], 'identifiant d’exemplaire'),
        notes: asNullableString(copy['notes']),
        dateAdded: asNullableString(copy['dateAdded']) ?? '',
      });
    }

    magazines.push({
      id,
      publication: asNonEmptyString(magazine['publication'], 'publication'),
      issueNumber: asNullableNumber(magazine['issueNumber']),
      edition: asNullableString(magazine['edition']),
      language: asNullableString(magazine['language']),
      condition: asNullableString(magazine['condition']),
      publicationDate: asNullableString(magazine['publicationDate']),
      barcode: asNullableString(magazine['barcode']),
      notes: asNullableString(magazine['notes']),
      ocrText: asNullableString(magazine['ocrText']),
      copies,
    });
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: asNullableString(root['exportedAt']) ?? new Date().toISOString(),
    appVersion: asNullableString(root['appVersion']) ?? APP_VERSION,
    magazines,
  };
}

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

    const copiesByMagazine = new Map<string, BackupCopy[]>();
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

  /**
   * Valide uniquement le contenu d'un fichier, sans modifier les données.
   * Utilisé pour afficher un récapitulatif et demander confirmation **avant**
   * le remplacement (§14.4). Rejette via {@link InvalidBackupError} (US-BK-03).
   */
  async validateCollection(raw: string): Promise<ImportSummary> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InvalidBackupError('Fichier invalide : le contenu n’est pas un JSON lisible.');
    }

    const file = parseBackupFile(parsed);
    return {
      magazines: file.magazines.length,
      copies: file.magazines.reduce((total, magazine) => total + magazine.copies.length, 0),
    };
  }

  /**
   * Importe une sauvegarde JSON en remplaçant la collection existante.
   * Toute erreur de validation ou d'écriture → transaction annulée, données
   * intactes (stratégie « remplacement complet », cf. fonctionnelle §13.3).
   */
  async importCollection(raw: string): Promise<ImportSummary> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InvalidBackupError('Fichier invalide : le contenu n’est pas un JSON lisible.');
    }

    const file = parseBackupFile(parsed);

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
