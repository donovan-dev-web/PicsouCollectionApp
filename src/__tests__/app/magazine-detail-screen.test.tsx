import { fireEvent, render, screen } from '@testing-library/react-native';
import { Alert } from 'react-native';

import MagazineDetailScreen from '@/app/collection/[id]';
import { useCollectionStore } from '@/store/use-collection-store';

const mockUseFocusEffect = jest.fn();
const mockLoadDetail = jest.fn();
const mockRemoveMagazine = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => mockUseFocusEffect(cb),
  useLocalSearchParams: () => ({ id: 'mag-1' }),
  useRouter: () => ({ push: jest.fn(), back: mockBack }),
}));

const detail = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: 'standard',
  language: 'FR',
  condition: 'neuf',
  publicationDate: '2023-03',
  barcode: '3271234567890',
  notes: 'Mention bimestriel',
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
  copies: [
    {
      id: 'c1',
      magazineId: 'mag-1',
      notes: null,
      dateAdded: '2026-09-01T10:00:00Z',
    },
  ],
};

describe('MagazineDetailScreen', () => {
  beforeEach(() => {
    mockUseFocusEffect.mockClear();
    mockLoadDetail.mockClear();
    mockRemoveMagazine.mockClear();
    mockBack.mockClear();
    mockRemoveMagazine.mockResolvedValue(undefined);
    mockUseFocusEffect.mockImplementation((cb: () => void) => cb());
    useCollectionStore.setState({
      detail: null,
      detailLoading: false,
      error: null,
      loadDetail: mockLoadDetail,
      removeMagazine: mockRemoveMagazine,
    });
    mockLoadDetail.mockResolvedValue(detail);
  });

  it('charge le detail au focus', () => {
    render(<MagazineDetailScreen />);

    expect(mockLoadDetail).toHaveBeenCalledWith('mag-1');
  });

  it('affiche les informations de l edition', async () => {
    useCollectionStore.setState({ detail, detailLoading: false });
    render(<MagazineDetailScreen />);

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByTestId('detail-issue')).toHaveTextContent('n° 547');
    expect(screen.getAllByText('standard').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('FR').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('neuf').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('3271234567890').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche le badge Possede avec le nombre d exemplaires', async () => {
    useCollectionStore.setState({ detail, detailLoading: false });
    render(<MagazineDetailScreen />);

    expect(screen.getByTestId('status-owned')).toBeTruthy();
    expect(screen.getByTestId('detail-count')).toHaveTextContent('1 exemplaire');
  });

  it('affiche la liste des exemplaires', async () => {
    useCollectionStore.setState({ detail, detailLoading: false });
    render(<MagazineDetailScreen />);

    expect(screen.getAllByTestId('detail-copy')).toHaveLength(1);
    expect(screen.getAllByText('01/09/2026').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche Absent et un message quand aucun exemplaire', async () => {
    useCollectionStore.setState({
      detail: { ...detail, copies: [] },
      detailLoading: false,
    });
    render(<MagazineDetailScreen />);

    expect(screen.getByTestId('status-absent')).toBeTruthy();
    expect(screen.getByTestId('detail-copies-empty')).toBeTruthy();
  });

  it('affiche un etat de chargement en attente', () => {
    useCollectionStore.setState({ detail: null, detailLoading: true });
    mockLoadDetail.mockReturnValue(new Promise(() => {}));

    render(<MagazineDetailScreen />);

    expect(screen.getByText('Chargement…')).toBeTruthy();
  });

  it('affiche un message quand l edition est introuvable', () => {
    useCollectionStore.setState({ detail: null, detailLoading: false });
    mockLoadDetail.mockResolvedValue(null);

    render(<MagazineDetailScreen />);

    expect(screen.getByTestId('detail-not-found')).toBeTruthy();
  });

  it('demande confirmation puis supprime et revient en arriere', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    useCollectionStore.setState({ detail, detailLoading: false });
    render(<MagazineDetailScreen />);

    fireEvent.press(screen.getByTestId('detail-delete'));

    expect(alertSpy).toHaveBeenCalled();
    const buttons = alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[];
    const confirm = buttons?.find((b) => b.text === 'Supprimer');
    expect(confirm).toBeDefined();
    await confirm?.onPress?.();

    expect(mockRemoveMagazine).toHaveBeenCalledWith('mag-1');
    expect(mockBack).toHaveBeenCalled();
    alertSpy.mockRestore();
  });
});
