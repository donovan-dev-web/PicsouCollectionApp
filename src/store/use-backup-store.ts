import { create } from 'zustand';

import { getDeps } from '@/dependencies';
import { InvalidBackupError } from '@/backup/backup-service';
import type { BackupFormat, ImportSummary } from '@/backup/backup-types';
import type { PickedFile } from '@/backup/file-gateway';

interface BackupState {
  exporting: boolean;
  importing: boolean;
  lastExport: { uri: string; shared: boolean; name: string } | null;
  message: string | null;
  error: string | null;
  pendingRaw: string | null;
  pendingFormat: BackupFormat | null;
  exportCollection: (format: BackupFormat) => Promise<boolean>;
  /** Sélectionne + valide un fichier au format choisi. Renvoie un récapitulatif, ou null si annulé/invalide. */
  pickAndValidate: (format: BackupFormat) => Promise<ImportSummary | null>;
  /** Applique l'import du fichier validé en attente (après confirmation utilisateur). */
  applyPendingImport: () => Promise<ImportSummary | null>;
  reset: () => void;
}

export const useBackupStore = create<BackupState>((set, get) => ({
  exporting: false,
  importing: false,
  lastExport: null,
  message: null,
  error: null,
  pendingRaw: null,
  pendingFormat: null,

  exportCollection: async (format) => {
    set({ exporting: true, error: null, message: null });
    try {
      const { backupService, fileGateway } = getDeps();
      const file = await backupService.exportCollection();
      const content = format === 'csv' ? backupService.toCsv(file) : backupService.toJson(file);
      const output = await fileGateway.writeExport(content, format);
      set({
        exporting: false,
        lastExport: output,
        message: output.shared
          ? 'Collection exportée et proposée au partage.'
          : 'Collection exportée et sauvegardée sur l’appareil.',
      });
      return true;
    } catch (err) {
      set({
        exporting: false,
        error: err instanceof Error ? err.message : 'Échec de l’export.',
      });
      return false;
    }
  },

  pickAndValidate: async (format) => {
    set({ importing: true, error: null, message: null, pendingRaw: null, pendingFormat: null });
    let picked: PickedFile | null = null;
    try {
      const { fileGateway } = getDeps();
      picked = await fileGateway.pickFile(format);
    } catch {
      set({ importing: false, error: 'Impossible de lire le fichier sélectionné.' });
      return null;
    }
    if (!picked) {
      set({ importing: false });
      return null;
    }

    try {
      const { backupService } = getDeps();
      const summary = await backupService.validateCollection(picked.content, format);
      set({ importing: false, pendingRaw: picked.content, pendingFormat: format });
      return summary;
    } catch (err) {
      const message =
        err instanceof InvalidBackupError
          ? err.message
          : 'Fichier invalide : impossible d’importer cette collection.';
      set({ importing: false, error: message });
      return null;
    }
  },

  applyPendingImport: async () => {
    const { pendingRaw, pendingFormat } = get();
    if (!pendingRaw || !pendingFormat) {
      return null;
    }
    set({ importing: true, error: null, message: null });
    try {
      const { backupService } = getDeps();
      const summary = await backupService.importCollection(pendingRaw, pendingFormat);
      set({
        importing: false,
        pendingRaw: null,
        pendingFormat: null,
        message: `Collection importée : ${summary.magazines} édition(s), ${summary.copies} exemplaire(s).`,
      });
      return summary;
    } catch (err) {
      const message =
        err instanceof InvalidBackupError ? err.message : 'Impossible d’importer la collection.';
      set({ importing: false, pendingRaw: null, pendingFormat: null, error: message });
      return null;
    }
  },

  reset: () =>
    set({
      exporting: false,
      importing: false,
      lastExport: null,
      message: null,
      error: null,
      pendingRaw: null,
      pendingFormat: null,
    }),
}));