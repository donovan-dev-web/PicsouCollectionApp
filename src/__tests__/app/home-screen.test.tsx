import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { useCollectionStore } from '@/store/use-collection-store';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HomeScreen (compteur)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('affiche le nombre d exemplaires possedes', () => {
    useCollectionStore.setState({ totalCopies: 12, loading: false, loaded: true });

    render(<HomeScreen />);

    expect(screen.getByTestId('collection-counter')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('exemplaires possédés')).toBeTruthy();
  });

  it('affiche le chargement lorsque la collection est en cours de chargement', () => {
    useCollectionStore.setState({ totalCopies: 0, loading: true, loaded: false });

    render(<HomeScreen />);

    expect(screen.getByTestId('counter-loading')).toBeTruthy();
  });
});

describe('HomeScreen (bouton Scanner)', () => {
  it('affiche un bouton Scanner proeminent', () => {
    useCollectionStore.setState({ loading: false, loaded: true });

    render(<HomeScreen />);

    const button = screen.getByTestId('scan-button');
    expect(button).toBeTruthy();
    expect(screen.getByText('📷 Scanner')).toBeTruthy();
  });

  it('navigue vers l ecran de choix de methode au toucher', () => {
    useCollectionStore.setState({ loading: false, loaded: true });

    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('scan-button'));

    expect(mockPush).toHaveBeenCalledWith('/scan');
  });
});
