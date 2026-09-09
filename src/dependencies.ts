import type { Database } from '@/database/types';
import { getDatabase } from '@/database/db';
// Migration avant création des dépôts : toutes les tables sont à jour.
import { migrate } from '@/database/migrations';
import { MagazineRepository } from '@/database/repositories/magazine-repository';
import { SettingsRepository } from '@/database/repositories/settings-repository';
import { IdentificationService } from '@/identification/identificationService';
import type { OcrEngine } from '@/identification/ocr/ocrTypes';
import { MlKitOcrEngine } from '@/identification/ocr/mlKitOcrEngine';
import { NoopOcrEngine } from '@/identification/ocr/ocrEngine';
import { Platform } from 'react-native';
import { BackupService } from '@/backup/backup-service';
import { NativeFileGateway } from '@/backup/native-file-gateway';
import type { FileGateway } from '@/backup/file-gateway';

export interface Dependencies {
  magazineRepository: MagazineRepository;
  settingsRepository: SettingsRepository;
  identificationService: IdentificationService;
  ocrEngine: OcrEngine;
  backupService: BackupService;
  fileGateway: FileGateway;
}

let dbPromise: Promise<Database> | null = null;
let deps: Dependencies | null = null;

async function openDb(): Promise<Database> {
  const db = await getDatabase();
  await migrate(db);
  return db;
}

export function getDeps(): Dependencies {
  if (!deps) {
    throw new Error('Dépendances non initialisées : appeler initialize() au démarrage.');
  }
  return deps;
}

export async function initialize(): Promise<Dependencies> {
  if (!dbPromise) {
    dbPromise = openDb();
  }
  const db = await dbPromise;
  if (!deps) {
    // Moteur OCR natif (ML Kit via expo-mlkit-ocr) sur Android/iOS ; sur le web
    // (aucun module natif) on utilise un moteur inerte : le flux caméra reste
    // câblé et la CI démarre sans blocage.
    const ocrEngine: OcrEngine =
      Platform.OS === 'android' || Platform.OS === 'ios'
        ? new MlKitOcrEngine()
        : new NoopOcrEngine();
    const magazineRepository = new MagazineRepository(db);
    deps = {
      magazineRepository,
      settingsRepository: new SettingsRepository(db),
      identificationService: new IdentificationService(magazineRepository),
      ocrEngine,
      backupService: new BackupService(db),
      fileGateway: new NativeFileGateway(),
    };
  }
  return deps;
}

export function setDepsForTest(overrides: Dependencies): void {
  deps = overrides;
}

export function __resetForTests(): void {
  deps = null;
  dbPromise = null;
}
