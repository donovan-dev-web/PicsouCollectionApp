export const BACKUP_FORMAT = 'picsou-collection';
export const BACKUP_VERSION = 1;

/** Format de fichier de sauvegarde choisi par l'utilisateur (US-BK-04/05). */
export type BackupFormat = 'json' | 'csv';

export type BackupCopy = {
  id: string;
  notes: string | null;
  dateAdded: string;
};

export type BackupMagazine = {
  id: string;
  publication: string;
  issueNumber: number | null;
  edition: string | null;
  language: string | null;
  condition: string | null;
  publicationDate: string | null;
  barcode: string | null;
  notes: string | null;
  ocrText: string | null;
  copies: BackupCopy[];
};

export type BackupFile = {
  format: typeof BACKUP_FORMAT;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  appVersion: string;
  magazines: BackupMagazine[];
};

export type ImportSummary = {
  magazines: number;
  copies: number;
};
