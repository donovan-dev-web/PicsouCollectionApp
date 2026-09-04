import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import SettingsScreen from '@/app/(tabs)/settings/index';
import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';
import { useBackupStore } from '@/store/use-backup-store';
import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { BackupService } from '@/backup/backup-service';

const setColorSchemeMock = jest.fn().mockResolvedValue(undefined);

function stubDeps(): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: setColorSchemeMock,
    } as unknown as Dependencies['settingsRepository'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
  };
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    setColorSchemeMock.mockClear();
    setColorSchemeMock.mockResolvedValue(undefined);
    useSettingsStore.setState({ colorScheme: 'system', loaded: false });
    setDepsForTest(stubDeps());
  });

  afterEach(() => {
    __resetForTests();
  });

  it('affiche les options de theme', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Apparence')).toBeTruthy();
    expect(screen.getByTestId('theme-option-system')).toBeTruthy();
    expect(screen.getByTestId('theme-option-light')).toBeTruthy();
    expect(screen.getByTestId('theme-option-dark')).toBeTruthy();
  });

  it('selectionne le theme sombre au tap', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId('theme-option-dark'));

    expect(useSettingsStore.getState().colorScheme).toBe('dark');
    expect(setColorSchemeMock).toHaveBeenCalledWith('dark');
  });

  it('marque l option courante comme selectionnee', () => {
    useSettingsStore.setState({ colorScheme: 'light' });
    render(<SettingsScreen />);

    expect(screen.getByTestId('theme-option-light').props.accessibilityState?.checked).toBe(true);
    expect(screen.getByTestId('theme-option-system').props.accessibilityState?.checked).toBe(false);
  });
});

describe('SettingsScreen — Sauvegarde', () => {
  let testDb: ReturnType<typeof createTestDatabase>;
  let service: BackupService;
  const writeExport = jest.fn();
  const pickAndReadJson = jest.fn();

  beforeEach(async () => {
    testDb = createTestDatabase();
    await migrate(testDb);
    service = new BackupService(testDb);
    const deps = stubDeps();
    deps.backupService = service;
    deps.fileGateway = {
      writeExport,
      pickAndReadJson,
    } as unknown as Dependencies['fileGateway'];
    setDepsForTest(deps);
    useBackupStore.setState({
      exporting: false,
      importing: false,
      lastExport: null,
      message: null,
      error: null,
      pendingRaw: null,
    });
  });

  afterEach(() => {
    testDb.close();
  });

  it('affiche la section sauvegarde avec export et import', () => {
    render(<SettingsScreen />);
    expect(screen.getByTestId('backup-export')).toBeTruthy();
    expect(screen.getByTestId('backup-import')).toBeTruthy();
  });

  it('exporte la collection au tap du bouton', async () => {
    writeExport.mockResolvedValue({
      uri: 'file:///d/backup.json',
      shared: false,
      name: 'picsou-collection-2026-09-01.json',
    });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-export'));
    await waitFor(() => expect(writeExport).toHaveBeenCalledTimes(1));

    expect(screen.getByTestId('backup-message')).toBeTruthy();
  });

  it('affiche un message d’erreur pour un fichier invalide (US-BK-03)', async () => {
    pickAndReadJson.mockResolvedValue({
      name: 'faux.json',
      content: JSON.stringify({ format: 'autre', version: 1, magazines: [] }),
    });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-import'));
    await waitFor(() => expect(screen.queryByTestId('backup-error')).toBeTruthy());

    expect(screen.getByTestId('backup-error').props.children).toContain('Fichier invalide');
  });
});
