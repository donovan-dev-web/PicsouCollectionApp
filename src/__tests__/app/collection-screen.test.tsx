import { fireEvent, render, screen } from '@testing-library/react-native';

import CollectionScreen from '@/app/(tabs)/collection/index';
import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';

const mockUseFocusEffect = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => mockUseFocusEffect(cb),
  useRouter: () => ({ push: jest.fn() }),
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
    mockUseFocusEffect.mockImplementation((cb: () => void) => cb());
    useCollectionStore.setState({
      magazines,
      loading: false,
      error: null,
      load: jest.fn(),
      loadRecent: jest.fn(),
    });
  });

  it('affiche la liste complete', () => {
    render(<CollectionScreen />);

    expect(screen.getByText('Ma Collection')).toBeTruthy();
    expect(screen.getAllByTestId('magazine-card')).toHaveLength(3);
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('Mickey Parade')).toBeTruthy();
  });

  it('filtre par numero exact', () => {
    render(<CollectionScreen />);

    fireEvent.changeText(screen.getByTestId('filter-issue'), '547');

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
  });

  it('filtre par edition via la liste deroulante', () => {
    render(<CollectionScreen />);

    fireEvent.press(screen.getByTestId('filter-edition'));
    fireEvent.press(screen.getByTestId('filter-edition-option-collection'));

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
    expect(screen.getByText('Mickey Parade')).toBeTruthy();
  });

  it('applique les filtres numero et edition simultanement', () => {
    render(<CollectionScreen />);

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

    fireEvent.changeText(screen.getByTestId('filter-issue'), '999');

    expect(screen.getByTestId('collection-empty')).toBeTruthy();
  });

  it('reinitialise le filtre edition via Toutes les editions', () => {
    render(<CollectionScreen />);

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

  beforeEach(() => {
    useCollectionStore.setState({
      magazines: many,
      loading: false,
      error: null,
      load: jest.fn(),
      loadRecent: jest.fn(),
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

    fireEvent.press(screen.getByTestId('pagination-page-3'));
    fireEvent.changeText(screen.getByTestId('filter-issue'), '45');

    expect(screen.getByTestId('pagination-page-1').props.accessibilityState?.selected).toBe(true);
    expect(screen.getByText('Magazine 45')).toBeTruthy();
  });
});
