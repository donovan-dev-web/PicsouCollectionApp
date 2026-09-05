import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Linking } from 'react-native';

import BarcodeScreen from '@/app/scan/barcode';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import type { Magazine } from '@/types';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockAddCopy = jest.fn();
const mockCountByMagazine = jest.fn();
const mockAddExistingCopy = jest.fn();

let mockContinuousParam: Record<string, string> = {};

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
  useLocalSearchParams: () => mockContinuousParam,
}));

const mockRequestPermission = jest.fn();

let mockPermission = { granted: true, canAskAgain: true, status: 'granted' };

jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockCameraView = (props: any) => <View testID="camera-view" {...props} />;
  return {
    useCameraPermissions: () => [mockPermission, mockRequestPermission],
    CameraView: MockCameraView,
  };
});

const mockUseCollectionStore = jest.fn().mockReturnValue(mockAddExistingCopy);

jest.mock('@/store/use-collection-store', () => ({
  useCollectionStore: (selector: (s: unknown) => unknown) => mockUseCollectionStore(selector),
}));

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'mag-1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: null,
    publicationDate: '2023-03',
    barcode: '5901234123457',
    notes: null,
    ocrText: null,
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    ...overrides,
  };
}

function stubDeps(overrides: Partial<Dependencies> = {}): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {
      addCopy: mockAddCopy,
      countByMagazine: mockCountByMagazine,
    } as unknown as Dependencies['collectionRepository'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    identificationService: {
      identify: jest.fn(),
    } as unknown as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
    ...overrides,
  };
}

function scan() {
  const camera = screen.getByTestId('camera-view');
  return camera.props.onBarcodeScanned;
}

/** Émet `times` lectures identiques pour atteindre le seuil du stabilisateur (3 par défaut). */
function scanTimes(code: string, type = 'ean13', times = 3) {
  return (async () => {
    for (let i = 0; i < times; i++) {
      await act(async () => {
        scan()({ data: code, type });
      });
    }
  })();
}

describe('BarcodeScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    mockAddCopy.mockClear();
    mockCountByMagazine.mockClear();
    mockAddExistingCopy.mockClear();
    mockContinuousParam = {};
    mockPermission = { granted: true, canAskAgain: true, status: 'granted' };
    mockAddCopy.mockResolvedValue({
      id: 'c1',
      magazineId: 'mag-1',
      notes: null,
      dateAdded: '2026-09-02T00:00:00Z',
    });
    mockCountByMagazine.mockResolvedValue(1);
    mockAddExistingCopy.mockResolvedValue(undefined);
    setDepsForTest(stubDeps());
  });

  it('affiche le preview caméra quand la permission est accordée', () => {
    render(<BarcodeScreen />);
    expect(screen.getByTestId('camera-view')).toBeTruthy();
    expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy();
  });

  it('ne lance la recherche qu’après stabilisation de la lecture (3 lectures identiques)', async () => {
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'unknown' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    // Une seule lecture (voire deux) ne doit pas déclencher de recherche
    await act(async () => {
      scan()({ data: '5901234123457', type: 'ean13' });
    });
    expect(identifyByBarcode).not.toHaveBeenCalled();

    await act(async () => {
      scan()({ data: '5901234123457', type: 'ean13' });
    });
    expect(identifyByBarcode).not.toHaveBeenCalled();

    // La 3e lecture stabilise le code → la recherche est lancée
    await act(async () => {
      scan()({ data: '5901234123457', type: 'ean13' });
    });
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/scan/result',
        params: { barcode: '5901234123457' },
      }),
    );
    expect(identifyByBarcode).toHaveBeenCalledTimes(1);
  });

  it('navigue vers le résultat quand le magazine existe en base', async () => {
    const magazine = makeMagazine();
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'found', magazine });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/scan/result',
        params: {
          id: 'mag-1',
          publication: 'Picsou Magazine',
          issueNumber: '547',
          barcode: '5901234123457',
        },
      }),
    );
    expect(identifyByBarcode).toHaveBeenCalledWith('5901234123457');
  });

  it('navigue vers le résultat quand le code est inconnu', async () => {
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'unknown' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/scan/result',
        params: { barcode: '5901234123457' },
      }),
    );
  });

  it('navigue vers /scan/multiple quand le code correspond à plusieurs éditions', async () => {
    const identifyByBarcode = jest.fn().mockResolvedValue({
      status: 'ambiguous',
      magazines: [
        { ...makeMagazine({ id: 'mag-1', issueNumber: 547 }), quantity: 1 },
        { ...makeMagazine({ id: 'mag-2', issueNumber: 548 }), quantity: 0 },
      ],
    });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/scan/multiple',
        params: { barcode: '5901234123457' },
      }),
    );
  });

  it('n’émet qu’une seule recherche par code stabilisé', async () => {
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'unknown' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457', 'ean13', 6);
    expect(identifyByBarcode).toHaveBeenCalledTimes(1);
  });

  it('affiche une erreur et permet de réessayer pour un code invalide', async () => {
    const identifyByBarcode = jest
      .fn()
      .mockResolvedValue({ status: 'invalid', reason: 'EAN-13 invalide (checksum).' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123458');

    await waitFor(() => expect(screen.getByTestId('invalid-reason')).toBeTruthy());
    expect(mockReplace).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('invalid-retry'));
    await waitFor(() => expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy());
  });

  it('permet de lancer puis d arrêter le scan en continu', async () => {
    render(<BarcodeScreen />);

    expect(screen.getByTestId('continuous-start')).toBeTruthy();

    fireEvent.press(screen.getByTestId('continuous-start'));
    await waitFor(() => expect(screen.getByTestId('continuous-stop')).toBeTruthy());

    fireEvent.press(screen.getByTestId('continuous-stop'));
    await waitFor(() => expect(screen.queryByTestId('continuous-stop')).toBeNull());
    expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy();
  });

  it('en mode continu, demande la confirmation doublon puis ajoute et reprend le scan', async () => {
    mockContinuousParam = { continuous: '1' };
    const magazine = makeMagazine();
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'found', magazine });
    mockCountByMagazine.mockResolvedValue(1);
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');
    await waitFor(() => expect(screen.getByTestId('pending-confirm')).toBeTruthy());
    expect(screen.getByTestId('pending-confirm')).toHaveTextContent(/Exemplaires actuels : 1/);
    expect(mockReplace).not.toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('pending-confirm-add'));
    await waitFor(() => expect(screen.getByTestId('pending-success')).toBeTruthy());
    expect(mockAddExistingCopy).toHaveBeenCalledWith('mag-1');

    fireEvent.press(screen.getByTestId('pending-success-ok'));
    await waitFor(() => expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy());
  });

  it('en mode continu, ajoute directement une édition non possédée puis confirme', async () => {
    mockContinuousParam = { continuous: '1' };
    const magazine = makeMagazine();
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'found', magazine });
    mockCountByMagazine.mockResolvedValue(0);
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() => expect(screen.getByTestId('pending-success')).toBeTruthy());
    expect(screen.queryByTestId('pending-confirm')).toBeNull();
    expect(mockAddExistingCopy).toHaveBeenCalledWith('mag-1');
  });

  it('en mode continu, un code inconnu propose la saisie manuelle', async () => {
    mockContinuousParam = { continuous: '1' };
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'unknown' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() => expect(screen.getByTestId('pending-unknown')).toBeTruthy());
    fireEvent.press(screen.getByTestId('pending-unknown-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { barcode: '5901234123457' },
    });
  });

  it('permission définitivement refusée : propose d ouvrir les réglages', () => {
    mockPermission = { granted: false, canAskAgain: false, status: 'denied' };
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);

    render(<BarcodeScreen />);

    expect(screen.getByTestId('permission-denied')).toBeTruthy();
    fireEvent.press(screen.getByTestId('permission-settings'));
    expect(openSettings).toHaveBeenCalled();
    openSettings.mockRestore();
  });

  it('la fiche doublon peut être fermée via la croix et reprend le scan', async () => {
    mockContinuousParam = { continuous: '1' };
    const magazine = makeMagazine();
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'found', magazine });
    mockCountByMagazine.mockResolvedValue(1);
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    await scanTimes('5901234123457');
    await waitFor(() => expect(screen.getByTestId('pending-confirm')).toBeTruthy());

    fireEvent.press(screen.getByTestId('pending-close'));
    await waitFor(() => expect(screen.queryByTestId('pending-confirm')).toBeNull());
    expect(mockAddExistingCopy).not.toHaveBeenCalled();
  });
});
