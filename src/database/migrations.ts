import type { Database } from '@/database/types';
import { SCHEMA_VERSION, MIGRATION_001 } from '@/database/schema';

type Migration = {
  version: number;
  up: (db: Database) => Promise<void>;
};

const MIGRATIONS: Migration[] = [{ version: 1, up: (db) => db.execAsync(MIGRATION_001) }];

export async function migrate(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      await migration.up(db);
      await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    }
  }
}

export function getSchemaVersion(): number {
  return SCHEMA_VERSION;
}
