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
    edition: null,
    country: 'FR',
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
    edition: null,
    country: null,
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
    country: null,
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

  it('filtre par titre', () => {
    render(<CollectionScreen />);

    fireEvent.changeText(screen.getByTestId('collection-search'), 'picsou');

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(2);
  });

  it('filtre par numero exact', () => {
    render(<CollectionScreen />);

    fireEvent.changeText(screen.getByTestId('collection-search'), '547');

    expect(screen.getAllByTestId('magazine-card')).toHaveLength(1);
  });

  it('affiche un message quand la recherche ne renvoie rien', () => {
    render(<CollectionScreen />);

    fireEvent.changeText(screen.getByTestId('collection-search'), 'zzz');

    expect(screen.getByTestId('collection-empty')).toBeTruthy();
  });

  it('affiche le badge Absent pour une edition sans exemplaire', () => {
    render(<CollectionScreen />);

    const cards = screen.getAllByTestId('magazine-card');
    expect(cards[2]).toBeTruthy();
    expect(screen.getAllByText(/Absent/).length).toBe(1);
    expect(screen.getAllByText(/Possédé/).length).toBeGreaterThanOrEqual(2);
  });
});
