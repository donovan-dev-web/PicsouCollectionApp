import { fireEvent, render, screen } from '@testing-library/react-native';

import ScanResultScreen from '@/app/scan/result';
import { useCollectionStore } from '@/store/use-collection-store';

const mockReplace = jest.fn();
const mockLoadDetail = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => cb(),
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams(),
}));

let params: Record<string, string> = {};
function mockParams() {
  return params;
}

const magazine = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: null,
  language: null,
  condition: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
};

describe('ScanResultScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLoadDetail.mockClear();
    params = {};
    useCollectionStore.setState({
      detail: null,
      detailLoading: false,
      loadDetail: mockLoadDetail,
    });
  });

  it('charge le detail au focus quand une edition existe', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    mockLoadDetail.mockResolvedValue(magazine);

    render(<ScanResultScreen />);

    expect(mockLoadDetail).toHaveBeenCalledWith('mag-1');
  });

  it('affiche un magazine possede avec son statut résolu', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: magazine, detailLoading: false });

    render(<ScanResultScreen />);

    expect(screen.getByText('Déjà dans votre collection')).toBeTruthy();
    expect(screen.getByTestId('result-magazine')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByText('N° 547')).toBeTruthy();
    expect(screen.getByTestId('result-status-owned')).toHaveTextContent('✓ Possédé');
    fireEvent.press(screen.getByTestId('result-view'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-1');
  });

  it('affiche la vérification tant que le statut n est pas résolu', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: null, detailLoading: true });

    render(<ScanResultScreen />);

    expect(screen.getByTestId('result-loading')).toHaveTextContent('Vérification…');
  });

  it('propose rescanner depuis un résultat existant', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine' };
    useCollectionStore.setState({ detail: magazine, detailLoading: false });

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-rescan'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/barcode');
  });

  it('ouvre la saisie manuelle avec le code-barres depuis un résultat existant', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', barcode: '5901234123457' };
    useCollectionStore.setState({ detail: magazine, detailLoading: false });

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { barcode: '5901234123457' },
    });
  });

  it('affiche un magazine absent avec son code-barres', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    expect(screen.getByText('Absent de la collection')).toBeTruthy();
    expect(screen.getByText(/5901234123457/)).toBeTruthy();
  });

  it('n affiche pas les boutons fiche/rescan pour un magazine absent', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    expect(screen.queryByTestId('result-view')).toBeNull();
    expect(screen.queryByTestId('result-rescan')).toBeNull();
    fireEvent.press(screen.getByTestId('result-camera'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/camera');
  });

  it('ouvre la saisie manuelle avec le code depuis un résultat absent', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { barcode: '5901234123457' },
    });
  });

  it('n affiche pas la caméra/OCR pour une édition existante', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: magazine, detailLoading: false });

    render(<ScanResultScreen />);

    expect(screen.queryByTestId('result-camera')).toBeNull();
  });
});
