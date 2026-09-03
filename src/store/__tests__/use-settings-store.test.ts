import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';

const setColorSchemeMock = jest.fn().mockResolvedValue(undefined);
const getColorSchemeMock = jest.fn().mockResolvedValue('system');

function stubDeps(): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    settingsRepository: {
      getColorScheme: getColorSchemeMock,
      setColorScheme: setColorSchemeMock,
    } as unknown as Dependencies['settingsRepository'],
  };
}

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ colorScheme: 'system', loaded: false });
    setColorSchemeMock.mockClear();
    setColorSchemeMock.mockResolvedValue(undefined);
    getColorSchemeMock.mockClear();
    getColorSchemeMock.mockResolvedValue('system');
  });

  it('initialise le colorScheme sur system', () => {
    expect(useSettingsStore.getState().colorScheme).toBe('system');
  });

  it('met à jour le colorScheme via setColorScheme et persiste', () => {
    setDepsForTest(stubDeps());

    useSettingsStore.getState().setColorScheme('dark');
    expect(useSettingsStore.getState().colorScheme).toBe('dark');
    expect(setColorSchemeMock).toHaveBeenCalledWith('dark');

    useSettingsStore.getState().setColorScheme('light');
    expect(useSettingsStore.getState().colorScheme).toBe('light');
    expect(setColorSchemeMock).toHaveBeenCalledWith('light');
  });

  it('met à jour le colorScheme sans dependances initialisees', () => {
    useSettingsStore.getState().setColorScheme('dark');
    expect(useSettingsStore.getState().colorScheme).toBe('dark');
  });

  it('charge le theme persiste via loadColorScheme', async () => {
    getColorSchemeMock.mockResolvedValue('dark');
    setDepsForTest(stubDeps());

    await useSettingsStore.getState().loadColorScheme();

    expect(useSettingsStore.getState().colorScheme).toBe('dark');
    expect(useSettingsStore.getState().loaded).toBe(true);
  });

  it('accepte le retour à system', () => {
    useSettingsStore.getState().setColorScheme('light');
    useSettingsStore.getState().setColorScheme('system');
    expect(useSettingsStore.getState().colorScheme).toBe('system');
  });

  afterEach(() => {
    __resetForTests();
  });
});
