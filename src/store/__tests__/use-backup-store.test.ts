import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { MagazineRepository } from '@/database/repositories/magazine-repository';
import { BackupService, InvalidBackupError } from '@/backup/backup-service';
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
const pickFile = jest.fn();

const fakeGateway: FileGateway = {
  writeExport,
  pickFile,
};

function buildDeps(): Dependencies {
  return {
    magazineRepository: new MagazineRepository(testDb),
    settingsRepository: {} as Dependencies['settingsRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    backupService: service,
    fileGateway: fakeGateway,
  };
}

async function seed(): Promise<string> {
  const magazineRepo = new MagazineRepository(testDb);
  const magazine = await magazineRepo.create({
    publication: 'Picsou Magazine',
    issueNumber: 547,
  });
  return magazine.id;
}

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  service = new BackupService(testDb);
  writeExport.mockReset();
  pickFile.mockReset();
  useBackupStore.setState({
    exporting: false,
    importing: false,
    lastExport: null,
    message: null,
    error: null,
    pendingRaw: null,
    pendingFormat: null,
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

    const ok = await useBackupStore.getState().exportCollection('json');

    expect(ok).toBe(true);
    expect(writeExport).toHaveBeenCalledTimes(1);
    const [json, format] = writeExport.mock.calls[0];
    expect(format).toBe('json');
    expect(JSON.parse(json).format).toBe('picsou-collection');
    expect(useBackupStore.getState().lastExport?.name).toBe('picsou-collection-2026-09-01.json');
    expect(useBackupStore.getState().message).toContain('exportée');
  });

  it('passe le CSV exporte au systeme de fichiers (US-BK-04)', async () => {
    await seed();
    writeExport.mockResolvedValue({
      uri: 'file:///doc/picsou-collection-2026-09-01.csv',
      shared: false,
      name: 'picsou-collection-2026-09-01.csv',
    });

    const ok = await useBackupStore.getState().exportCollection('csv');

    expect(ok).toBe(true);
    const [csv, format] = writeExport.mock.calls[0];
    expect(format).toBe('csv');
    expect(csv).toMatch(
      /^publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,createdAt,updatedAt\n/,
    );
    expect(useBackupStore.getState().lastExport?.name).toBe('picsou-collection-2026-09-01.csv');
  });

  it('stocke une erreur si l’export echoue', async () => {
    writeExport.mockRejectedValue(new Error('disque plein'));
    const ok = await useBackupStore.getState().exportCollection('json');
    expect(ok).toBe(false);
    expect(useBackupStore.getState().error).toBeTruthy();
  });

  it('annonce un export proposé au partage', async () => {
    await seed();
    writeExport.mockResolvedValue({ uri: 'file:///doc/x.json', shared: true, name: 'x.json' });

    await useBackupStore.getState().exportCollection('json');

    expect(useBackupStore.getState().message).toContain('partage');
    expect(useBackupStore.getState().lastExport?.shared).toBe(true);
  });

  it('traduit une erreur inconnue à l’export', async () => {
    writeExport.mockRejectedValue('panne');
    const ok = await useBackupStore.getState().exportCollection('json');
    expect(ok).toBe(false);
    expect(useBackupStore.getState().error).toBe('Échec de l’export.');
  });
});

describe('useBackupStore.pickAndValidate', () => {
  it('renvoie un recap et met l’import en attente pour un fichier JSON valide', async () => {
    await seed();
    const file = await service.exportCollection();
    pickFile.mockResolvedValue({
      name: 'backup.json',
      content: service.toJson(file),
    });

    const preview = await useBackupStore.getState().pickAndValidate('json');

    expect(preview).toEqual({ magazines: 1 });
    expect(useBackupStore.getState().pendingRaw).toBeTruthy();
    expect(useBackupStore.getState().pendingFormat).toBe('json');
  });

  it('renvoie un recap pour un fichier CSV valide (US-BK-05)', async () => {
    await seed();
    const file = await service.exportCollection();
    pickFile.mockResolvedValue({
      name: 'backup.csv',
      content: service.toCsv(file),
    });

    const preview = await useBackupStore.getState().pickAndValidate('csv');

    expect(preview).toEqual({ magazines: 1 });
    expect(useBackupStore.getState().pendingRaw).toBeTruthy();
    expect(useBackupStore.getState().pendingFormat).toBe('csv');
  });

  it('renvoie null si l’utilisateur annule la selection', async () => {
    pickFile.mockResolvedValue(null);
    const preview = await useBackupStore.getState().pickAndValidate('json');
    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toBeNull();
  });

  it('rejette un fichier invalide sans attendre de confirmation (US-BK-03)', async () => {
    pickFile.mockResolvedValue({
      name: 'faux.json',
      content: JSON.stringify({ format: 'autre-app', version: 1, magazines: [] }),
    });

    const preview = await useBackupStore.getState().pickAndValidate('json');

    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toContain('Fichier invalide');
    expect(useBackupStore.getState().pendingRaw).toBeNull();
    expect(useBackupStore.getState().pendingFormat).toBeNull();
  });

  it('rejette un CSV non conforme (US-BK-05)', async () => {
    pickFile.mockResolvedValue({ name: 'faux.csv', content: 'publication,xy\nP,1\n' });

    const preview = await useBackupStore.getState().pickAndValidate('csv');

    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toContain('Fichier invalide');
  });

  it('annule l’import si la lecture du fichier échoue', async () => {
    pickFile.mockRejectedValue(new Error('permission refusée'));

    const preview = await useBackupStore.getState().pickAndValidate('json');

    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toBe('Impossible de lire le fichier sélectionné.');
  });

  it('rejette un fichier illisible pour une raison inconnue', async () => {
    await seed();
    const serviceSpy = jest
      .spyOn(service, 'validateCollection')
      .mockRejectedValue(new TypeError('boom'));
    pickFile.mockResolvedValue({ name: 'b.json', content: '{}' });

    const preview = await useBackupStore.getState().pickAndValidate('json');

    expect(preview).toBeNull();
    expect(useBackupStore.getState().error).toBe(
      'Fichier invalide : impossible d’importer cette collection.',
    );
    serviceSpy.mockRestore();
  });
});

describe('useBackupStore.applyPendingImport', () => {
  it('remplace la collection par le fichier en attente', async () => {
    await seed();
    const source = await service.exportCollection();
    source.magazines = source.magazines.map((m) => ({ ...m, publication: 'Imported' }));
    pickFile.mockResolvedValue({ name: 'b.json', content: service.toJson(source) });

    await useBackupStore.getState().pickAndValidate('json');
    const summary = await useBackupStore.getState().applyPendingImport();

    expect(summary).toEqual({ magazines: 1 });
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Imported');
    expect(useBackupStore.getState().pendingRaw).toBeNull();
    expect(useBackupStore.getState().pendingFormat).toBeNull();
    expect(useBackupStore.getState().message).toContain('importée');
  });

  it('importe un CSV en attente (US-BK-05)', async () => {
    await seed();
    const source = await service.exportCollection();
    source.magazines[0].publication = 'Csv Imported';
    pickFile.mockResolvedValue({ name: 'b.csv', content: service.toCsv(source) });

    await useBackupStore.getState().pickAndValidate('csv');
    const summary = await useBackupStore.getState().applyPendingImport();

    expect(summary).toEqual({ magazines: 1 });
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Csv Imported');
  });

  it('renvoie null sans action s’il n’y a rien en attente', async () => {
    expect(await useBackupStore.getState().applyPendingImport()).toBeNull();
  });

  it('stocke une erreur générique si le remplacement échoue', async () => {
    await seed();
    const source = await service.exportCollection();
    pickFile.mockResolvedValue({ name: 'b.json', content: service.toJson(source) });
    await useBackupStore.getState().pickAndValidate('json');

    const originalExec = testDb.execAsync;
    testDb.execAsync = jest.fn(async (sql: string) => {
      if (sql === 'DELETE FROM magazines') {
        throw new Error('panne disque');
      }
      return originalExec(sql);
    });

    const summary = await useBackupStore.getState().applyPendingImport();

    expect(summary).toBeNull();
    expect(useBackupStore.getState().error).toBe('Impossible d’importer la collection.');
    expect(useBackupStore.getState().pendingRaw).toBeNull();
    expect(useBackupStore.getState().pendingFormat).toBeNull();
  });

  it('réinitialise l’état de l’import/export', async () => {
    useBackupStore.setState({
      exporting: true,
      message: 'x',
      error: 'y',
      lastExport: { uri: 'u', shared: false, name: 'n' },
    });

    useBackupStore.getState().reset();

    const state = useBackupStore.getState();
    expect(state.exporting).toBe(false);
    expect(state.importing).toBe(false);
    expect(state.message).toBeNull();
    expect(state.error).toBeNull();
    expect(state.lastExport).toBeNull();
    expect(state.pendingRaw).toBeNull();
    expect(state.pendingFormat).toBeNull();
  });

  it('expose le message d’erreur de validation lors de l’application de l’import', async () => {
    await seed();
    const source = await service.exportCollection();
    pickFile.mockResolvedValue({ name: 'b.json', content: service.toJson(source) });
    await useBackupStore.getState().pickAndValidate('json');

    const serviceSpy = jest
      .spyOn(service, 'importCollection')
      .mockRejectedValue(new InvalidBackupError('fichier corrompu'));
    const summary = await useBackupStore.getState().applyPendingImport();

    expect(summary).toBeNull();
    expect(useBackupStore.getState().error).toBe('fichier corrompu');
    serviceSpy.mockRestore();
  });
});
