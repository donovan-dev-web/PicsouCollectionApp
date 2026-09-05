import { fireEvent, render, screen, waitFor, act } from '@testing-library/react-native';
import { Alert, type AlertButton } from 'react-native';

import SettingsScreen from '@/app/(tabs)/settings/index';
import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';
import { useBackupStore } from '@/store/use-backup-store';
import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { BackupService } from '@/backup/backup-service';
import { CollectionRepository } from '@/database/repositories/collection-repository';
import { MagazineRepository } from '@/database/repositories/magazine-repository';

const setColorSchemeMock = jest.fn().mockResolvedValue(undefined);

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'b1a2c3d4-0000-4000-8000-000000000001'),
}));

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
  const pickFile = jest.fn();

  beforeEach(async () => {
    testDb = createTestDatabase();
    await migrate(testDb);
    service = new BackupService(testDb);
    const deps = stubDeps();
    deps.backupService = service;
    deps.fileGateway = {
      writeExport,
      pickFile,
    } as unknown as Dependencies['fileGateway'];
    setDepsForTest(deps);
    useBackupStore.setState({
      exporting: false,
      importing: false,
      lastExport: null,
      message: null,
      error: null,
      pendingRaw: null,
      pendingFormat: null,
    });
  });

  afterEach(() => {
    testDb.close();
    jest.restoreAllMocks();
  });

  async function pressAlertButton(firstAlertButtons: unknown, text: string): Promise<void> {
    const buttons = (firstAlertButtons ?? []) as AlertButton[];
    const button = buttons.find((b) => b.text === text);
    expect(button).toBeDefined();
    await act(async () => {
      button?.onPress?.();
    });
  }

  it('affiche la section sauvegarde avec export et import', () => {
    render(<SettingsScreen />);
    expect(screen.getByTestId('backup-export')).toBeTruthy();
    expect(screen.getByTestId('backup-import')).toBeTruthy();
  });

  it('exporte la collection en JSON au tap du bouton (US-BK-04)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    writeExport.mockResolvedValue({
      uri: 'file:///d/backup.json',
      shared: false,
      name: 'picsou-collection-2026-09-01.json',
    });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-export'));
    await pressAlertButton(alertSpy.mock.calls[0][2], 'JSON');

    await waitFor(() => expect(writeExport).toHaveBeenCalledTimes(1));
    expect(writeExport.mock.calls[0][1]).toBe('json');
    expect(JSON.parse(writeExport.mock.calls[0][0]).format).toBe('picsou-collection');
    expect(screen.getByTestId('backup-message')).toBeTruthy();
  });

  it('exporte la collection en CSV au tap du bouton (US-BK-04)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    writeExport.mockResolvedValue({
      uri: 'file:///d/backup.csv',
      shared: false,
      name: 'picsou-collection-2026-09-01.csv',
    });
    const magazineRepo = new MagazineRepository(testDb);
    const collectionRepo = new CollectionRepository(testDb);
    const magazine = await magazineRepo.create({ publication: 'Picsou', issueNumber: 1 });
    await collectionRepo.addCopy(magazine.id, { notes: 'OK' });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-export'));
    await pressAlertButton(alertSpy.mock.calls[0][2], 'CSV');

    await waitFor(() => expect(writeExport).toHaveBeenCalledTimes(1));
    expect(writeExport.mock.calls[0][1]).toBe('csv');
    expect(writeExport.mock.calls[0][0]).toMatch(
      /^publication,issueNumber,edition,language,condition,publicationDate,barcode,notes,ocrText,copyNotes,dateAdded\n/,
    );
  });

  it('demande le format puis rejette un fichier JSON invalide (US-BK-03)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    pickFile.mockResolvedValue({
      name: 'faux.json',
      content: JSON.stringify({ format: 'autre', version: 1, magazines: [] }),
    });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-import'));
    await pressAlertButton(alertSpy.mock.calls[0][2], 'JSON');

    await waitFor(() => expect(screen.queryByTestId('backup-error')).toBeTruthy());
    expect(pickFile).toHaveBeenCalledWith('json');
    expect(screen.getByTestId('backup-error').props.children).toContain('Fichier invalide');
  });

  it('confirme l’import CSV avant de remplacer la collection (US-BK-05)', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const magazineRepo = new MagazineRepository(testDb);
    const collectionRepo = new CollectionRepository(testDb);
    const magazine = await magazineRepo.create({ publication: 'Picsou', issueNumber: 1 });
    await collectionRepo.addCopy(magazine.id, { notes: 'OK' });
    const source = await service.exportCollection();
    source.magazines[0].publication = 'Csv Importer';
    pickFile.mockResolvedValue({ name: 'backup.csv', content: service.toCsv(source) });

    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('backup-import'));
    await pressAlertButton(alertSpy.mock.calls[0][2], 'CSV');

    expect(alertSpy).toHaveBeenCalledTimes(2);
    expect(alertSpy.mock.calls[1][0]).toBe('Remplacer la collection ?');
    expect(alertSpy.mock.calls[1][1]).toContain('1 édition(s)');

    const buttons = (alertSpy.mock.calls[1][2] ?? []) as AlertButton[];
    const importer = buttons.find((b) => b.text === 'Importer');
    await act(async () => {
      importer?.onPress?.();
    });

    await waitFor(() => expect(screen.queryByTestId('backup-message')).toBeTruthy());
    const after = await service.exportCollection();
    expect(after.magazines[0].publication).toBe('Csv Importer');
  });
});
