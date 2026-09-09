import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/(tabs)/index';
import { useCollectionStore } from '@/store/use-collection-store';
import type { Magazine } from '@/types';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
  // No-op : en prod useFocusEffect s'exécute après le rendu (effet), jamais
  // pendant. L'ancien mock invoquait le callback en phase de rendu, ce qui
  // créait un setState-dans-render artificiel (boucle infinie en test).
  useFocusEffect: () => {},
}));

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'm1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: null,
    language: null,
    condition: null,
    publicationDate: null,
    barcode: null,
    notes: null,
    ocrText: null,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    ...overrides,
  };
}

describe('HomeScreen (compteur)', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('affiche le nombre d éditions possedées', () => {
    useCollectionStore.setState({ totalMagazines: 12, loading: false, loaded: true });

    render(<HomeScreen />);

    expect(screen.getByTestId('collection-counter')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('éditions possédées')).toBeTruthy();
  });

  it('affiche le chargement lorsque la collection est en cours de chargement', () => {
    useCollectionStore.setState({ totalMagazines: 0, loading: true, loaded: false });

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
    expect(screen.getByText('Scanner')).toBeTruthy();
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
    expect(screen.getByText('Ajouter')).toBeTruthy();
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
  });

  it('affiche la liste des dernieres editions ajoutees', () => {
    useCollectionStore.setState({
      loading: false,
      loaded: true,
      recent: [
        makeMagazine(),
        makeMagazine({
          id: 'm2',
          publication: 'Super Picsou Géant',
          issueNumber: null,
          createdAt: '2026-08-20T10:00:00Z',
        }),
      ],
    });

    render(<HomeScreen />);

    expect(screen.getAllByTestId('recent-item')).toHaveLength(2);
    expect(screen.getByText('Picsou Magazine n°547')).toBeTruthy();
    expect(screen.getByText('Super Picsou Géant')).toBeTruthy();
    expect(screen.getByText('1 sept. 2026')).toBeTruthy();
  });

  it('navigue vers le detail de l edition au tap sur un ajout recent', () => {
    useCollectionStore.setState({
      loading: false,
      loaded: true,
      recent: [makeMagazine()],
    });

    render(<HomeScreen />);

    fireEvent.press(screen.getAllByTestId('recent-item')[0]);

    expect(mockPush).toHaveBeenCalledWith('/collection/m1');
  });

  it('affiche un etat vide sans ajouts', () => {
    useCollectionStore.setState({ loading: false, loaded: true, recent: [] });

    render(<HomeScreen />);

    expect(screen.getByTestId('recent-empty')).toBeTruthy();
  });

  it('propose de scanner depuis l etat vide', () => {
    useCollectionStore.setState({ loading: false, loaded: true, recent: [] });

    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('recent-empty-cta'));

    expect(mockPush).toHaveBeenCalledWith('/scan');
  });

  it('affiche un message quand la base ne répond pas', () => {
    useCollectionStore.setState({ loading: false, loaded: true, error: 'Base inaccessible' });

    render(<HomeScreen />);

    expect(screen.getByTestId('counter-error')).toBeTruthy();
    expect(screen.getByText('Base inaccessible')).toBeTruthy();
  });

  it('propose un accès rapide au scan dans l’en-tête (FAB)', () => {
    useCollectionStore.setState({ loading: false, loaded: true });

    render(<HomeScreen />);

    fireEvent.press(screen.getByTestId('header-scan'));

    expect(mockPush).toHaveBeenCalledWith('/scan');
  });
});
