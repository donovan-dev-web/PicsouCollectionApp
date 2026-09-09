import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';

const mockList = jest.fn();
const mockCreate = jest.fn();
const mockDelete = jest.fn();
const mockFindById = jest.fn();
const mockUpdate = jest.fn();
const mockFindRecent = jest.fn();
const mockCountAll = jest.fn();
const mockMagazineRepo = {
  list: mockList,
  create: mockCreate,
  delete: mockDelete,
  findById: mockFindById,
  update: mockUpdate,
  findRecent: mockFindRecent,
  countAll: mockCountAll,
};

jest.mock('@/dependencies', () => ({
  getDeps: jest.fn(() => ({
    magazineRepository: mockMagazineRepo,
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
};

describe('useCollectionStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCollectionStore.setState({
      magazines: [],
      recent: [],
      detail: null,
      totalMagazines: 0,
      loading: false,
      detailLoading: false,
      error: null,
      loaded: false,
    });
  });

  it('charge la collection et calcule le nombre total d editions', async () => {
    mockList.mockResolvedValue([magazine]);

    await useCollectionStore.getState().load();

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalMagazines).toBe(1);
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

  it('ajoute une edition et incremente le compteur', async () => {
    mockCreate.mockResolvedValue(magazine);

    await useCollectionStore
      .getState()
      .addMagazine({ publication: 'Picsou Magazine', issueNumber: 547 });

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalMagazines).toBe(1);
    expect(mockCreate).toHaveBeenCalledWith({
      publication: 'Picsou Magazine',
      issueNumber: 547,
    });
  });

  it('supprime une edition et decremente le compteur', async () => {
    useCollectionStore.setState({ magazines: [magazine], totalMagazines: 4 });
    mockDelete.mockResolvedValue(undefined);

    await useCollectionStore.getState().removeMagazine('mag-1');

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(0);
    expect(state.totalMagazines).toBe(3);
  });

  it('ne change pas le compteur si l’edition à supprimer est inconnue du store', async () => {
    mockDelete.mockResolvedValue(undefined);
    useCollectionStore.setState({ magazines: [magazine], totalMagazines: 4 });

    await useCollectionStore.getState().removeMagazine('inconnue');

    const state = useCollectionStore.getState();
    expect(state.magazines).toHaveLength(1);
    expect(state.totalMagazines).toBe(4);
  });

  it('charge un resume leger (compteur + recents) sans lister les editions', async () => {
    mockCountAll.mockResolvedValue(7);
    mockFindRecent.mockResolvedValue([magazine]);

    await useCollectionStore.getState().loadSummary();

    const state = useCollectionStore.getState();
    expect(state.totalMagazines).toBe(7);
    expect(state.recent).toHaveLength(1);
    expect(state.loaded).toBe(true);
    expect(state.loading).toBe(false);
    expect(mockList).not.toHaveBeenCalled();
    expect(mockFindRecent).toHaveBeenCalledWith(5);
    expect(mockCountAll).toHaveBeenCalledTimes(1);
  });

  it('signale un echec de chargement du resume', async () => {
    mockCountAll.mockRejectedValue(new Error('base indisponible'));

    await useCollectionStore.getState().loadSummary();

    const state = useCollectionStore.getState();
    expect(state.error).toBe('base indisponible');
    expect(state.loading).toBe(false);
    expect(state.loaded).toBe(false);
  });

  it('traduit une erreur inconnue lors du chargement du resume', async () => {
    mockCountAll.mockRejectedValue('panne');

    await useCollectionStore.getState().loadSummary();

    expect(useCollectionStore.getState().error).toBe('Erreur inconnue');
  });

  it('charge le detail d une edition', async () => {
    mockFindById.mockResolvedValue(magazine);

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

  it('traduit une erreur inconnue lors du chargement du detail', async () => {
    mockFindById.mockRejectedValue('panne');

    const detail = await useCollectionStore.getState().loadDetail('mag-1');

    expect(detail).toBeNull();
    expect(useCollectionStore.getState().error).toBe('Erreur inconnue');
  });

  it('modifie une edition et rafraichit la liste et le detail', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine },
    });

    await useCollectionStore.getState().updateMagazine('mag-1', {
      publication: 'Mickey Parade',
    });

    const state = useCollectionStore.getState();
    expect(mockUpdate).toHaveBeenCalledWith('mag-1', { publication: 'Mickey Parade' });
    expect(state.magazines[0].publication).toBe('Mickey Parade');
    expect(state.detail?.publication).toBe('Mickey Parade');
  });

  it('signale une edition introuvable lors de la modification', async () => {
    mockUpdate.mockResolvedValue(null);

    await expect(
      useCollectionStore.getState().updateMagazine('inconnue', { publication: 'X' }),
    ).rejects.toThrow('Édition introuvable.');
  });

  it('conserve le detail d’une autre edition lors d’une modification', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine, id: 'mag-9' },
    });

    await useCollectionStore.getState().updateMagazine('mag-1', { publication: 'Mickey Parade' });

    expect(useCollectionStore.getState().detail?.id).toBe('mag-9');
  });

  it('met a jour aussi les recentes lors d’une modification', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      recent: [{ ...magazine }],
      detail: { ...magazine },
    });

    await useCollectionStore.getState().updateMagazine('mag-1', { publication: 'Mickey Parade' });

    const state = useCollectionStore.getState();
    expect(state.recent[0].publication).toBe('Mickey Parade');
    expect(state.detail?.publication).toBe('Mickey Parade');
  });

  it('ne modifie que le detail quand l’edition est absente de la liste', async () => {
    mockUpdate.mockResolvedValue({ ...magazine, publication: 'Mickey Parade' });
    useCollectionStore.setState({
      magazines: [magazine],
      detail: { ...magazine, id: 'mag-2' },
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

  it('supprime le detail quand il correspond a l edition retiree', async () => {
    mockDelete.mockResolvedValue(undefined);
    useCollectionStore.setState({
      magazines: [magazine],
      totalMagazines: 4,
      detail: { ...magazine },
    });

    await useCollectionStore.getState().removeMagazine('mag-1');

    expect(useCollectionStore.getState().detail).toBeNull();
  });

  it('retire l’edition des recentes et decremente le compteur', async () => {
    mockDelete.mockResolvedValue(undefined);
    useCollectionStore.setState({
      magazines: [magazine],
      recent: [{ ...magazine }],
      totalMagazines: 4,
    });

    await useCollectionStore.getState().removeMagazine('mag-1');

    const state = useCollectionStore.getState();
    expect(state.recent).toHaveLength(0);
    expect(state.totalMagazines).toBe(3);
  });
});
