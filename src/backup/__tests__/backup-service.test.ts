import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { CollectionRepository } from '@/database/repositories/collection-repository';
import { MagazineRepository } from '@/database/repositories/magazine-repository';
import { BackupService, InvalidBackupError } from '@/backup/backup-service';
import { BACKUP_FORMAT, BACKUP_VERSION } from '@/backup/backup-types';

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
let magazineRepo: MagazineRepository;
let collectionRepo: CollectionRepository;

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  magazineRepo = new MagazineRepository(testDb);
  collectionRepo = new CollectionRepository(testDb);
  service = new BackupService(testDb);
});

afterEach(async () => {
  await testDb.close();
});

async function seedCollection(): Promise<void> {
  const magazine = await magazineRepo.create({
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: 'good',
    publicationDate: '2023-03',
    barcode: '3271234567890',
    notes: 'n° spécial',
  });
  await collectionRepo.addCopy(magazine.id, { notes: 'Acheté 0,50 €' });
  await collectionRepo.addCopy(magazine.id, { notes: 'Doublon' });
}

describe('BackupService.exportCollection', () => {
  it('produit un export v1 avec toutes les éditions et exemplaires', async () => {
    await seedCollection();

    const file = await service.exportCollection();

    expect(file.format).toBe(BACKUP_FORMAT);
    expect(file.version).toBe(BACKUP_VERSION);
    expect(file.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(file.appVersion).toBeTruthy();
    expect(file.magazines).toHaveLength(1);
    expect(file.magazines[0].publication).toBe('Picsou Magazine');
    expect(file.magazines[0].issueNumber).toBe(547);
    expect(file.magazines[0].copies).toHaveLength(2);
  });

  it('exporte une collection vide avec une liste magazines vide', async () => {
    const file = await service.exportCollection();
    expect(file.magazines).toEqual([]);
  });

  it('sérialise en JSON lisible', async () => {
    await seedCollection();
    const file = await service.exportCollection();
    const json = service.toJson(file);

    const parsed = JSON.parse(json);
    expect(parsed.format).toBe(BACKUP_FORMAT);
    expect(parsed.version).toBe(BACKUP_VERSION);
    expect(parsed.magazines).toHaveLength(1);
  });
});

describe('BackupService.importCollection', () => {
  it('remplace la collection existante par le fichier importé', async () => {
    await seedCollection();
    const source = await service.exportCollection();

    source.magazines[0].publication = 'Imported Magazine';
    source.magazines[0].copies = source.magazines[0].copies.slice(0, 1);

    const summary = await service.importCollection(service.toJson(source));

    expect(summary).toEqual({ magazines: 1, copies: 1 });

    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('Imported Magazine');
    expect(after.magazines[0].copies).toHaveLength(1);
  });

  it('écrase entièrement même si le fichier contient moins d’éléments', async () => {
    await seedCollection();

    await service.importCollection(
      service.toJson({
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: '2026-09-01T00:00:00Z',
        appVersion: '0.7.0',
        magazines: [],
      }),
    );

    expect((await service.exportCollection()).magazines).toEqual([]);
  });

  it('annule la transaction et laisse les données intactes si l’insertion échoue', async () => {
    await seedCollection();
    const before = await service.exportCollection();

    const file = await service.exportCollection();
    file.magazines.push({ ...file.magazines[0], id: 'edition-soumise-a-echec' });

    // On force un échec déterministe lors de la 2e insertion d'édition, sans
    // dépendre du comportement de la contrainte de clé primaire (flaky en CI).
    const originalRun = testDb.runAsync;
    let magazineInserts = 0;
    testDb.runAsync = jest.fn(async (sql: string, ...params: unknown[]) => {
      if (sql.includes('INSERT INTO magazines')) {
        magazineInserts += 1;
        if (magazineInserts === 2) {
          throw new Error('Échec d’insertion forcé');
        }
      }
      return originalRun(sql, ...params);
    });

    await expect(service.importCollection(service.toJson(file))).rejects.toThrow(
      'Échec d’insertion forcé',
    );

    const after = await service.exportCollection();
    expect(after.magazines).toEqual(before.magazines);
    expect(after.magazines[0].copies).toEqual(before.magazines[0].copies);
  });
});

describe('BackupService.importCollection — fichier invalide (US-BK-03)', () => {
  it('rejette un JSON illisible', async () => {
    await seedCollection();
    await expect(service.importCollection('not json')).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette un mauvais format', async () => {
    const raw = JSON.stringify({ format: 'autre-app', version: 1, magazines: [] });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette une version non prise en charge', async () => {
    const raw = JSON.stringify({ format: BACKUP_FORMAT, version: 999, magazines: [] });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette une édition sans publication', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      magazines: [{ id: 'x', publication: '', copies: [] }],
    });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette une édition sans liste d’exemplaires', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      magazines: [{ id: 'x', publication: 'P', copies: 'non-array' }],
    });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('ne modifie pas les données à l’échec de validation', async () => {
    await seedCollection();
    const before = await service.exportCollection();

    const invalid = JSON.stringify({ format: 'mauvais', version: 1, magazines: [] });
    await expect(service.importCollection(invalid)).rejects.toBeInstanceOf(InvalidBackupError);

    const after = await service.exportCollection();
    expect(after.magazines).toEqual(before.magazines);
  });
});

describe('BackupService.exportCollection.toCsv', () => {
  it('sérialise une ligne par exemplaire avec les en-têtes attendus', async () => {
    await seedCollection();

    const file = await service.exportCollection();
    const csv = service.toCsv(file);

    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe(
      'publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded',
    );
    expect(lines).toHaveLength(3);
    expect(lines[1]).toContain('Picsou Magazine,547,standard,FR,good,2023-03,3271234567890');
    expect(lines[1]).toContain('Acheté 0,50 €');
    expect(lines[2]).toContain('Doublon');
  });

  it('échappe les champs contenant virgule, guillemets ou saut de ligne', async () => {
    await seedCollection();
    const file = await service.exportCollection();
    file.magazines[0].notes = 'Note "citée"';
    file.magazines[0].copies[0].notes = 'a,b\nc';

    const csv = service.toCsv(file);
    expect(csv).toContain('"Note ""citée"""');
    expect(csv).toContain('"a,b\nc"');
  });

  it('conserve les éditions sans exemplaire via une ligne aux champs vides', async () => {
    await magazineRepo.create({ publication: 'Vacances', issueNumber: 12 });

    const file = await service.exportCollection();
    const csv = service.toCsv(file);
    const lines = csv.trim().split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Vacances,12,');
    expect(lines[1]).toContain(',,,,');
  });
});

describe('BackupService CSV import (US-BK-05)', () => {
  it('importe un CSV valide en remplaçant la collection', async () => {
    await seedCollection();
    const source = await service.exportCollection();
    source.magazines[0].publication = 'Csv Magazine';

    const summary = await service.importCollection(service.toCsv(source), 'csv');

    expect(summary).toEqual({ magazines: 1, copies: 2 });

    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('Csv Magazine');
    expect(after.magazines[0].copies).toHaveLength(2);
  });

  it('valide un CSV via validateCollection et en produit le récapitulatif', async () => {
    await seedCollection();
    const source = await service.exportCollection();
    const summary = await service.validateCollection(service.toCsv(source), 'csv');
    expect(summary).toEqual({ magazines: 1, copies: 2 });
  });

  it('rejette un CSV sans les en-têtes attendus ou vide', async () => {
    await expect(
      service.validateCollection('publication,foo\nPicsou,1\n', 'csv'),
    ).rejects.toBeInstanceOf(InvalidBackupError);
    await expect(service.validateCollection('', 'csv')).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette un CSV sans publication ou à numéro non entier', async () => {
    const headers =
      'publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded\n';
    await expect(service.validateCollection(`${headers},1\n`, 'csv')).rejects.toBeInstanceOf(
      InvalidBackupError,
    );
    await expect(
      service.validateCollection(`${headers}Picsou,abc\n`, 'csv'),
    ).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('gère les valeurs entre guillemets avec virgules et retours à la ligne', async () => {
    const csv =
      'publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded\n' +
      '"Picsou, le Tocard",5,limited,FR,good,2020-01,,"note, suite \n ligne 2",,"Acheté 0,50 €",2026-09-01T00:00:00Z\n';

    const summary = await service.validateCollection(csv, 'csv');
    expect(summary).toEqual({ magazines: 1, copies: 1 });

    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Picsou, le Tocard');
    expect(after.magazines[0].notes).toBe('note, suite \n ligne 2');
    expect(after.magazines[0].copies[0].notes).toBe('Acheté 0,50 €');
  });
});
