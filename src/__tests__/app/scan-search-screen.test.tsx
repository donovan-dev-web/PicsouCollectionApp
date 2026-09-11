import { act, fireEvent, render, screen } from '@testing-library/react-native';

import ScanSearchScreen from '@/app/scan/search';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import { useCollectionStore } from '@/store/use-collection-store';
import type { Magazine } from '@/types';

const mockBack = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace, canGoBack: () => true }),
}));

const magazine: Magazine = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: 'standard',
  language: null,
  condition: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
};

function stubDeps() {
  setDepsForTest({
    magazineRepository: {} as Dependencies['magazineRepository'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: {} as Dependencies['ocrEngine'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
  });
}

describe('ScanSearchScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    stubDeps();
    useCollectionStore.setState({
      magazines: [magazine],
    });
  });

  it('désactive la recherche tant que le numéro est vide', () => {
    render(<ScanSearchScreen />);

    expect(screen.getByTestId('search-hint')).toBeTruthy();
    fireEvent.press(screen.getByTestId('search-submit'));
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('recherche par numéro toutes éditions confondues et affiche le résultat trouvé', async () => {
    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByTestId('search-magazine')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByTestId('search-status-owned')).toHaveTextContent('✓ Possédé');
    fireEvent.press(screen.getByTestId('search-view'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-1');
  });

  it('recherche par numéro + édition spécifique', async () => {
    render(<ScanSearchScreen />);
    fireEvent.press(screen.getByTestId('search-edition'));
    fireEvent.press(screen.getByTestId('search-edition-option-standard'));
    await act(async () => {
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '547');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByTestId('search-magazine')).toHaveTextContent('Picsou Magazine');
  });

  it('propose le repli vers la saisie manuelle pré-remplie quand rien n est trouvé', async () => {
    render(<ScanSearchScreen />);
    fireEvent.press(screen.getByTestId('search-edition'));
    fireEvent.press(screen.getByTestId('search-edition-option-standard'));
    await act(async () => {
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '972');
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('search-submit'));
    });

    expect(screen.getByText('Non référencé')).toBeTruthy();
    fireEvent.press(screen.getByTestId('search-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { issueNumber: '972' },
    });
  });

  it('relance une recherche après un résultat non référencé', async () => {
    render(<ScanSearchScreen />);
    await act(async () => {
      fireEvent(screen.getByTestId('search-issue'), 'onChangeText', '972');
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
