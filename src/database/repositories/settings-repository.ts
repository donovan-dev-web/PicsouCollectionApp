import type { Database } from '@/database/types';

export type ColorSchemeSetting = 'light' | 'dark' | 'system';

const DEFAULT_COLOR_SCHEME: ColorSchemeSetting = 'system';
const COLOR_SCHEME_KEY = 'color_scheme';

/**
 * Persistance des réglages clé/valeur (ex. le thème manuel) dans la table
 * `settings` (US-SET-01).
 */
export class SettingsRepository {
  constructor(private readonly db: Database) {}

  async getColorScheme(): Promise<ColorSchemeSetting> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      COLOR_SCHEME_KEY,
    );

    const value = row?.value ?? DEFAULT_COLOR_SCHEME;
    return value === 'light' || value === 'dark' ? value : DEFAULT_COLOR_SCHEME;
  }

  async setColorScheme(colorScheme: ColorSchemeSetting): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      COLOR_SCHEME_KEY,
      colorScheme,
    );
  }
}
