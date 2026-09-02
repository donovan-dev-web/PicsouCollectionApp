import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockFindByBarcode = jest.fn();
const mockMagazineRepo = {
  list: mockList,
  create: mockCreate,
  delete: mockDelete,
  findByBarcode: mockFindByBarcode,
};

const mockListRecentCopies = jest.fn();
const mockAddCopy = jest.fn();
const mockCollectionRepo = {
  listRecentCopies: mockListRecentCopies,
  addCopy: mockAddCopy,
  countByMagazine: jest.fn(),
  listByMagazine: jest.fn(),
  deleteCopy: jest.fn(),
};

jest.mock('@/dependencies', () => ({
  getDeps: jest.fn(() => ({
    magazineRepository: mockMagazineRepo,
    collectionRepository: mockCollectionRepo,
  })),
}));

const magazine: MagazineListItem = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: null,
  country: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
  quantity: 4,
};

describe('useCollectionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCollectionStore.setState({
      magazines: [],
      totalCopies: 0,
      loading: false,
      error: null,
      loaded: false,
    });
  });

  it('charge la collection et calcule le nombre total d exemplaires', async () => {
    mockList.mockResolvedValue([magazine]);

    await useCollectionStore.getState().load();

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalCopies).toBe(4);
    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('signale un echec de chargement', async () => {
    mockList.mockRejectedValue(new Error('base indisponible'));

    await useCollectionStore.getState().load();

    const state = useCollectionStore.getState();
    expect(state.error).toBe('base indisponible');
    expect(state.loading).toBe(false);
    expect(state.loaded).toBe(false);
  });

  it('ajoute une edition et un exemplaire, puis incremente le compteur', async () => {
    const created = { ...magazine, quantity: 1 };
    mockCreate.mockResolvedValue(created);
    mockAddCopy.mockResolvedValue({
      id: 'c1',
      magazineId: 'mag-1',
      condition: null,
      notes: null,
      dateAdded: 'x',
    });

    await useCollectionStore
      .getState()
      .addMagazine({ publication: 'Picsou Magazine', issueNumber: 547 });

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalCopies).toBe(1);
    expect(mockAddCopy).toHaveBeenCalledWith('mag-1');
  });

  it('supprime une edition et decremente le compteur', async () => {
    useCollectionStore.setState({ magazines: [magazine], totalCopies: 4 });
    mockDelete.mockResolvedValue(undefined);

    await useCollectionStore.getState().removeMagazine('mag-1');

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(0);
    expect(state.totalCopies).toBe(0);
  });

  it('charge les derniers exemplaires ajoutes', async () => {
    mockListRecentCopies.mockResolvedValue([
      {
        copy: {
          id: 'c1',
          magazineId: 'mag-1',
          condition: null,
          notes: null,
          dateAdded: '2026-09-01T10:00:00Z',
        },
        magazine: { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: 547 },
      },
    ]);

    await useCollectionStore.getState().loadRecent();

    expect(useCollectionStore.getState().recentCopies).toHaveLength(1);
    expect(mockListRecentCopies).toHaveBeenCalledWith(5);
  });
});
