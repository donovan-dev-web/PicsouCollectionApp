import type { Database } from '@/database/types';
import { APP_VERSION } from '@/utils/app-version';
import { generateId } from '@/utils/id';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupCopy,
  type BackupFile,
  type BackupFormat,
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

/**
 * En-têtes de l'export CSV v1 (cf. `06-DATA-MODEL.md` §6.1). Une ligne = un
 * exemplaire ; en-têtes attendus pour valider l'import (US-BK-05).
 */
export const BACKUP_CSV_HEADERS = [
  'publication',
  'issueNumber',
  'edition',
  'language',
  'condition',
  'publicationDate',
  'barcode',
  'notes',
  'ocrText',
  'copyNotes',
  'dateAdded',
] as const;

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Parseur CSV minimal : séparateur virgule, guillemets doubles, échappement
 * `""`, gestion des retours à la ligne et de la virgule entre guillemets.
 */
function parseCsv(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let index = 0;
  const text = raw.replace(/^\uFEFF/, '');
  while (index < text.length) {
    const char = text[index];
    if (inQuotes) {
      if (char === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        inQuotes = false;
        index += 1;
        continue;
      }
      field += char;
      index += 1;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      index += 1;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      index += 1;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      index += 1;
      continue;
    }
    if (char === '\r') {
      index += 1;
      continue;
    }
    field += char;
    index += 1;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

function asCsvString(value: string | undefined): string | null {
  const trimmed = (value ?? '').trim();
  return trimmed.length > 0 ? value ?? '' : null;
}

/**
 * Construit un {@link BackupFile} à partir d'un export CSV. L'import est validé
 * sur la présence des en-têtes attendus (§13.2) et rejette tout fichier
 * non conforme via {@link InvalidBackupError}, sans modifier les données.
 */
function parseCsvBackup(raw: string): BackupFile {
  const rows = parseCsv(raw);
  if (rows.length === 0) {
    throw new InvalidBackupError('Fichier invalide : le fichier CSV est vide.');
  }

  const headers = rows[0].map((header) => header.trim());
  const missing = BACKUP_CSV_HEADERS.filter((expected) => !headers.includes(expected));
  if (missing.length > 0) {
    throw new InvalidBackupError(
      `Fichier invalide : fichiers d’import CSV attendus — en-têtes manquants : ${missing.join(', ')}.`,
    );
  }

  const columnIndex = (name: string): number => headers.indexOf(name);

  const magazines: BackupMagazine[] = [];
  const byKey = new Map<string, BackupMagazine>();

  for (const values of rows.slice(1)) {
    const at = (name: string): string => values[columnIndex(name)] ?? '';
    const publication = at('publication').trim();
    if (publication.length === 0) {
      throw new InvalidBackupError(
        'Fichier invalide : une ligne du CSV ne contient pas de publication.',
      );
    }

    const issueRaw = at('issueNumber').trim();
    let issueNumber: number | null = null;
    if (issueRaw.length > 0) {
      if (!/^\d{1,6}$/.test(issueRaw)) {
        throw new InvalidBackupError(
          'Fichier invalide : le numéro d’édition doit être un entier positif.',
        );
      }
      issueNumber = Number(issueRaw);
    }

    const key = `${publication}::${issueNumber ?? ''}`;
    let magazine = byKey.get(key);
    if (!magazine) {
      magazine = {
        id: generateId(),
        publication,
        issueNumber,
        edition: asCsvString(at('edition')),
        language: asCsvString(at('language')),
        condition: asCsvString(at('condition')),
        publicationDate: asCsvString(at('publicationDate')),
        barcode: asCsvString(at('barcode')),
        notes: asCsvString(at('notes')),
        ocrText: asCsvString(at('ocrText')),
        copies: [],
      };
      byKey.set(key, magazine);
      magazines.push(magazine);
    }

    const copyNotes = at('copyNotes').trim();
    const dateAdded = at('dateAdded').trim();
    const copy: BackupCopy = {
      id: generateId(),
      notes: copyNotes.length > 0 ? copyNotes : null,
      dateAdded: dateAdded.length > 0 ? dateAdded : new Date().toISOString(),
    };
    magazine.copies.push(copy);
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
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
   * Sérialise la sauvegarde en CSV v1 (une ligne = un exemplaire, cf. §6.1).
   * Les éditions sans exemplaire sont conservées via une ligne aux champs
   * exemplaire vides.
   */
  toCsv(file: BackupFile): string {
    const header = BACKUP_CSV_HEADERS.join(',');
    const lines: string[] = [];
    for (const magazine of file.magazines) {
      const base = [
        escapeCsvField(magazine.publication),
        magazine.issueNumber === null ? '' : escapeCsvField(String(magazine.issueNumber)),
        escapeCsvField(magazine.edition ?? ''),
        escapeCsvField(magazine.language ?? ''),
        escapeCsvField(magazine.condition ?? ''),
        escapeCsvField(magazine.publicationDate ?? ''),
        escapeCsvField(magazine.barcode ?? ''),
        escapeCsvField(magazine.notes ?? ''),
        escapeCsvField(magazine.ocrText ?? ''),
      ];
      const copies =
        magazine.copies.length > 0
          ? magazine.copies
          : [{ id: magazine.id, notes: null, dateAdded: '' }];
      for (const copy of copies) {
        lines.push(
          [
            ...base,
            escapeCsvField(copy.notes ?? ''),
            escapeCsvField(copy.dateAdded),
          ].join(','),
        );
      }
    }
    return [header, ...lines].join('\n') + '\n';
  }

  private parseBackupRaw(raw: string, format: BackupFormat): BackupFile {
    if (format === 'csv') {
      return parseCsvBackup(raw);
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new InvalidBackupError('Fichier invalide : le contenu n’est pas un JSON lisible.');
    }
    return parseBackupFile(parsed);
  }

  /**
   * Valide uniquement le contenu d'un fichier, sans modifier les données.
   * Utilisé pour afficher un récapitulatif et demander confirmation **avant**
   * le remplacement (§14.4). Rejette via {@link InvalidBackupError} (US-BK-03).
   */
  async validateCollection(raw: string, format: BackupFormat = 'json'): Promise<ImportSummary> {
    const file = this.parseBackupRaw(raw, format);
    return {
      magazines: file.magazines.length,
      copies: file.magazines.reduce((total, magazine) => total + magazine.copies.length, 0),
    };
  }

  /**
   * Importe une sauvegarde (JSON ou CSV) en remplaçant la collection existante.
   * Toute erreur de validation ou d'écriture → transaction annulée, données
   * intactes (stratégie « remplacement complet », cf. fonctionnelle §13.3).
   */
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
