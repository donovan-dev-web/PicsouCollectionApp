import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ScanResultScreen from '@/app/scan/result';
import { useCollectionStore } from '@/store/use-collection-store';

const mockReplace = jest.fn();
const mockLoadDetail = jest.fn();
const mockAddExistingCopy = jest.fn();

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
  copies: [],
};

const detailWithCopies = {
  ...magazine,
  copies: [{ id: 'c1', magazineId: 'mag-1', notes: null, dateAdded: 'x' }],
};

describe('ScanResultScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockLoadDetail.mockClear();
    mockAddExistingCopy.mockClear();
    mockAddExistingCopy.mockResolvedValue(undefined);
    params = {};
    useCollectionStore.setState({
      detail: null,
      detailLoading: false,
      loadDetail: mockLoadDetail,
      addExistingCopy: mockAddExistingCopy,
    });
  });

  it('charge le detail au focus quand une edition existe', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    mockLoadDetail.mockResolvedValue(detailWithCopies);

    render(<ScanResultScreen />);

    expect(mockLoadDetail).toHaveBeenCalledWith('mag-1');
  });

  it('affiche un magazine possede avec le nombre d exemplaires', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: detailWithCopies, detailLoading: false });

    render(<ScanResultScreen />);

    expect(screen.getByText('Déjà dans votre collection')).toBeTruthy();
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByTestId('result-status-owned')).toHaveTextContent('✓ Possédé (1)');
    fireEvent.press(screen.getByTestId('result-view'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-1');
  });

  it('demande la confirmation doublon puis ajoute un exemplaire pour un magazine possede', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: detailWithCopies, detailLoading: false });
    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-add-copy'));

    expect(alertSpy).toHaveBeenCalled();
    const message = alertSpy.mock.calls[0][1];
    expect(message).toContain('Exemplaires actuels : 1');
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const confirm = buttons?.find((b) => b.text === 'Ajouter quand même');
    expect(confirm).toBeDefined();
    await confirm?.onPress?.();

    expect(mockAddExistingCopy).toHaveBeenCalledWith('mag-1');
    alertSpy.mockRestore();
  });

  it('ajoute directement une edition absente sans confirmation', async () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: '547' };
    useCollectionStore.setState({ detail: magazine, detailLoading: false });
    render(<ScanResultScreen />);

    expect(screen.getByTestId('result-status-absent')).toHaveTextContent('○ Absent');
    fireEvent.press(screen.getByTestId('result-add'));

    expect(mockAddExistingCopy).toHaveBeenCalledWith('mag-1');
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

  it('n affiche pas le bouton fiche pour un magazine absent', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    expect(screen.queryByTestId('result-view')).toBeNull();
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

  it('propose la caméra/OCR puis le manuel après échec du code-barres (absent)', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    // US-ID-05 : la méthode échouée (code-barres) n'est pas reproposée.
    expect(screen.queryByTestId('result-rescan')).toBeNull();
    fireEvent.press(screen.getByTestId('result-camera'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/camera');
  });
});
