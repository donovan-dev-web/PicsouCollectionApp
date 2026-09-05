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
    identificationService: {
      identifyByOCR: jest.fn().mockResolvedValue({ status: 'no-text' }),
      searchByOcrFields: jest.fn().mockResolvedValue({ status: 'no-text' }),
    } as unknown as Dependencies['identificationService'],
    ocrEngine: {
      recognize: jest.fn().mockResolvedValue({ text: 'Picsou Magazine N° 547' }),
    } as unknown as OcrEngine,
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
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

  it('maintient l’analyse en lecture partielle et affiche les champs détectés en surcouche (US-ID-08)', async () => {
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: jest.fn().mockResolvedValue({
            status: 'weak',
            publication: 'Picsou Magazine',
            issueNumber: null,
            date: null,
            confidence: 0.5,
          }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    expect(screen.getByTestId('ocr-detected-board')).toBeTruthy();
    expect(screen.getByTestId('ocr-field-publication')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByTestId('ocr-field-issue')).toHaveTextContent('…');
    expect(screen.getByText(/Pointez maintenant le numéro/)).toBeTruthy();
    expect(screen.queryByTestId('ocr-found')).toBeNull();
    expect(screen.getByTestId('ocr-confirm-detected')).toBeTruthy();
    expect(screen.getByTestId('ocr-barcode')).toBeTruthy();
  });

  it('relance la recherche dès que nom + numéro sont détectés à la frame suivante', async () => {
    const magazine = makeMagazine();
    const identity = jest
      .fn()
      .mockResolvedValueOnce({
        status: 'weak',
        publication: 'Picsou Magazine',
        issueNumber: null,
        date: null,
        confidence: 0.5,
      })
      .mockResolvedValue({
        status: 'found',
        magazine,
        publication: 'Picsou Magazine',
        issueNumber: 547,
        date: null,
        confidence: 0.9,
      });
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: identity,
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();
    expect(screen.getByTestId('ocr-confirm-detected')).toBeTruthy();

    await tick();
    expect(screen.getByTestId('ocr-found')).toBeTruthy();
    expect(identity).toHaveBeenCalledTimes(2);
  });

  it('Scanner le code-barres mène au scan de code-barres', async () => {
    render(<CameraOcrScreen />);
    await tick();
    fireEvent.press(screen.getByTestId('ocr-barcode'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/barcode');
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

  it('Saisir manuellement (non trouvé) pré-remplit la saisie avec les infos OCR', async () => {
    setDepsForTest(
      stubDeps({
        identificationService: {
          identifyByOCR: jest.fn().mockResolvedValue({
            status: 'unknown',
            publication: 'Picsou Magazine',
            issueNumber: 900,
            date: '2023',
            confidence: 1,
          }),
        } as unknown as Dependencies['identificationService'],
      }),
    );

    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: {
        publication: 'Picsou Magazine',
        issueNumber: '900',
        year: '2023',
      },
    });
  });
});

describe('CameraOcrScreen — US-ID-09 surcouche de validation / correction', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockReplace.mockClear();
    mockBack.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const weakDeps = (searchByOcrFields?: jest.Mock) =>
    stubDeps({
      identificationService: {
        identifyByOCR: jest.fn().mockResolvedValue({
          status: 'weak',
          publication: 'Picsou Magazine',
          issueNumber: null,
          date: '2023',
          confidence: 0.5,
        }),
        searchByOcrFields:
          searchByOcrFields ??
          jest.fn().mockResolvedValue({
            status: 'unknown',
            publication: 'Picsou Magazine',
            issueNumber: 547,
            date: null,
            confidence: 1,
          }),
      } as unknown as Dependencies['identificationService'],
    });

  it('ouvre le panneau de vérification pré-rempli depuis la surcouche', async () => {
    setDepsForTest(weakDeps());
    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-confirm-detected'));

    expect(screen.getByTestId('ocr-override-panel')).toBeTruthy();
    expect(screen.getByTestId('ocr-override-publication').props.value).toBe('Picsou Magazine');
    expect(screen.getByTestId('ocr-override-date').props.value).toBe('2023');
  });

  it('retour à la caméra depuis le panneau relance l’analyse', async () => {
    setDepsForTest(weakDeps());
    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-confirm-detected'));
    fireEvent.press(screen.getByTestId('ocr-override-back'));

    expect(screen.getByText(/Pointez/)).toBeTruthy();
    expect(screen.getByTestId('ocr-detected-board')).toBeTruthy();
  });

  it('recherche hors confiance avec les champs corrigés (outrepasser la confiance)', async () => {
    const search = jest.fn().mockResolvedValue({
      status: 'found',
      magazine: makeMagazine(),
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: '2023',
      confidence: 1,
    });
    setDepsForTest(weakDeps(search));
    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-confirm-detected'));
    fireEvent.changeText(screen.getByTestId('ocr-override-publication'), 'Picsou Magazine');
    fireEvent.changeText(screen.getByTestId('ocr-override-issue'), '547');
    fireEvent.press(screen.getByTestId('ocr-override-search'));

    await act(async () => {});

    expect(search).toHaveBeenCalledWith('Picsou Magazine', 547, '2023');
    expect(screen.getByTestId('ocr-found')).toBeTruthy();
  });

  it('oriente vers la saisie manuelle si nom ou numéro restent manquants', async () => {
    setDepsForTest(weakDeps());
    render(<CameraOcrScreen />);
    await tick();

    fireEvent.press(screen.getByTestId('ocr-confirm-detected'));
    fireEvent.press(screen.getByTestId('ocr-override-search'));

    await act(async () => {});

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { publication: 'Picsou Magazine', year: '2023' },
    });
  });
});
