import { act, fireEvent, render, screen } from '@testing-library/react-native';

import OcrReviewScreen from '@/app/scan/ocr-review';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import { analyzeOcrFrame } from '@/identification/ocr/ocrCandidateAnalyzer';
import { buildOcrProposals } from '@/identification/ocr/ocrProposals';
import type { OcrTextZone } from '@/identification/ocr/ocrTypes';
import { consumePendingOcrReview, setPendingOcrReview } from '@/lib/ocr-pending';
import type { Magazine } from '@/types';

const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: mockBack,
    replace: mockReplace,
    push: mockPush,
    canGoBack: () => false,
  }),
  useLocalSearchParams: () => ({}),
}));

function makeZones(texts: string[]): OcrTextZone[] {
  return texts.map((text, i) => ({
    id: `b0-l${i}`,
    text,
    boundingBox: { x: 40, y: 60 + i * 40, width: 400, height: 30 },
  }));
}

function seedPayload(texts: string[]): void {
  const zones = makeZones(texts);
  const analysis = analyzeOcrFrame({ text: texts.join('\n'), zones });
  setPendingOcrReview({
    uri: 'file:///tmp/cover.jpg',
    width: 1000,
    height: 1400,
    zones,
    analysis,
    proposals: buildOcrProposals(analysis),
  });
}

function stubDeps(searchByOcrFields: jest.Mock): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    settingsRepository: {} as Dependencies['settingsRepository'],
    identificationService: {
      searchByOcrFields,
    } as unknown as Dependencies['identificationService'],
    ocrEngine: {} as Dependencies['ocrEngine'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
  };
}

function makeMagazine(): Magazine {
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
  };
}

describe('OcrReviewScreen (M-12, US-OCR-05/06)', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    mockBack.mockClear();
    consumePendingOcrReview();
  });

  it('affiche un état vide sans analyse en attente', () => {
    render(<OcrReviewScreen />);
    expect(screen.getByText(/Aucune analyse de couverture en attente/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('ocr-review-empty-back'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/camera');
  });

  it('pré-remplit les champs avec les propositions automatiques', () => {
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    expect(screen.getByTestId('ocr-review-input-title').props.value).toBe('Picsou Magazine');
    expect(screen.getByTestId('ocr-review-input-issueNumber').props.value).toBe('547');
    expect(screen.getByTestId('ocr-review-image').props.source.uri).toBe('file:///tmp/cover.jpg');
  });

  it('affiche un badge de confiance pour les champs en auto', () => {
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    expect(screen.getAllByText(/✓ 92 %/).length).toBeGreaterThan(0);
  });

  it('retire le badge auto quand l’utilisateur édite le champ', () => {
    // Un seul champ (titre) pour isoler le badge correspondant.
    seedPayload(['Picsou Magazine']);
    render(<OcrReviewScreen />);

    expect(screen.getByText(/✓ 92 %/)).toBeTruthy();
    fireEvent.changeText(screen.getByTestId('ocr-review-input-title'), 'Picsou Mag');
    expect(screen.queryByText(/✓ 92 %/)).toBeNull();
    expect(screen.getByTestId('ocr-review-input-title').props.value).toBe('Picsou Mag');
  });

  it('sélectionne une zone après activation : zone → champ (US-OCR-06)', () => {
    // Titre non reconnu (confiance basse) : on doit le pointer depuis la liste.
    seedPayload(['La Gazette du Quartier', 'N° 123']);
    render(<OcrReviewScreen />);

    fireEvent.press(screen.getByTestId('ocr-review-pick-title'));
    expect(screen.getByText(/Choisissez un texte/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('ocr-zone-b0-l0'));
    expect(screen.getByTestId('ocr-review-input-title').props.value).toBe('La Gazette du Quartier');
  });

  it('utilise la barre de zones pour affecter un numéro (badge photo)', () => {
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    fireEvent.changeText(screen.getByTestId('ocr-review-input-issueNumber'), '');
    fireEvent.press(screen.getByTestId('ocr-zone-b0-l1'));
    expect(screen.getByTestId('ocr-zone-toolbar')).toBeTruthy();

    fireEvent.press(screen.getByTestId('ocr-zone-as-issueNumber'));
    expect(screen.getByTestId('ocr-review-input-issueNumber').props.value).toBe('547');
    expect(screen.getByText('✓ photo')).toBeTruthy();
  });

  it('lance la recherche avec titre + numéro (US-OCR-04/07)', async () => {
    const search = jest.fn().mockResolvedValue({
      status: 'unknown',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });
    setDepsForTest(stubDeps(search));
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    fireEvent.press(screen.getByTestId('ocr-review-search'));
    await act(async () => {});

    expect(search).toHaveBeenCalledWith('Picsou Magazine', 547, null);
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/result',
      params: { publication: 'Picsou Magazine', issueNumber: '547' },
    });
  });

  it('oriente vers la fiche trouvée quand l’édition existe (US-OCR-07)', async () => {
    const search = jest.fn().mockResolvedValue({
      status: 'found',
      magazine: makeMagazine(),
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: '2023',
      confidence: 1,
    });
    setDepsForTest(stubDeps(search));
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    fireEvent.press(screen.getByTestId('ocr-review-search'));
    await act(async () => {});

    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/result',
      params: {
        id: 'mag-547',
        publication: 'Picsou Magazine',
        issueNumber: '547',
        barcode: '5901234123457',
      },
    });
  });

  it('désactive la recherche tant que titre ou numéro manque', () => {
    seedPayload(['Picsou Magazine']);
    render(<OcrReviewScreen />);

    expect(screen.getByTestId('ocr-review-search').props.accessibilityState.disabled).toBe(true);
  });

  it('Saisir manuellement pré-remplit la saisie (repli)', () => {
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    fireEvent.press(screen.getByTestId('ocr-review-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { publication: 'Picsou Magazine', issueNumber: '547' },
    });
  });

  it('retourne à la caméra depuis le bouton retour', () => {
    seedPayload(['Picsou Magazine', 'N° 547']);
    render(<OcrReviewScreen />);

    // canGoBack() est mocké à false : le retour tombe sur le repli caméra.
    fireEvent.press(screen.getByTestId('ocr-review-back'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/camera');
    expect(mockBack).not.toHaveBeenCalled();
  });
});
