import { create } from 'zustand';

import { getDeps } from '@/dependencies';
import { InvalidBackupError } from '@/backup/backup-service';
import type { ImportSummary } from '@/backup/backup-types';
import type { PickedFile } from '@/backup/file-gateway';

interface BackupState {
  exporting: boolean;
  importing: boolean;
  lastExport: { uri: string; shared: boolean; name: string } | null;
  message: string | null;
  error: string | null;
  pendingRaw: string | null;
  exportCollection: () => Promise<boolean>;
  /** Sélectionne + valide un fichier. Renvoie un récapitulatif, ou null si annulé/invalide. */
  pickAndValidate: () => Promise<ImportSummary | null>;
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

  exportCollection: async () => {
    set({ exporting: true, error: null, message: null });
    try {
      const { backupService, fileGateway } = getDeps();
      const file = await backupService.exportCollection();
      const json = backupService.toJson(file);
      const output = await fileGateway.writeExport(json);
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

  pickAndValidate: async () => {
    set({ importing: true, error: null, message: null, pendingRaw: null });
    let picked: PickedFile | null = null;
    try {
      const { fileGateway } = getDeps();
      picked = await fileGateway.pickAndReadJson();
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
      const summary = await backupService.validateCollection(picked.content);
      set({ importing: false, pendingRaw: picked.content });
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
    const raw = get().pendingRaw;
    if (!raw) {
      return null;
    }
    set({ importing: true, error: null, message: null });
    try {
      const { backupService } = getDeps();
      const summary = await backupService.importCollection(raw);
      set({
        importing: false,
        pendingRaw: null,
        message: `Collection importée : ${summary.magazines} édition(s), ${summary.copies} exemplaire(s).`,
      });
      return summary;
    } catch (err) {
      const message =
        err instanceof InvalidBackupError ? err.message : 'Impossible d’importer la collection.';
      set({ importing: false, pendingRaw: null, error: message });
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
    }),
}));
