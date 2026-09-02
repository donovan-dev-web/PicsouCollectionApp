import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import EditMagazineScreen from '@/app/collection/[id]/edit';
import { useCollectionStore } from '@/store/use-collection-store';

const mockBack = jest.fn();
const mockUpdateMagazine = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'mag-1' }),
  useRouter: () => ({ back: mockBack }),
}));

const detail = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: 'standard',
  country: 'FR',
  publicationDate: '2023-03',
  barcode: '3271234567890',
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
  copies: [],
};

describe('EditMagazineScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockUpdateMagazine.mockClear();
    mockUpdateMagazine.mockResolvedValue(undefined);
    useCollectionStore.setState({
      detail,
      updateMagazine: mockUpdateMagazine,
    });
  });

  it('pre-remplit le formulaire avec les donnees de l edition', () => {
    render(<EditMagazineScreen />);

    expect(screen.getByTestId('field-publication').props.value).toBe('Picsou Magazine');
    expect(screen.getByTestId('field-issue-number').props.value).toBe('547');
    expect(screen.getByTestId('field-edition').props.value).toBe('standard');
    expect(screen.getByTestId('field-barcode').props.value).toBe('3271234567890');
  });

  it('enregistre les modifications et revient en arriere', async () => {
    render(<EditMagazineScreen />);

    fireEvent.changeText(screen.getByTestId('field-publication'), 'Mickey Parade');
    fireEvent.changeText(screen.getByTestId('field-issue-number'), '600');
    fireEvent.press(screen.getByTestId('form-submit'));

    await waitFor(() => expect(mockUpdateMagazine).toHaveBeenCalledTimes(1));
    expect(mockUpdateMagazine).toHaveBeenCalledWith('mag-1', {
      publication: 'Mickey Parade',
      issueNumber: 600,
      edition: 'standard',
      country: 'FR',
      publicationDate: '2023-03',
      barcode: '3271234567890',
    });
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('affiche un message quand le detail est absent', () => {
    useCollectionStore.setState({ detail: null });

    render(<EditMagazineScreen />);

    expect(screen.getByTestId('edit-not-found')).toBeTruthy();
  });
});
