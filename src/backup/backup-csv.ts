import { generateId } from '@/utils/id';
import { InvalidBackupError } from './backup-parsers';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupCopy,
  type BackupFile,
  type BackupMagazine,
} from './backup-types';
import { APP_VERSION } from '@/utils/app-version';

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

export function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function parseCsv(raw: string): string[][] {
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
    if (char === '\n' || char === '\r') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      index += 1;
      // '\r\n' (Windows), '\r' seul (Mac), '\n' seul : tous terminent une ligne.
      if (char === '\r' && text[index] === '\n') {
        index += 1;
      }
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
  return trimmed.length > 0 ? trimmed : null;
}

export function parseCsvBackup(raw: string): BackupFile {
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

    const edition = asCsvString(at('edition'));
    const language = asCsvString(at('language'));
    const condition = asCsvString(at('condition'));

    // Clé d'édition complète : deux lignes ne définissent la même édition que si
    // tous les champs métier coïncident. Préserve les variantes (FR vs BE,
    // numéros à `issueNumber` null distincts par état/édition) au lieu de
    // collapse la 1ère ligne seulement.
    const key = `${publication}::${issueNumber ?? ''}::${edition ?? ''}::${language ?? ''}::${condition ?? ''}`;
    let magazine = byKey.get(key);
    if (!magazine) {
      magazine = {
        id: generateId(),
        publication,
        issueNumber,
        edition,
        language,
        condition,
        publicationDate: asCsvString(at('publicationDate')),
        barcode: asCsvString(at('barcode')),
        notes: asCsvString(at('notes')),
        ocrText: asCsvString(at('ocrText')),
        copies: [],
        createdAt: asCsvString(at('createdAt')),
        updatedAt: asCsvString(at('updatedAt')),
      };
      byKey.set(key, magazine);
      magazines.push(magazine);
    }

    const copyNotes = at('copyNotes').trim();
    const dateAdded = at('dateAdded').trim();
    // Une ligne aux champs exemplaire vides désigne une édition **sans copie**
    // (l'export `toCsv` émet une telle ligne pour la conserver). Ne pas la
    // réimporter comme un exemplaire fantôme daté d'aujourd'hui.
    if (copyNotes.length === 0 && dateAdded.length === 0) {
      continue;
    }
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

export function toCsv(file: BackupFile): string {
  const header = [...BACKUP_CSV_HEADERS, 'createdAt', 'updatedAt'].join(',');
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
          escapeCsvField(magazine.createdAt ?? ''),
          escapeCsvField(magazine.updatedAt ?? ''),
        ].join(','),
      );
    }
  }
  return [header, ...lines].join('\n') + '\n';
}
