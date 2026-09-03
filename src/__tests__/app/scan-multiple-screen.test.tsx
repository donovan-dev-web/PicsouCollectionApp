import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import MultipleBarcodeScreen from '@/app/scan/multiple';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import type { Magazine, MagazineListItem } from '@/types';

const mockReplace = jest.fn();
const mockPush = jest.fn();
let focusEffectCallback: (() => void) | null = null;

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace, push: mockPush }),
  useFocusEffect: (cb: () => void) => {
    focusEffectCallback = cb;
  },
  useLocalSearchParams: () => mockParams(),
}));

let params: Record<string, string | undefined> = {};
function mockParams() {
  return params;
}

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'mag-1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: null,
    publicationDate: '2023-03',
    barcode: '5901234123457',
    notes: null,
    ocrText: null,
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    ...overrides,
  };
}

function asListItem(magazine: Magazine, quantity = 0): MagazineListItem {
  return { ...magazine, quantity };
}

function stubDeps(findMany: jest.Mock<Promise<MagazineListItem[]>, [string]>): Dependencies {
  return {
    magazineRepository: {
      findManyByBarcode: findMany,
    } as unknown as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    identificationService: {
      identifyByBarcode: jest.fn(),
    } as unknown as Dependencies['identificationService'],
  };
}

describe('MultipleBarcodeScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    mockPush.mockClear();
    focusEffectCallback = null;
    params = {};
  });

  function focusScreen() {
    act(() => {
      focusEffectCallback?.();
    });
  }

  it('affiche le nombre d éditions et la liste cliquable des items', async () => {
    params = { barcode: '5901234123457' };
    const findMany = jest
      .fn()
      .mockResolvedValue([
        asListItem(makeMagazine({ id: 'mag-1', issueNumber: 547 }), 1),
        asListItem(makeMagazine({ id: 'mag-2', issueNumber: 548 }), 0),
      ]);
    setDepsForTest(stubDeps(findMany));

    render(<MultipleBarcodeScreen />);
    focusScreen();

    await waitFor(() => expect(screen.getByTestId('multiple-count')).toBeTruthy());
    expect(screen.getByText('2 éditions trouvées')).toBeTruthy();
    expect(screen.getByText(/5901234123457/)).toBeTruthy();

    const items = screen.getAllByTestId('multiple-item');
    expect(items).toHaveLength(2);

    fireEvent.press(items[0]);
    expect(mockPush).toHaveBeenCalledWith('/collection/mag-1');
    expect(findMany).toHaveBeenCalledWith('5901234123457');
  });

  it('affiche un message quand aucun magazine ne correspond', async () => {
    params = { barcode: '5901234123457' };
    setDepsForTest(stubDeps(jest.fn().mockResolvedValue([])));

    render(<MultipleBarcodeScreen />);
    focusScreen();

    await waitFor(() => expect(screen.getByTestId('multiple-empty')).toBeTruthy());
  });

  it('affiche une erreur si le chargement échoue', async () => {
    params = { barcode: '5901234123457' };
    setDepsForTest(stubDeps(jest.fn().mockRejectedValue(new Error('db'))));

    render(<MultipleBarcodeScreen />);
    focusScreen();

    await waitFor(() => expect(screen.getByTestId('multiple-error')).toBeTruthy());
  });

  it('permet de rescanner', async () => {
    params = { barcode: '5901234123457' };
    setDepsForTest(stubDeps(jest.fn().mockResolvedValue([])));

    render(<MultipleBarcodeScreen />);
    focusScreen();
    await act(async () => {});

    fireEvent.press(screen.getByTestId('multiple-rescan'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/barcode');
  });
});
