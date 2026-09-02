import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import BarcodeScreen from '@/app/scan/barcode';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import type { Magazine } from '@/types';

const mockBack = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, push: mockPush }),
}));

const mockRequestPermission = jest.fn();

jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockCameraView = (props: any) => <View testID="camera-view" {...props} />;
  return {
    useCameraPermissions: () => [
      { granted: true, canAskAgain: true, status: 'granted' },
      mockRequestPermission,
    ],
    CameraView: MockCameraView,
  };
});

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'mag-1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    country: 'FR',
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
    collectionRepository: {} as Dependencies['collectionRepository'],
    identificationService: {
      identifyByBarcode: jest.fn().mockResolvedValue({ status: 'unknown' }),
    } as unknown as Dependencies['identificationService'],
    ...overrides,
  };
}

describe('BarcodeScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockPush.mockClear();
    setDepsForTest(stubDeps());
  });

  it('affiche le preview caméra quand la permission est accordée', () => {
    render(<BarcodeScreen />);
    expect(screen.getByTestId('camera-view')).toBeTruthy();
    expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy();
  });

  it('affiche code inconnu et propose la saisie manuelle quand rien ne correspond', async () => {
    const identifyByBarcode = jest.fn().mockResolvedValue({ status: 'unknown' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    const camera = screen.getByTestId('camera-view');
    await act(async () => {
      camera.props.onBarcodeScanned({ data: '5901234123457', type: 'ean13' });
    });

    await waitFor(() => expect(screen.getByText('Code-barres inconnu')).toBeTruthy());
    expect(identifyByBarcode).toHaveBeenCalledWith('5901234123457');

    fireEvent.press(screen.getByTestId('unknown-manual'));
    expect(mockPush).toHaveBeenCalledWith('/scan/manual');
  });

  it('affiche le magazine trouvé quand le code existe en base', async () => {
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

    const camera = screen.getByTestId('camera-view');
    await act(async () => {
      camera.props.onBarcodeScanned({ data: '5901234123457', type: 'ean13' });
    });

    await waitFor(() => expect(screen.getByText('Magazine trouvé')).toBeTruthy());
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('N° 547')).toBeTruthy();
  });

  it('affiche une erreur pour un code invalide', async () => {
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

    const camera = screen.getByTestId('camera-view');
    await act(async () => {
      camera.props.onBarcodeScanned({ data: '5901234123458', type: 'ean13' });
    });

    await waitFor(() => expect(screen.getByText('Code non reconnu')).toBeTruthy());
    expect(screen.getByTestId('invalid-reason')).toBeTruthy();
  });

  it('permet de scanner à nouveau après un résultat', async () => {
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByBarcode: jest.fn().mockResolvedValue({ status: 'unknown' }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<BarcodeScreen />);

    const camera = screen.getByTestId('camera-view');
    await act(async () => {
      camera.props.onBarcodeScanned({ data: '5901234123457', type: 'ean13' });
    });
    await waitFor(() => expect(screen.getByText('Code-barres inconnu')).toBeTruthy());

    fireEvent.press(screen.getByTestId('unknown-retry'));
    await waitFor(() => expect(screen.getByText(/Alignez le code-barres/)).toBeTruthy());
  });
});
