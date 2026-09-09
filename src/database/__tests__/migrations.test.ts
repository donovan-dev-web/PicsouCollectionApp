import { createTestDatabase } from '@/test-utils/test-db';
import { migrate, getSchemaVersion } from '@/database/migrations';
import { MIGRATION_001 } from '@/database/schema';
import type { Database } from '@/database/types';

let testDb: ReturnType<typeof createTestDatabase>;

beforeEach(() => {
  testDb = createTestDatabase();
});

afterEach(() => {
  testDb.close();
});

describe('migrate', () => {
  it('applique le schema courant sur une base vide', async () => {
    await migrate(testDb);

    const row = await testDb.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(row?.user_version).toBe(getSchemaVersion());
  });

  it('cree les tables magazines et settings', async () => {
    await migrate(testDb);

    const tables = await testDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('magazines','collection_items','settings') ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual(['magazines', 'settings']);
  });

  it('cree les 2 index requis', async () => {
    await migrate(testDb);

    const indexes = await testDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name",
    );
    expect(indexes.map((i) => i.name)).toEqual([
      'idx_magazines_barcode',
      'idx_magazines_publication_issue',
    ]);
  });

  it("n'applique pas la migration si deja a jour", async () => {
    await migrate(testDb);
    await migrate(testDb);

    const row = await testDb.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
    expect(row?.user_version).toBe(getSchemaVersion());
  });

  it('migre depuis une base dont la version est indisponible', async () => {
    const db = {
      getFirstAsync: jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValue({ user_version: getSchemaVersion() }),
      execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as Database;

    await migrate(db);

    expect(db.execAsync).toHaveBeenCalledWith(MIGRATION_001);
  });

  it('enveloppe chaque migration dans BEGIN/COMMIT avec mise à jour de user_version', async () => {
    const db = {
      getFirstAsync: jest
        .fn()
        .mockResolvedValueOnce(undefined)
        .mockResolvedValue({ user_version: getSchemaVersion() }),
      execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as Database;

    await migrate(db);

    const calls = (db.execAsync as jest.Mock).mock.calls.map((call) => call[0]);
    expect(calls[0]).toBe('BEGIN');
    expect(calls).toContain(MIGRATION_001);
    expect(calls).toContain(`PRAGMA user_version = ${getSchemaVersion()}`);
    expect(calls[calls.length - 1]).toBe('COMMIT');
  });

  it('annule la migration (ROLLBACK) et relance l’erreur en cas d’échec', async () => {
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
      execAsync: jest.fn().mockImplementation((sql: string) => {
        if (sql === 'PRAGMA user_version = 4') {
          throw new Error('Échec forcé');
        }
        return Promise.resolve(undefined);
      }),
    } as unknown as Database;

    await expect(migrate(db)).rejects.toThrow('Échec forcé');

    const calls = (db.execAsync as jest.Mock).mock.calls.map((call) => call[0]);
    expect(calls[0]).toBe('BEGIN');
    // La migration n°4 a échoué → ROLLBACK final (les migrations 1-3 ont COMMIT).
    expect(calls[calls.length - 1]).toBe('ROLLBACK');
    expect(calls.filter((sql) => sql === 'ROLLBACK')).toHaveLength(1);
    // user_version inchangé : la base reste cohérente pour une relance.
    expect(await db.getFirstAsync('PRAGMA user_version')).toEqual({ user_version: 0 });
  });

  it('signale une migration incomplète si la version finale est fausse', async () => {
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue(undefined),
      execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as Database;

    await expect(migrate(db)).rejects.toThrow(/Migration incomplète/);
  });

  it('migre v4 → v5 : reporte la note de la première copie puis supprime collection_items', async () => {
    await testDb.execAsync(`
      CREATE TABLE magazines (
        id               TEXT PRIMARY KEY NOT NULL,
        publication      TEXT NOT NULL,
        issue_number     INTEGER,
        edition          TEXT,
        language         TEXT,
        condition        TEXT,
        publication_date TEXT,
        barcode          TEXT,
        notes            TEXT,
        ocr_text         TEXT,
        created_at       TEXT NOT NULL,
        updated_at       TEXT NOT NULL
      );
      CREATE TABLE collection_items (
        id TEXT PRIMARY KEY NOT NULL,
        magazine_id TEXT NOT NULL,
        condition TEXT,
        notes TEXT,
        date_added TEXT NOT NULL
      );
      INSERT INTO magazines (id, publication, issue_number, created_at, updated_at)
        VALUES
          ('m1', 'Picsou', 547, '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z'),
          ('m2', 'Journal', NULL, '2020-01-01T00:00:00Z', '2020-01-01T00:00:00Z');
      INSERT INTO collection_items (id, magazine_id, notes, date_added)
        VALUES
          ('c1', 'm1', 'Note première', '2020-01-01T00:00:00Z'),
          ('c2', 'm1', 'Note seconde', '2021-01-01T00:00:00Z'),
          ('c3', 'm2', '', '2020-01-01T00:00:00Z');
      PRAGMA user_version = 4;
    `);

    await migrate(testDb);

    const m1 = await testDb.getFirstAsync<{ notes: string | null }>(
      'SELECT notes FROM magazines WHERE id = ?',
      'm1',
    );
    const m2 = await testDb.getFirstAsync<{ notes: string | null }>(
      'SELECT notes FROM magazines WHERE id = ?',
      'm2',
    );
    const leftover = await testDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name = 'collection_items'",
    );
    const version = await testDb.getFirstAsync<{ user_version: number }>('PRAGMA user_version');

    expect(m1?.notes).toBe('Note première');
    expect(m2?.notes).toBeNull();
    expect(leftover).toHaveLength(0);
    expect(version?.user_version).toBe(getSchemaVersion());
  });
});
