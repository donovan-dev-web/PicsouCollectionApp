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

describe('settingsRepository onboarding (M10R2-05)', () => {
  it('retourne false par defaut avant validation', async () => {
    await expect(repo.getOnboardingDone()).resolves.toBe(false);
  });

  it('persiste le flag après validation', async () => {
    await repo.setOnboardingDone(true);
    await expect(repo.getOnboardingDone()).resolves.toBe(true);
  });

  it('peut marquer le flag comme non vu', async () => {
    await repo.setOnboardingDone(true);
    await repo.setOnboardingDone(false);
    await expect(repo.getOnboardingDone()).resolves.toBe(false);
  });

  it('ne crée pas de ligne dupliquée', async () => {
    await repo.setOnboardingDone(true);
    await repo.setOnboardingDone(true);

    const rows = await testDb.getAllAsync<{ key: string }>(
      "SELECT key FROM settings WHERE key = 'onboarding_done'",
    );
    expect(rows).toHaveLength(1);
  });
});

describe('settingsRepository reduced motion (M10R2-06)', () => {
  it('retourne false par défaut avant activation', async () => {
    await expect(repo.getReducedMotion()).resolves.toBe(false);
  });

  it('persiste l’activation', async () => {
    await repo.setReducedMotion(true);
    await expect(repo.getReducedMotion()).resolves.toBe(true);
  });

  it('peut désactiver le réglage', async () => {
    await repo.setReducedMotion(true);
    await repo.setReducedMotion(false);
    await expect(repo.getReducedMotion()).resolves.toBe(false);

    const rows = await testDb.getAllAsync<{ key: string }>(
      "SELECT key FROM settings WHERE key = 'reduced_motion'",
    );
    expect(rows).toHaveLength(1);
  });
});

describe('settingsRepository debug OCR (paramètres avancés)', () => {
  it('retourne false par défaut avant activation', async () => {
    await expect(repo.getOcrDebug()).resolves.toBe(false);
  });

  it('persiste l’activation', async () => {
    await repo.setOcrDebug(true);
    await expect(repo.getOcrDebug()).resolves.toBe(true);
  });

  it('peut désactiver le debug OCR', async () => {
    await repo.setOcrDebug(true);
    await repo.setOcrDebug(false);
    await expect(repo.getOcrDebug()).resolves.toBe(false);

    const rows = await testDb.getAllAsync<{ key: string }>(
      "SELECT key FROM settings WHERE key = 'ocr_debug'",
    );
    expect(rows).toHaveLength(1);
  });
});
