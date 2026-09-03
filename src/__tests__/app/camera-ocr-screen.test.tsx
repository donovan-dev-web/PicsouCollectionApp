import { act, fireEvent, render, screen } from '@testing-library/react-native';

import CameraOcrScreen from '@/app/scan/camera';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import type { OcrEngine } from '@/identification/ocr/ocrTypes';
import type { Magazine } from '@/types';

const mockReplace = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

const mockRequestPermission = jest.fn();

jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockCameraView = (props: any) => <View testID="ocr-camera-view" {...props} />;
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
    id: 'mag-547',
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
    collectionRepository: {} as Dependencies['collectionRepository'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: {
      recognize: jest.fn().mockResolvedValue({ text: 'Picsou Magazine N° 547' }),
    } as unknown as OcrEngine,
    ...overrides,
  };
}

/** Fait avancer l'intervalle d'analyse pour déclencher handleOcr. */
async function tick(ms = 500) {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
}

describe('CameraOcrScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
    mockBack.mockClear();
    setDepsForTest(stubDeps());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('affiche le preview caméra quand la permission est accordée', () => {
    render(<CameraOcrScreen />);
    expect(screen.getByTestId('ocr-camera-view')).toBeTruthy();
    expect(screen.getByText(/Pointez la couverture/)).toBeTruthy();
  });

  it('continue d’analyser quand le moteur n’a rien détecté', async () => {
    const identity = jest.fn().mockResolvedValue({ status: 'no-text' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: identity,
        } as unknown as Dependencies['identificationService'],
        ocrEngine: {
          recognize: jest.fn().mockResolvedValue(null),
        } as unknown as OcrEngine,
      }),
    );

    render(<CameraOcrScreen />);
    await tick();
    await tick();

    expect(screen.getByText(/Pointez la couverture/)).toBeTruthy();
  });

  it('affiche la fiche reconnue quand l’édition est trouvée en base', async () => {
    const magazine = makeMagazine();
    const identity = jest.fn().mockResolvedValue({
      status: 'found',
      magazine,
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: '2023',
      confidence: 1,
    });
    const recognize = jest.fn().mockResolvedValue({ text: 'Picsou Magazine N° 547' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: identity,
        } as unknown as Dependencies['identificationService'],
        ocrEngine: { recognize } as unknown as OcrEngine,
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    expect(screen.getByTestId('ocr-found')).toBeTruthy();
    expect(screen.getByTestId('ocr-publication')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByText('N° 547')).toBeTruthy();
    expect(screen.getByText('Confiance : élevée')).toBeTruthy();
    expect(identity).toHaveBeenCalledWith('Picsou Magazine N° 547');
  });

  it('Confirmer mène à la fiche du magazine', async () => {
    const magazine = makeMagazine();
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: jest.fn().mockResolvedValue({
            status: 'found',
            magazine,
            publication: 'Picsou Magazine',
            issueNumber: 547,
            date: null,
            confidence: 0.8,
          }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-confirm'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-547');
  });

  it('affiche la confiance insuffisante et ne repropose que réessayer/manuel', async () => {
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: jest.fn().mockResolvedValue({
            status: 'weak',
            publication: 'Picsou Magazine',
            issueNumber: null,
            date: null,
            confidence: 0.4,
          }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    expect(screen.getByTestId('ocr-weak')).toBeTruthy();
    expect(screen.getByText('Confiance insuffisante')).toBeTruthy();
    expect(screen.queryByTestId('ocr-confirm')).toBeNull();
  });

  it('Réessayer relance l’analyse', async () => {
    const identity = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'weak',
        publication: 'Picsou Magazine',
        issueNumber: null,
        date: null,
        confidence: 0.4,
      })
      .mockResolvedValue({ status: 'no-text' });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: identity,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();
    expect(screen.getByTestId('ocr-weak')).toBeTruthy();

    fireEvent.press(screen.getByTestId('ocr-retry'));
    expect(screen.getByText(/Pointez la couverture/)).toBeTruthy();
  });

  it('affiche "Non trouvé" quand un texte confiant ne correspond à rien en base', async () => {
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: jest.fn().mockResolvedValue({
            status: 'unknown',
            publication: 'Picsou Magazine',
            issueNumber: 900,
            confidence: 1,
          }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    expect(screen.getByTestId('ocr-unknown')).toBeTruthy();
    expect(screen.getByText(/Non trouvé en collection/)).toBeTruthy();
  });
});
