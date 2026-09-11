import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
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

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  magazineRepo = new MagazineRepository(testDb);
  service = new BackupService(testDb);
});

afterEach(async () => {
  await testDb.close();
});

async function seedCollection(): Promise<void> {
  await magazineRepo.create({
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: 'good',
    publicationDate: '2023-03',
    barcode: '3271234567890',
    notes: 'n° spécial',
  });
}

const CSV_HEADERS_ROW =
  'publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,createdAt,updatedAt';

describe('BackupService.exportCollection', () => {
  it('produit un export v1 avec toutes les éditions', async () => {
    await seedCollection();

    const file = await service.exportCollection();

    expect(file.format).toBe(BACKUP_FORMAT);
    expect(file.version).toBe(BACKUP_VERSION);
    expect(file.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(file.appVersion).toBeTruthy();
    expect(file.magazines).toHaveLength(1);
    expect(file.magazines[0].publication).toBe('Picsou Magazine');
    expect(file.magazines[0].issueNumber).toBe(547);
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

    const summary = await service.importCollection(service.toJson(source));

    expect(summary).toEqual({ magazines: 1 });

    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('Imported Magazine');
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
    const duplicate = {
      ...file.magazines[0],
      id: 'edition-soumise-a-echec',
    };
    file.magazines.push(duplicate);

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
  });

  it('préserve l’historique (createdAt/updatedAt) au round-trip', async () => {
    await seedCollection();
    const source = await service.exportCollection();
    const original = source.magazines[0];
    original.createdAt = '2020-03-01T10:00:00.000Z';
    original.updatedAt = '2021-05-10T10:00:00.000Z';

    await service.importCollection(service.toJson(source));

    const after = await service.exportCollection();
    expect(after.magazines[0].createdAt).toBe('2020-03-01T10:00:00.000Z');
    expect(after.magazines[0].updatedAt).toBe('2021-05-10T10:00:00.000Z');
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
      magazines: [{ id: 'x', publication: '' }],
    });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette une édition dont la liste d’exemplaires est mal formée (v1)', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      magazines: [{ id: 'x', publication: 'P', copies: 'non-array' }],
    });
    await expect(service.importCollection(raw)).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('accepte et ignore les exemplaires d’un export v1 (rétro-compat)', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: '2026-09-01T00:00:00Z',
      magazines: [
        {
          id: 'a',
          publication: 'P',
          copies: [{ id: 'c', notes: 'Ancienne note', dateAdded: '2026-09-01T00:00:00Z' }],
        },
      ],
    });

    const summary = await service.importCollection(raw);

    expect(summary).toEqual({ magazines: 1 });
    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('P');
  });

  it('ne modifie pas les données à l’échec de validation', async () => {
    await seedCollection();
    const before = await service.exportCollection();

    const invalid = JSON.stringify({ format: 'mauvais', version: 1, magazines: [] });
    await expect(service.importCollection(invalid)).rejects.toBeInstanceOf(InvalidBackupError);

    const after = await service.exportCollection();
    expect(after.magazines).toEqual(before.magazines);
  });

  it('rejette des identifiants d’édition dupliqués', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      magazines: [
        { id: 'dup', publication: 'P', issueNumber: 1 },
        { id: 'dup', publication: 'P', issueNumber: 2 },
      ],
    });
    await expect(service.importCollection(raw)).rejects.toThrow(
      'Fichier invalide : des identifiants d’édition sont dupliqués.',
    );
  });

  it('rejette un numéro d’édition fractionnaire', async () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      magazines: [{ id: 'a', publication: 'P', issueNumber: 1.5 }],
    });
    await expect(service.importCollection(raw)).rejects.toThrow(
      'Fichier invalide : le numéro d’édition doit être un entier',
    );
  });

  it('rejette une date d’export non conforme', async () => {
    const badExportedAt = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: 'hier',
      magazines: [],
    });
    await expect(service.importCollection(badExportedAt)).rejects.toBeInstanceOf(
      InvalidBackupError,
    );
  });

  it('rejette un import dépassant la borne de taille', async () => {
    const oversized = new BackupService(testDb, 100);
    const raw = `${CSV_HEADERS_ROW}\nPicsou,${'1'.repeat(200)}\n`;

    await expect(oversized.importCollection(raw, 'csv')).rejects.toThrow(
      'Fichier invalide : import dépassant la taille maximale de 100 octets.',
    );
  });
});

describe('BackupService.exportCollection.toCsv', () => {
  it('sérialise une ligne par édition avec les en-têtes attendus', async () => {
    await seedCollection();

    const file = await service.exportCollection();
    const csv = service.toCsv(file);

    const lines = csv.trim().split('\n');
    expect(lines[0]).toBe(CSV_HEADERS_ROW);
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain('Picsou Magazine,547,standard,FR,good,2023-03,3271234567890');
    expect(lines[1]).toContain('n° spécial');
  });

  it('échappe les champs contenant virgule, guillemets ou saut de ligne', async () => {
    await seedCollection();
    const file = await service.exportCollection();
    file.magazines[0].notes = 'Note "citée", suite';
    file.magazines[0].ocrText = 'a,b\nc';

    const csv = service.toCsv(file);
    expect(csv).toContain('"Note ""citée"", suite"');
    expect(csv).toContain('"a,b\nc"');
  });
});

describe('BackupService CSV import (US-BK-05)', () => {
  it('importe un CSV valide en remplaçant la collection', async () => {
    await seedCollection();
    const source = await service.exportCollection();
    source.magazines[0].publication = 'Csv Magazine';

    const summary = await service.importCollection(service.toCsv(source), 'csv');

    expect(summary).toEqual({ magazines: 1 });

    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('Csv Magazine');
  });

  it('valide un CSV via validateCollection et en produit le récapitulatif', async () => {
    await seedCollection();
    const source = await service.exportCollection();
    const summary = await service.validateCollection(service.toCsv(source), 'csv');
    expect(summary).toEqual({ magazines: 1 });
  });

  it('rejette un CSV sans les en-têtes attendus ou vide', async () => {
    await expect(
      service.validateCollection('publication,foo\nPicsou,1\n', 'csv'),
    ).rejects.toBeInstanceOf(InvalidBackupError);
    await expect(service.validateCollection('', 'csv')).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('rejette un CSV sans publication ou à numéro non entier', async () => {
    await expect(
      service.validateCollection(`${CSV_HEADERS_ROW}\n,1\n`, 'csv'),
    ).rejects.toBeInstanceOf(InvalidBackupError);
    await expect(
      service.validateCollection(`${CSV_HEADERS_ROW}\nPicsou,abc\n`, 'csv'),
    ).rejects.toBeInstanceOf(InvalidBackupError);
  });

  it('gère les valeurs entre guillemets avec virgules et retours à la ligne', async () => {
    const csv =
      `${CSV_HEADERS_ROW}\n` +
      '"Picsou, le Tocard",5,limited,FR,good,2020-01,,"note, suite \n ligne 2",,2026-09-01T00:00:00Z,2026-09-01T00:00:00Z\n';

    const summary = await service.validateCollection(csv, 'csv');
    expect(summary).toEqual({ magazines: 1 });

    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Picsou, le Tocard');
    expect(after.magazines[0].notes).toBe('note, suite \n ligne 2');
  });

  it('préserve un CRLF à l’intérieur d’un champ entre guillemets', async () => {
    const row = ['"Retour\nChamp"', '5', '', '', '', '', '', '', '', '', ''].join(',');
    const csv = `${CSV_HEADERS_ROW}\n${row}\n`;
    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Retour\nChamp');
  });

  it('gère des retours chariot nus (\r) comme séparateurs de ligne', async () => {
    const csv = `${CSV_HEADERS_ROW}\rPicsou,5,,,,,,,,,\rDoublon,6,,,,,,,,,\r`;
    const summary = await service.importCollection(csv, 'csv');
    expect(summary).toEqual({ magazines: 2 });
  });
});

describe('BackupService — validation de structure (JSON)', () => {
  const base = { format: BACKUP_FORMAT, version: BACKUP_VERSION };

  it('rejette une valeur de texte non conforme', async () => {
    const raw = JSON.stringify({
      ...base,
      magazines: [{ id: 'x', publication: 'P', edition: 42 }],
    });
    await expect(service.importCollection(raw)).rejects.toThrow(
      'certaines valeurs de texte sont mal formées',
    );
  });

  it('rejette une valeur numérique non conforme', async () => {
    const raw = JSON.stringify({
      ...base,
      magazines: [{ id: 'x', publication: 'P', issueNumber: '547' }],
    });
    await expect(service.importCollection(raw)).rejects.toThrow(
      'certaines valeurs numériques sont mal formées',
    );
  });

  it('rejette une édition mal formée', async () => {
    const raw = JSON.stringify({ ...base, magazines: [null] });
    await expect(service.importCollection(raw)).rejects.toThrow('une édition est mal formée');
  });
});

describe('BackupService — CSV cas limites', () => {
  it('accepte les fins de ligne Windows (CRLF)', async () => {
    const summary = await service.validateCollection(
      `${CSV_HEADERS_ROW}\r\nPicsou,5,,,,,,,,,\r\n`,
      'csv',
    );
    expect(summary).toEqual({ magazines: 1 });
  });

  it('ignore les lignes vides en fin de fichier', async () => {
    const summary = await service.validateCollection(
      `${CSV_HEADERS_ROW}\nPicsou,5,,,,,,,,,\n\n\n`,
      'csv',
    );
    expect(summary).toEqual({ magazines: 1 });
  });

  it('déchiffre les guillemets doublés à l’intérieur d’un champ', async () => {
    const row = ['Picsou', '', '', '', '', '', '', '"il a dit ""OK"""', '', '', ''].join(',');
    const csv = `${CSV_HEADERS_ROW}\n${row}\n`;
    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines[0].notes).toBe('il a dit "OK"');
  });

  it('normalise les espaces autour des champs texte', async () => {
    const csv = `${CSV_HEADERS_ROW}\nPicsou,5, edition , FR ,,2020-01,,, ,,\n`;
    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines[0].edition).toBe('edition');
    expect(after.magazines[0].language).toBe('FR');
    expect(after.magazines[0].notes).toBeNull();
  });

  it('préserve les variantes d’édition (edition/language/condition) à l’import CSV', async () => {
    const csv =
      `${CSV_HEADERS_ROW}\nPicsou,5,FR,,,,,,,,2026-09-01T00:00:00Z\n` +
      `Picsou,5,BE,,,,,,,,2026-09-01T00:00:00Z\n`;
    await service.importCollection(csv, 'csv');
    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(2);
    const editions = after.magazines.map((m) => m.edition).sort();
    expect(editions).toEqual(['BE', 'FR']);
  });

  it('lit un export v1 (colonnes exemplaires en plus) en ignorant leur contenu', async () => {
    const v1Headers =
      'publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded,createdAt,updatedAt';
    const csv = `${v1Headers}\nPicsou,5,,,,,,,,Acheté 0,50 €,2026-09-01T00:00:00Z,,\n`;
    const summary = await service.importCollection(csv, 'csv');
    expect(summary).toEqual({ magazines: 1 });
    const after = await service.exportCollection();
    expect(after.magazines).toHaveLength(1);
    expect(after.magazines[0].publication).toBe('Picsou');
  });
});

describe('BackupService.importCollection — rollback', () => {
  it('renvoie l’erreur d’origine même si le rollback échoue', async () => {
    await seedCollection();
    const originalExec = testDb.execAsync;
    testDb.execAsync = jest.fn(async (sql: string) => {
      if (sql === 'DELETE FROM magazines') {
        throw new Error('Échec suppression');
      }
      if (sql === 'ROLLBACK') {
        throw new Error('Échec rollback');
      }
      return originalExec(sql);
    });

    const file = await service.exportCollection();
    await expect(service.importCollection(service.toJson(file))).rejects.toThrow(
      'Échec suppression',
    );
  });
});
