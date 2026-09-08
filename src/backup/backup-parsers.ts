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
  for (const entry of root['magazines']) {
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      throw new InvalidBackupError('Fichier invalide : une édition est mal formée.');
    }

    const magazine = entry as Record<string, unknown>;

    const id = asNonEmptyString(magazine['id'], 'identifiant d’édition');

    if (!Array.isArray(magazine['copies'])) {
      throw new InvalidBackupError('Fichier invalide : la liste des exemplaires est absente.');
    }

    const copies = [];
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

export function parseJsonBackup(raw: string): BackupFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new InvalidBackupError('Fichier invalide : le contenu n’est pas un JSON lisible.');
  }
  return parseBackupFile(parsed);
}
