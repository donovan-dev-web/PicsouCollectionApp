import BetterSqlite3 from 'better-sqlite3';
import type { Database, RunResult } from '@/database/types';

export function createTestDatabase(): Database & { close(): void } {
  const db = new BetterSqlite3(':memory:');
  db.pragma('foreign_keys = ON');

  const fkState = db.pragma('foreign_keys', { simple: true }) as number;
  if (fkState !== 1) {
    throw new Error('Les contraintes de clés étrangères doivent être actives dans les tests.');
  }

  return {
    async execAsync(sql: string): Promise<void> {
      db.exec(sql);
    },

    async runAsync(sql: string, ...params: unknown[]): Promise<RunResult> {
      const stmt = db.prepare(sql);
      const result = stmt.run(...params);
      return {
        changes: Number(result.changes),
        lastInsertRowId: Number(result.lastInsertRowid),
      };
    },

    async getFirstAsync<T>(sql: string, ...params: unknown[]): Promise<T | null> {
      const stmt = db.prepare(sql);
      const row = stmt.get(...(params as [])) as T | undefined;
      return row ?? null;
    },

    async getAllAsync<T>(sql: string, ...params: unknown[]): Promise<T[]> {
      const stmt = db.prepare(sql);
      return stmt.all(...(params as [])) as T[];
    },

    close() {
      db.close();
    },
  };
}
