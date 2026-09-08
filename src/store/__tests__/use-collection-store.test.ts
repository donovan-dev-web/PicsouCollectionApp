import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockMagazineRepo = {
  list: mockList,
  create: mockCreate,
  delete: mockDelete,
  findById: mockFindById,
  update: mockUpdate,
};

const mockListRecentCopies = jest.fn();
const mockCountAllCopies = jest.fn();
const mockAddCopy = jest.fn();
const mockCollectionRepo = {
  listRecentCopies: mockListRecentCopies,
  countAllCopies: mockCountAllCopies,
  addCopy: mockAddCopy,
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
  language: null,
  condition: null,
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

  it('charge un resume leger (compteur + recents) sans lister les editions', async () => {
    mockCountAllCopies.mockResolvedValue(7);
    mockListRecentCopies.mockResolvedValue([
      {
        copy: {
          id: 'c1',
          magazineId: 'mag-1',
          notes: null,
          dateAdded: '2026-09-01T10:00:00Z',
        },
        magazine: { id: 'mag-1', publication: 'Picsou Magazine', issueNumber: 547 },
      },
    ]);

    await useCollectionStore.getState().loadSummary();

    const state = useCollectionStore.getState();
    expect(state.totalCopies).toBe(7);
    expect(state.recentCopies).toHaveLength(1);
    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
    expect(mockList).not.toHaveBeenCalled();
    expect(mockListRecentCopies).toHaveBeenCalledWith(5);
    expect(mockCountAllCopies).toHaveBeenCalledTimes(1);
  });

  it('signale un echec de chargement du resume', async () => {
    mockCountAllCopies.mockRejectedValue(new Error('base indisponible'));

    await useCollectionStore.getState().loadSummary();

    const state = useCollectionStore.getState();
    expect(state.error).toBe('base indisponible');
    expect(state.loading).toBe(false);
    expect(state.loaded).toBe(false);
  });

  it('charge le detail d une edition avec ses copies', async () => {
    mockFindById.mockResolvedValue({ ...magazine, copies: [] });

    const detail = await useCollectionStore.getState().loadDetail('mag-1');

    expect(detail).toMatchObject({ publication: 'Picsou Magazine' });
    expect(useCollectionStore.getState().detail).toMatchObject({ publication: 'Picsou Magazine' });
    expect(useCollectionStore.getState().detailLoading).toBe(false);
    expect(mockFindById).toHaveBeenCalledWith('mag-1');
  });

  it('met le detail a null en cas de defaut', async () => {
    mockFindById.mockRejectedValue(new Error('detail indisponible'));

    const detail = await useCollectionStore.getState().loadDetail('mag-1');

    expect(detail).toBeNull();
    expect(useCollectionStore.getState().error).toBe('detail indisponible');
    expect(useCollectionStore.getState().detailLoading).toBe(false);
  });

  it('modifie une edition et rafraichit la liste et le detail', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine, copies: [] },
    });

    await useCollectionStore.getState().updateMagazine('mag-1', {
      publication: 'Mickey Parade',
    });

    const state = useCollectionStore.getState();
    expect(mockUpdate).toHaveBeenCalledWith('mag-1', { publication: 'Mickey Parade' });
    expect(state.magazines[0].publication).toBe('Mickey Parade');
    expect(state.magazines[0].quantity).toBe(4);
    expect(state.detail?.publication).toBe('Mickey Parade');
  });

  it('signale une edition introuvable lors de la modification', async () => {
    mockUpdate.mockResolvedValue(null);

    await expect(
      useCollectionStore.getState().updateMagazine('inconnue', { publication: 'X' }),
    ).rejects.toThrow('Édition introuvable.');
  });

  it('ajoute un exemplaire a une edition existante et incremente le compteur', async () => {
    mockAddCopy.mockResolvedValue({
      id: 'c2',
      magazineId: 'mag-1',
      notes: null,
      dateAdded: '2026-09-02T10:00:00Z',
    });
    useCollectionStore.setState({ magazines: [magazine], totalCopies: 4 });

    await useCollectionStore.getState().addExistingCopy('mag-1');

    const state = useCollectionStore.getState();
    expect(mockAddCopy).toHaveBeenCalledWith('mag-1');
    expect(state.magazines[0].quantity).toBe(5);
    expect(state.totalCopies).toBe(5);
  });

  it('rafraichit le detail avec la copie ajoutee si elle correspond', async () => {
    const copy = {
      id: 'c2',
      magazineId: 'mag-1',
      notes: null,
      dateAdded: '2026-09-02T10:00:00Z',
    };
    mockAddCopy.mockResolvedValue(copy);
    useCollectionStore.setState({
      magazines: [magazine],
      totalCopies: 4,
      detail: { ...magazine, copies: [] },
    });

    await useCollectionStore.getState().addExistingCopy('mag-1');

    const state = useCollectionStore.getState();
    expect(state.detail?.copies).toEqual([copy]);
  });

  it('traduit une erreur inconnue en message générique', async () => {
    mockList.mockRejectedValue('panne');

    await useCollectionStore.getState().load();

    expect(useCollectionStore.getState().error).toBe('Erreur inconnue');
  });

  it('relance l’erreur quand l’ajout d’une edition échoue', async () => {
    mockCreate.mockRejectedValue(new Error('Code-barres déjà enregistré.'));

    await expect(
      useCollectionStore.getState().addMagazine({ publication: 'Picsou Magazine' }),
    ).rejects.toThrow('Code-barres déjà enregistré.');
  });

  it('incrémente le compteur sans toucher aux autres editions ni au detail', async () => {
    mockAddCopy.mockResolvedValue({ id: 'c3', magazineId: 'mag-x', notes: null, dateAdded: 'x' });
    useCollectionStore.setState({
      magazines: [magazine],
      totalCopies: 4,
      detail: { ...magazine, copies: [] },
    });

    await useCollectionStore.getState().addExistingCopy('mag-x');

    const state = useCollectionStore.getState();
    expect(state.magazines[0].quantity).toBe(4);
    expect(state.totalCopies).toBe(5);
    expect(state.detail?.id).toBe('mag-1');
  });

  it('conserve le detail d’une autre edition lors d’une modification', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine, copies: [], id: 'mag-9' },
    });

    await useCollectionStore.getState().updateMagazine('mag-1', { publication: 'Mickey Parade' });

    expect(useCollectionStore.getState().detail?.id).toBe('mag-9');
  });

  it('ne change pas le compteur si l’edition à supprimer est introuvable', async () => {
    mockDelete.mockResolvedValue(undefined);
    useCollectionStore.setState({ magazines: [magazine], totalCopies: 4 });

    await useCollectionStore.getState().removeMagazine('inconnue');

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalCopies).toBe(4);
  });

  it('traduit une erreur inconnue lors du chargement du resume', async () => {
    mockCountAllCopies.mockRejectedValue('panne');

    await useCollectionStore.getState().loadSummary();

    expect(useCollectionStore.getState().error).toBe('Erreur inconnue');
  });

  it('traduit une erreur inconnue lors du chargement du detail', async () => {
    mockFindById.mockRejectedValue('panne');

    const detail = await useCollectionStore.getState().loadDetail('mag-1');

    expect(detail).toBeNull();
    expect(useCollectionStore.getState().error).toBe('Erreur inconnue');
  });

  it('ne modifie que le detail quand l’edition est absente de la liste', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine, copies: [], id: 'mag-2' },
    });

    await useCollectionStore.getState().updateMagazine('mag-2', {
      publication: 'Mickey Parade',
    });

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.magazines[0].id).toBe('mag-1');
    expect(state.magazines[0].publication).toBe(magazine.publication);
    expect(state.detail?.publication).toBe('Mickey Parade');
  });
});
