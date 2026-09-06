import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import ScanSearchScreen from '@/app/scan/search';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import { useCollectionStore } from '@/store/use-collection-store';
import type { Magazine } from '@/types';

const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockLoadDetail = jest.fn();
const mockAddExistingCopy = jest.fn();
const mockSearchByOcrFields = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => cb(),
  useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: () => true }),
}));

const magazine: Magazine = {
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

const detailWithCopies = {
  ...magazine,
  copies: [{ id: 'c1', magazineId: 'mag-1', notes: null, dateAdded: 'x' }],
};

function stubDeps() {
  setDepsForTest({
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    identificationService: {
      searchByOcrFields: mockSearchByOcrFields,
    } as unknown as Dependencies['identificationService'],
    ocrEngine: {} as Dependencies['ocrEngine'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
  });
}

describe('ScanSearchScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    mockLoadDetail.mockClear();
    mockAddExistingCopy.mockClear();
    mockAddExistingCopy.mockResolvedValue(undefined);
    mockSearchByOcrFields.mockResolvedValue({ status: 'no-text' });
    stubDeps();
    useCollectionStore.setState({
      magazines: [{ ...magazine, quantity: 0 }],
      detail: null,
      detailLoading: false,
      loadDetail: mockLoadDetail,
      addExistingCopy: mockAddExistingCopy,
    });
  });

  it('désactive la recherche tant que publication et numéro sont vides', () => {
    render(<ScanSearchScreen />);

    expect(screen.getByTestId('search-hint')).toBeTruthy();
    fireEvent.press(screen.getByTestId('search-submit'));
    expect(mockSearchByOcrFields).not.toHaveBeenCalled();
  });

  it('recherche par publication + numéro et affiche le résultat trouvé (absent)', async () => {
    mockSearchByOcrFields.mockResolvedValue({
      status: 'found',
      magazine,
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });
    useCollectionStore.setState({ detail: { ...magazine, copies: [] }, detailLoading: false });

    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-publication'), 'onChangeText', 'Picsou Magazine');
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(mockSearchByOcrFields).toHaveBeenCalledWith('Picsou Magazine', 547, null);
    expect(screen.getByTestId('search-magazine')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByTestId('search-status-absent')).toHaveTextContent('○ Absent');
    fireEvent.press(screen.getByTestId('search-view'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-1');
  });

  it('affiche Possédé avec le nombre d exemplaires pour une édition déjà en collection', async () => {
    mockSearchByOcrFields.mockResolvedValue({
      status: 'found',
      magazine: detailWithCopies,
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });
    useCollectionStore.setState({ detail: detailWithCopies, detailLoading: false });

    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-publication'), 'onChangeText', 'Picsou Magazine');
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByTestId('search-status-owned')).toHaveTextContent('✓ Possédé (1)');
    expect(screen.getByText('Ajouter un exemplaire')).toBeTruthy();
  });

  it('demande la confirmation doublon pour un magazine possédé', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    mockSearchByOcrFields.mockResolvedValue({
      status: 'found',
      magazine: detailWithCopies,
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });
    useCollectionStore.setState({ detail: detailWithCopies, detailLoading: false });

    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-publication'), 'onChangeText', 'Picsou Magazine');
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-add'));
    });

    expect(alertSpy).toHaveBeenCalled();
    const message = alertSpy.mock.calls[0][1];
    expect(message).toContain('Exemplaires actuels : 1');
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const confirm = buttons?.find((b) => b.text === 'Ajouter quand même');
    expect(confirm).toBeDefined();
    await act(async () => {
      await confirm?.onPress?.();
    });
    expect(mockAddExistingCopy).toHaveBeenCalledWith('mag-1');
    alertSpy.mockRestore();
  });

  it('propose le repli vers la saisie manuelle pré-remplie quand rien n est trouvé', async () => {
    mockSearchByOcrFields.mockResolvedValue({
      status: 'unknown',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });

    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-publication'), 'onChangeText', 'Picsou Magazine');
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByText('Non référencé')).toBeTruthy();
    fireEvent.press(screen.getByTestId('search-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { publication: 'Picsou Magazine', issueNumber: '547' },
    });
  });

  it('relance une recherche après un résultat non référencé', async () => {
    mockSearchByOcrFields.mockResolvedValue({
      status: 'unknown',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: null,
      confidence: 1,
    });

    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-publication'), 'onChangeText', 'Picsou Magazine');
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByTestId('search-again')).toBeTruthy();
    fireEvent.press(screen.getByTestId('search-again'));
    expect(screen.getByTestId('search-submit')).toBeTruthy();
  });

  it('permet d annuler pour revenir en arrière', () => {
    render(<ScanSearchScreen />);
    fireEvent.press(screen.getByTestId('search-cancel'));
    expect(mockBack).toHaveBeenCalled();
  });
});
