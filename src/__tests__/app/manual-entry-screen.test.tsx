import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ManualEntryScreen from '@/app/scan/manual';
import { useCollectionStore } from '@/store/use-collection-store';

const mockBack = jest.fn();

export const mockLocalSearchParams: { current: Record<string, string | undefined> } = {
  current: {},
};

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockLocalSearchParams.current,
  useFocusEffect: (callback: () => void) => callback(),
  useRouter: () => ({ back: mockBack }),
}));

describe('ManualEntryScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockLocalSearchParams.current = {};
    useCollectionStore.setState({
      addMagazine: jest.fn(),
    });
  });

  it('affiche le titre de la saisie manuelle', () => {
    useCollectionStore.setState({ addMagazine: jest.fn() });
    render(<ManualEntryScreen />);

    expect(screen.getByText('Ajouter une édition')).toBeTruthy();
    expect(screen.getByTestId('form-submit')).toBeTruthy();
  });

  it('ajoute le magazine puis retourne en arriere', async () => {
    const addMagazine = jest.fn().mockResolvedValue({
      id: 'mag-1',
      publication: 'Picsou Magazine',
      quantity: 1,
    });
    useCollectionStore.setState({ addMagazine });

    render(<ManualEntryScreen />);

    fireEvent.changeText(screen.getByTestId('field-publication'), 'Picsou Magazine');
    fireEvent.press(screen.getByTestId('form-submit'));

    await waitFor(() => expect(addMagazine).toHaveBeenCalledTimes(1));
    expect(mockBack).toHaveBeenCalled();
  });

  it('pré-remplit le formulaire avec les infos extraites par l’OCR', () => {
    mockLocalSearchParams.current = {
      publication: 'Picsou Magazine',
      issueNumber: '900',
      year: '2023',
    };

    render(<ManualEntryScreen />);

    expect(screen.getByTestId('field-publication')).toHaveProp('value', 'Picsou Magazine');
    expect(screen.getByTestId('field-issue-number')).toHaveProp('value', '900');
  });
});
