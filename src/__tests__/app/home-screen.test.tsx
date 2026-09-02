import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';
import { useCollectionStore } from '@/store/use-collection-store';

const mockPush = jest.fn();
const mockUseFocusEffect = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  useFocusEffect: (callback: () => void) => mockUseFocusEffect(callback),
}));

describe('HomeScreen (compteur)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseFocusEffect.mockClear();
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

describe('HomeScreen (bouton Ajouter)', () => {
  it('affiche un bouton Ajouter', () => {
    useCollectionStore.setState({ loading: false, loaded: true });

    render(<HomeScreen />);

    expect(screen.getByTestId('add-button')).toBeTruthy();
    expect(screen.getByText('+ Ajouter')).toBeTruthy();
  });

  it('navigue vers la saisie manuelle au toucher', () => {
    useCollectionStore.setState({ loading: false, loaded: true });

    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('add-button'));

    expect(mockPush).toHaveBeenCalledWith('/scan/manual');
  });
});

describe('HomeScreen (ajouts recents)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockUseFocusEffect.mockImplementation((callback: () => void) => callback());
  });

  it('affiche la liste des derniers exemplaires ajoutes', () => {
    useCollectionStore.setState({
      loading: false,
      loaded: true,
      recentCopies: [
        {
          copy: {
            id: 'c1',
            magazineId: 'm1',
            condition: 'neuf',
            notes: null,
            dateAdded: '2026-09-01T10:00:00Z',
          },
          magazine: { id: 'm1', publication: 'Picsou Magazine', issueNumber: 547 },
        },
        {
          copy: {
            id: 'c2',
            magazineId: 'm2',
            condition: null,
            notes: 'coffret',
            dateAdded: '2026-08-20T10:00:00Z',
          },
          magazine: { id: 'm2', publication: 'Super Picsou Géant', issueNumber: null },
        },
      ],
    });

    render(<HomeScreen />);

    expect(screen.getAllByTestId('recent-item')).toHaveLength(2);
    expect(screen.getByText('Picsou Magazine n°547')).toBeTruthy();
    expect(screen.getByText('Super Picsou Géant')).toBeTruthy();
    expect(screen.getByText('2026-09-01')).toBeTruthy();
  });

  it('affiche un etat vide sans ajouts', () => {
    useCollectionStore.setState({ loading: false, loaded: true, recentCopies: [] });

    render(<HomeScreen />);

    expect(screen.getByTestId('recent-empty')).toBeTruthy();
  });
});
