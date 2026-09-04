import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { CollectionRepository } from '@/database/repositories/collection-repository';
import { MagazineRepository } from '@/database/repositories/magazine-repository';
import { BackupService } from '@/backup/backup-service';
import type { FileGateway } from '@/backup/file-gateway';

import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useBackupStore } from '@/store/use-backup-store';

jest.mock('expo-crypto', () => {
  let n = 0;
  return {
    randomUUID: jest.fn(() => {
      n += 1;
      return `b1a2c3d4-0000-4000-8000-${String(n).padStart(12, '0')}`;
    }),
  };
});

let testDb: ReturnType<typeof createTestDatabase>;
let service: BackupService;
const writeExport = jest.fn();
const pickAndReadJson = jest.fn();

const fakeGateway: FileGateway = {
  writeExport,
  pickAndReadJson,
};

function buildDeps(): Dependencies {
  return {
    magazineRepository: new MagazineRepository(testDb),
    collectionRepository: new CollectionRepository(testDb),
    settingsRepository: {} as Dependencies['settingsRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    backupService: service,
    fileGateway: fakeGateway,
  };
}

async function seed(): Promise<string> {
  const magazineRepo = new MagazineRepository(testDb);
  const collectionRepo = new CollectionRepository(testDb);
  const magazine = await magazineRepo.create({
    publication: 'Picsou Magazine',
    issueNumber: 547,
  });
  await collectionRepo.addCopy(magazine.id, { notes: 'OK' });
  return magazine.id;
}

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  service = new BackupService(testDb);
  writeExport.mockReset();
  pickAndReadJson.mockReset();
  useBackupStore.setState({
    exporting: false,
    importing: false,
    lastExport: null,
    message: null,
    error: null,
    pendingRaw: null,
  });
  setDepsForTest(buildDeps());
});

afterEach(() => {
  testDb.close();
  __resetForTests();
});

describe('useBackupStore.exportCollection', () => {
  it('passe le JSON exporte au systeme de fichiers', async () => {
    await seed();
    writeExport.mockResolvedValue({
      uri: 'file:///doc/picsou-collection-2026-09-01.json',
      shared: false,
      name: 'picsou-collection-2026-09-01.json',
    });

    const ok = await useBackupStore.getState().exportCollection();

    expect(ok).toBe(true);
    expect(writeExport).toHaveBeenCalledTimes(1);
    const json = writeExport.mock.calls[0][0];
    expect(JSON.parse(json).format).toBe('picsou-collection');
    expect(useBackupStore.getState().lastExport?.name).toBe('picsou-collection-2026-09-01.json');
    expect(useBackupStore.getState().message).toContain('exportée');
  });

  it('stocke une erreur si l’export echoue', async () => {
    writeExport.mockRejectedValue(new Error('disque plein'));
    const ok = await useBackupStore.getState().exportCollection();
    expect(ok).toBe(false);
    expect(useBackupStore.getState().error).toBeTruthy();
  });
});

describe('useBackupStore.pickAndValidate', () => {
  it('renvoie un recap et met l’import en attente pour un fichier valide', async () => {
    await seed();
    const file = await service.exportCollection();
    pickAndReadJson.mockResolvedValue({
      name: 'backup.json',
      content: service.toJson(file),
    });

    const preview = await useBackupStore.getState().pickAndValidate();

    expect(preview).toEqual({ magazines: 1, copies: 1 });
    expect(useBackupStore.getState().pendingRaw).toBeTruthy();
  });

  it('renvoie null si l’utilisateur annule la selection', async () => {
    pickAndReadJson.mockResolvedValue(null);
    const preview = await useBackupStore.getState().pickAndValidate();
    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toBeNull();
  });

  it('rejette un fichier invalide sans attendre de confirmation (US-BK-03)', async () => {
    pickAndReadJson.mockResolvedValue({
      name: 'faux.json',
      content: JSON.stringify({ format: 'autre-app', version: 1, magazines: [] }),
    });

    const preview = await useBackupStore.getState().pickAndValidate();

    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toContain('Fichier invalide');
    expect(useBackupStore.getState().pendingRaw).toBeNull();
  });
});

describe('useBackupStore.applyPendingImport', () => {
  it('remplace la collection par le fichier en attente', async () => {
    await seed();
    const source = await service.exportCollection();
    source.magazines = source.magazines.map((m) => ({ ...m, publication: 'Imported' }));
    pickAndReadJson.mockResolvedValue({ name: 'b.json', content: service.toJson(source) });

    await useBackupStore.getState().pickAndValidate();
    const summary = await useBackupStore.getState().applyPendingImport();

    expect(summary).toEqual({ magazines: 1, copies: 1 });
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Imported');
    expect(useBackupStore.getState().pendingRaw).toBeNull();
    expect(useBackupStore.getState().message).toContain('importée');
  });

  it('renvoie null sans action s’il n’y a rien en attente', async () => {
    expect(await useBackupStore.getState().applyPendingImport()).toBeNull();
  });
});
