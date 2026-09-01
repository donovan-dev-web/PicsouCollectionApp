import * as SQLite from 'expo-sqlite';

import { getDatabase } from '@/database/db';

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(),
}));

const mockOpenDatabaseAsync = SQLite.openDatabaseAsync as jest.Mock;

describe('getDatabase', () => {
  it('ouvre la base et active WAL + foreign_keys', async () => {
    const execAsync = jest.fn().mockResolvedValue(undefined);
    mockOpenDatabaseAsync.mockResolvedValue({ execAsync });

    const db = await getDatabase();

    expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('picsou-collection.db');
    expect(execAsync).toHaveBeenCalledTimes(2);
    expect(execAsync).toHaveBeenNthCalledWith(1, `PRAGMA journal_mode = WAL;`);
    expect(execAsync).toHaveBeenNthCalledWith(2, `PRAGMA foreign_keys = ON;`);
    expect(db).toBeDefined();
  });
});
