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

  it('cree les tables magazines, collection_items et settings', async () => {
    await migrate(testDb);

    const tables = await testDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name IN ('magazines','collection_items','settings') ORDER BY name",
    );
    expect(tables.map((t) => t.name)).toEqual(['collection_items', 'magazines', 'settings']);
  });

  it('cree les 3 index requis', async () => {
    await migrate(testDb);

    const indexes = await testDb.getAllAsync<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name",
    );
    expect(indexes.map((i) => i.name)).toEqual([
      'idx_collection_items_magazine_id',
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

  it('signale une migration incomplète si la version finale est fausse', async () => {
    const db = {
      getFirstAsync: jest.fn().mockResolvedValue(undefined),
      execAsync: jest.fn().mockResolvedValue(undefined),
    } as unknown as Database;

    await expect(migrate(db)).rejects.toThrow(/Migration incomplète/);
  });
});
