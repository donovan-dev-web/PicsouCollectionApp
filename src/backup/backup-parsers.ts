import { APP_VERSION } from '@/utils/app-version';
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupFile,
  type BackupMagazine,
} from './backup-types';

export class InvalidBackupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidBackupError';
  }
}

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

function asNullableInteger(value: unknown): number | null {
  const number = asNullableNumber(value);
  if (number !== null && !Number.isInteger(number)) {
    throw new InvalidBackupError(
      'Fichier invalide : le numéro d’édition doit être un entier (reçu : ' + `${number}).`,
    );
  }
  return number;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function asNullableIsoDate(value: unknown): string | null {
  const date = asNullableString(value);
  if (date !== null && !ISO_DATE_RE.test(date)) {
    throw new InvalidBackupError(
      `Fichier invalide : la date « ${date} » n’est pas au format ISO-8601 attendu.`,
    );
  }
  return date;
}

function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new InvalidBackupError(`Fichier invalide : le champ « ${field} » est manquant ou vide.`);
  }
  return value;
}

export function parseBackupFile(raw: unknown): BackupFile {
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
  const seenMagazineIds = new Set<string>();
  const seenCopyIds = new Set<string>();
  for (const entry of root['magazines']) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new InvalidBackupError('Fichier invalide : une édition est mal formée.');
    }

    const magazine = entry as Record<string, unknown>;

    const id = asNonEmptyString(magazine['id'], 'identifiant d’édition');
    if (seenMagazineIds.has(id)) {
      throw new InvalidBackupError('Fichier invalide : des identifiants d’édition sont dupliqués.');
    }
    seenMagazineIds.add(id);

    if (!Array.isArray(magazine['copies'])) {
      throw new InvalidBackupError('Fichier invalide : la liste des exemplaires est absente.');
    }

    const copies = [];
    for (const copyEntry of magazine['copies']) {
      if (typeof copyEntry !== 'object' || copyEntry === null || Array.isArray(copyEntry)) {
        throw new InvalidBackupError('Fichier invalide : un exemplaire est mal formé.');
      }
      const copy = copyEntry as Record<string, unknown>;
      const copyId = asNonEmptyString(copy['id'], 'identifiant d’exemplaire');
      if (seenCopyIds.has(copyId)) {
        throw new InvalidBackupError(
          'Fichier invalide : des identifiants d’exemplaire sont dupliqués.',
        );
      }
      seenCopyIds.add(copyId);
      copies.push({
        id: copyId,
        notes: asNullableString(copy['notes']),
        dateAdded: asNullableIsoDate(copy['dateAdded']) ?? '',
      });
    }

    magazines.push({
      id,
      publication: asNonEmptyString(magazine['publication'], 'publication'),
      issueNumber: asNullableInteger(magazine['issueNumber']),
      edition: asNullableString(magazine['edition']),
      language: asNullableString(magazine['language']),
      condition: asNullableString(magazine['condition']),
      publicationDate: asNullableString(magazine['publicationDate']),
      barcode: asNullableString(magazine['barcode']),
      notes: asNullableString(magazine['notes']),
      ocrText: asNullableString(magazine['ocrText']),
      copies,
      createdAt: asNullableIsoDate(magazine['createdAt']),
      updatedAt: asNullableIsoDate(magazine['updatedAt']),
    });
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: asNullableIsoDate(root['exportedAt']) ?? new Date().toISOString(),
    appVersion: asNullableString(root['appVersion']) ?? APP_VERSION,
    magazines,
  };
}

export function parseJsonBackup(raw: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidBackupError('Fichier invalide : le contenu n’est pas un JSON lisible.');
  }
  return parseBackupFile(parsed);
}
