import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { SettingsRepository } from '@/database/repositories/settings-repository';

let testDb: ReturnType<typeof createTestDatabase>;
let repo: SettingsRepository;

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  repo = new SettingsRepository(testDb);
});

afterEach(async () => {
  await testDb.close();
});

describe('settingsRepository.getColorScheme', () => {
  it('retourne system par defaut quand rien n est enregistre', async () => {
    await expect(repo.getColorScheme()).resolves.toBe('system');
  });

  it('retourne le theme enregistre', async () => {
    await repo.setColorScheme('dark');
    await expect(repo.getColorScheme()).resolves.toBe('dark');
  });

  it('retourne system pour une valeur non reconnue', async () => {
    await testDb.runAsync("INSERT INTO settings (key, value) VALUES ('color_scheme', 'unknown')");
    await expect(repo.getColorScheme()).resolves.toBe('system');
  });
});

describe('settingsRepository.setColorScheme', () => {
  it('met a jour une valeur existante sans dupliquer la clé', async () => {
    await repo.setColorScheme('light');
    await repo.setColorScheme('dark');

    await expect(repo.getColorScheme()).resolves.toBe('dark');

    const rows = await testDb.getAllAsync<{ key: string }>(
      "SELECT key FROM settings WHERE key = 'color_scheme'",
    );
    expect(rows).toHaveLength(1);
  });
});
