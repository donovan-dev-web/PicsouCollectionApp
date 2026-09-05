import type { BackupFormat } from './backup-types';

export type ExportOutput = {
  uri: string;
  shared: boolean;
  name: string;
};

export type PickedFile = {
  name: string;
  content: string;
};

/**
 * Abstraction sur l'accès aux fichiers système (expo-file-system,
 * expo-document-picker, expo-sharing). Injectable pour les tests : la logique
 * métier (BackupService) reste indépendante de la plateforme.
 */
export interface FileGateway {
  writeExport(content: string, format: BackupFormat): Promise<ExportOutput>;
  pickFile(format: BackupFormat): Promise<PickedFile | null>;
}
