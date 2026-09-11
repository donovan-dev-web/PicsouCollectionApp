import type { Database } from '@/database/types';
import {
  MIGRATION_001,
  MIGRATION_002,
  MIGRATION_003,
  MIGRATION_004,
  MIGRATION_005,
  SCHEMA_VERSION,
} from '@/database/schema';

type Migration = {
  version: number;
  up: (db: Database) => Promise<void>;
};

const MIGRATIONS: Migration[] = [
  { version: 1, up: (db) => db.execAsync(MIGRATION_001) },
  { version: 2, up: (db) => db.execAsync(MIGRATION_002) },
  { version: 3, up: (db) => db.execAsync(MIGRATION_003) },
  { version: 4, up: (db) => db.execAsync(MIGRATION_004) },
  { version: 5, up: (db) => db.execAsync(MIGRATION_005) },
];

export async function migrate(db: Database): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version > current) {
      // Chaque migration dans une transaction : un échec partiel annule le DDL
      // déjà appliqué, évitant une base « mi-figée » avec un `user_version`
      // inchangé qui bloquerait toute relance.
      await db.execAsync('BEGIN');
      try {
        await migration.up(db);
        await db.execAsync(`PRAGMA user_version = ${migration.version}`);
        await db.execAsync('COMMIT');
      } catch (error) {
        try {
          await db.execAsync('ROLLBACK');
        } catch {
          // Ignorer l'échec du rollback : on renvoie l'erreur d'origine.
        }
        throw error;
      }
    }
  }

  const finalRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  if ((finalRow?.user_version ?? 0) !== getSchemaVersion()) {
    throw new Error(
      `Migration incomplète : version ${finalRow?.user_version ?? 0} au lieu de ${getSchemaVersion()}.`,
    );
  }
}

export function getSchemaVersion(): number {
  return SCHEMA_VERSION;
}
