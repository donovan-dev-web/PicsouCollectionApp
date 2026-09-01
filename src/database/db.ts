import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'picsou-collection.db';

export const getDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`PRAGMA journal_mode = WAL;`);
  await db.execAsync(`PRAGMA foreign_keys = ON;`);
  return db;
};