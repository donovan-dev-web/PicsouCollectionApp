import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import ManualEntryScreen from '@/app/scan/manual';
import { useCollectionStore } from '@/store/use-collection-store';

const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

describe('ManualEntryScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
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
});
