import { fireEvent, render, screen, within } from '@testing-library/react-native';

import CollectionScreen from '@/app/(tabs)/collection/index';
import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';

const mockUseFocusEffect = jest.fn();
const mockUseLocalSearchParams = jest.fn<Record<string, string | string[] | undefined>, []>();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => mockUseFocusEffect(cb),
  useRouter: () => ({ push: mockPush, setParams: jest.fn() }),
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

const magazines: MagazineListItem[] = [
  {
    id: 'm1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: null,
    publicationDate: null,
    barcode: '3271234000011',
    notes: null,
    ocrText: null,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    quantity: 1,
  },
  {
    id: 'm2',
    publication: 'Mickey Parade',
    issueNumber: 2,
    edition: 'collection',
    language: null,
    condition: null,
    publicationDate: null,
    barcode: null,
    notes: null,
    ocrText: null,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    quantity: 2,
  },
  {
    id: 'm3',
    publication: 'Super Picsou Géant',
    issueNumber: null,
    edition: null,
    language: null,
    condition: null,
    publicationDate: null,
    barcode: null,
    notes: null,
    ocrText: null,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
    quantity: 0,
  },
];

describe('CollectionScreen', () => {
  beforeEach(() => {
    mockUseFocusEffect.mockClear();
    mockPush.mockClear();
    mockUseFocusEffect.mockImplementation((cb: () => void) => cb());
    mockUseLocalSearchParams.mockReturnValue({});
    useCollectionStore.setState({
      magazines,
      loading: false,
      error: null,
      load: jest.fn(),
    });
  });

  const openFilters = () => fireEvent.press(screen.getByTestId('filter-toggle'));

  it('affiche la liste complete', () => {
    render(<CollectionScreen />);

    expect(screen.getByText('Ma Collection')).toBeTruthy();
    expect(screen.getAllByTestId('magazine-card')).toHaveLength(3);
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('Mickey Parade')).toBeTruthy();
  });

  it('masque les champs de filtre par defaut et les deroule via Rechercher', () => {
    render(<CollectionScreen />);

    expect(screen.queryByTestId('filter-issue')).toBeNull();
    expect(screen.queryByTestId('filter-edition')).toBeNull();
    expect(screen.queryByTestId('filter-sort')).toBeNull();

    openFilters();

    expect(screen.getByTestId('filter-issue')).toBeTruthy();
    expect(screen.getByTestId('filter-edition')).toBeTruthy();
    expect(screen.getByTestId('filter-sort')).toBeTruthy();
  });

  it('pre-filtre la collection via le param edition du drawer', () => {
    mockUseLocalSearchParams.mockReturnValue({ edition: 'collection' });

    render(<CollectionScreen />);

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Mickey Parade')).toBeTruthy();
  });

  it('pre-filtre sans edition (null) via le param edition', () => {
    mockUseLocalSearchParams.mockReturnValue({ edition: 'Sans édition' });

    render(<CollectionScreen />);

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Super Picsou Géant')).toBeTruthy();
  });

  it('filtre par numero exact', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '547');

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
  });

  it('filtre par edition via la liste deroulante', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-collection'));

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Mickey Parade')).toBeTruthy();
  });

  it('applique les filtres numero et edition simultanement', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '547');
    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-standard'));

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '999');
    expect(screen.getByTestId('collection-empty')).toBeTruthy();
  });

  it('affiche un message quand un filtre ne renvoie rien', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '999');

    expect(screen.getByTestId('collection-empty')).toBeTruthy();
  });

  it('reinitialise le filtre edition via Toutes les editions', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-collection'));
    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);

    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-Toutes les éditions'));
    expect(screen.getAllByTestId('magazine-card')).toHaveLength(3);
  });

  it('affiche le badge Absent pour une edition sans exemplaire', () => {
    render(<CollectionScreen />);

    const cards = screen.getAllByTestId('magazine-card');
    expect(cards[2]).toBeTruthy();
    expect(screen.getAllByText(/Absent/).length).toBe(1);
    expect(screen.getAllByText(/Possédé/).length).toBeGreaterThanOrEqual(2);
  });

  it('trie par numero decroissant', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('filter-sort'));
    fireEvent.press(screen.getByTestId('filter-sort-option-Numéro ↓'));

    const cards = screen.getAllByTestId('magazine-card');
    expect(within(cards[0]).getByText('Picsou Magazine')).toBeTruthy();
  });

  it('combine tri decroissant et filtre edition', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-collection'));
    fireEvent.press(screen.getByTestId('filter-sort'));
    fireEvent.press(screen.getByTestId('filter-sort-option-Numéro ↓'));

    const cards = screen.getAllByTestId('magazine-card');
    expect(cards).toHaveLength(1);
    expect(within(cards[0]).getByText('Mickey Parade')).toBeTruthy();
  });

  it('propose un accès rapide au scan dans l’en-tête (FAB)', () => {
    render(<CollectionScreen />);

    fireEvent.press(screen.getByTestId('header-scan'));

    expect(mockPush).toHaveBeenCalledWith('/scan');
  });
});

describe('CollectionScreen (pagination)', () => {
  const many: MagazineListItem[] = Array.from({ length: 45 }, (_, i) => ({
    id: `p${i}`,
    publication: `Magazine ${i + 1}`,
    issueNumber: i + 1,
    edition: null,
    language: null,
    condition: null,
    publicationDate: null,
    barcode: null,
    notes: null,
    ocrText: null,
    createdAt: `2026-09-01T10:00:0${i % 10}Z`,
    updatedAt: '2026-09-01T10:00:00Z',
    quantity: 1,
  }));

  const openFilters = () => fireEvent.press(screen.getByTestId('filter-toggle'));

  beforeEach(() => {
    useCollectionStore.setState({
      magazines: many,
      loading: false,
      error: null,
      load: jest.fn(),
    });
  });

  it('affiche la premiere page et pas les pages suivantes', () => {
    render(<CollectionScreen />);

    expect(screen.getByText('Magazine 1')).toBeTruthy();
    // le premier element de la page 2 n est pas affiche sur la page 1
    expect(screen.queryByText('Magazine 22')).toBeNull();
  });

  it('navigue entre les pages et met a jour la liste', () => {
    render(<CollectionScreen />);

    fireEvent.press(screen.getByTestId('pagination-page-3'));

    expect(screen.getByText('Magazine 41')).toBeTruthy();
    expect(screen.queryByText('Magazine 1')).toBeNull();
  });

  it('desactive le bouton precedent sur la premiere page', () => {
    render(<CollectionScreen />);

    fireEvent.press(screen.getByTestId('pagination-page-2'));
    expect(screen.getByTestId('pagination-prev').props.accessibilityState?.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('pagination-page-1'));
    expect(screen.getByTestId('pagination-prev').props.accessibilityState?.disabled).toBe(true);
  });

  it('revient a la page 1 quand un filtre est applique', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('pagination-page-3'));
    fireEvent.changeText(screen.getByTestId('filter-issue'), '45');

    expect(screen.getByText('Magazine 45')).toBeTruthy();
    expect(screen.getByTestId('collection-result-count')).toHaveTextContent('1 résultat');
  });

  it('masque la pagination quand une seule page suffit', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '45');

    expect(screen.queryByTestId('pagination-page-1')).toBeNull();
    expect(screen.queryByTestId('pagination-prev')).toBeNull();
  });

  it('efface les filtres via le bouton dédié', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.changeText(screen.getByTestId('filter-issue'), '45');
    fireEvent.press(screen.getByTestId('filter-clear'));

    expect(screen.getByTestId('pagination-page-1')).toBeTruthy();
  });

  it('revient a la page 1 au changement de tri', () => {
    render(<CollectionScreen />);
    openFilters();

    fireEvent.press(screen.getByTestId('pagination-page-3'));
    expect(screen.getByTestId('pagination-page-3').props.accessibilityState?.selected).toBe(true);

    fireEvent.press(screen.getByTestId('filter-sort'));
    fireEvent.press(screen.getByTestId('filter-sort-option-Ajout récent'));

    expect(screen.getByTestId('pagination-page-1').props.accessibilityState?.selected).toBe(true);
  });
});
