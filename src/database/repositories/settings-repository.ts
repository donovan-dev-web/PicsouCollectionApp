import type { Database } from '@/database/types';

export type ColorSchemeSetting = 'light' | 'dark' | 'system';

const DEFAULT_COLOR_SCHEME: ColorSchemeSetting = 'system';
const COLOR_SCHEME_KEY = 'color_scheme';
const ONBOARDING_DONE_KEY = 'onboarding_done';
const REDUCED_MOTION_KEY = 'reduced_motion';

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

  /** Flag « premier lancement » (onboarding M10R2-05) : vrai après validation. */
  async getOnboardingDone(): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      ONBOARDING_DONE_KEY,
    );
    return row?.value === 'true';
  }

  async setOnboardingDone(done: boolean): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      ONBOARDING_DONE_KEY,
      done ? 'true' : 'false',
    );
  }

  /** Préférence d'accessibilité « réduire les animations » (M10R2-06). */
  async getReducedMotion(): Promise<boolean> {
    const row = await this.db.getFirstAsync<{ value: string }>(
      'SELECT value FROM settings WHERE key = ?',
      REDUCED_MOTION_KEY,
    );
    return row?.value === 'true';
  }

  async setReducedMotion(reduced: boolean): Promise<void> {
    await this.db.runAsync(
      `INSERT INTO settings (key, value) VALUES (?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
      REDUCED_MOTION_KEY,
      reduced ? 'true' : 'false',
    );
  }
}
