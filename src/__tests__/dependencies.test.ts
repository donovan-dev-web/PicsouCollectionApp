import { getDatabase } from '@/database/db';
import { migrate } from '@/database/migrations';

import {
  initialize,
  getDeps,
  setDepsForTest,
  __resetForTests,
  type Dependencies,
} from '@/dependencies';

jest.mock('@/database/db', () => ({
  getDatabase: jest.fn(),
}));

jest.mock('@/database/migrations', () => ({
  migrate: jest.fn(),
}));

const mockGetDatabase = getDatabase as unknown as jest.Mock;

const stubDeps: Dependencies = {
  magazineRepository: {} as Dependencies['magazineRepository'],
  collectionRepository: {} as Dependencies['collectionRepository'],
  settingsRepository: {} as Dependencies['settingsRepository'],
  identificationService: {} as Dependencies['identificationService'],
  ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
  backupService: {} as Dependencies['backupService'],
  fileGateway: {} as Dependencies['fileGateway'],
};

describe('dependencies', () => {
  afterEach(() => {
    __resetForTests();
  });

  it('initialise la base avec migration et retourne les repositories', async () => {
    mockGetDatabase.mockResolvedValue({ id: 'db' });

    const deps = await initialize();

    expect(migrate).toHaveBeenCalledWith({ id: 'db' });
    expect(deps.magazineRepository).toBeDefined();
    expect(deps.collectionRepository).toBeDefined();
    expect(getDeps()).toBe(deps);
  });

  it('reutilise la meme instance entre deux appels', async () => {
    mockGetDatabase.mockResolvedValue({ id: 'db' });

    const first = await initialize();
    const second = await initialize();

    expect(first).toBe(second);
    expect(mockGetDatabase).toHaveBeenCalledTimes(1);
  });

  it('getDeps leve une erreur tant que initialize na pas ete appelee', () => {
    expect(() => getDeps()).toThrow('non initialisées');
  });

  it('setDepsForTest remplace les dependances', () => {
    setDepsForTest(stubDeps);

    expect(getDeps()).toBe(stubDeps);
  });
});
