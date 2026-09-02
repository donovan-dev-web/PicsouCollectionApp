import { fireEvent, render, screen } from '@testing-library/react-native';

import ScanResultScreen from '@/app/scan/result';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useLocalSearchParams: () => mockParams(),
}));

let params: Record<string, string> = {};
function mockParams() {
  return params;
}

describe('ScanResultScreen', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    params = {};
  });

  it('affiche un magazine existant avec accès à la fiche', () => {
    params = {
      id: 'mag-1',
      publication: 'Picsou Magazine',
      issueNumber: '547',
      barcode: '5901234123457',
    };

    render(<ScanResultScreen />);

    expect(screen.getByText('Déjà dans votre collection')).toBeTruthy();
    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('N° 547')).toBeTruthy();

    fireEvent.press(screen.getByTestId('result-view'));
    expect(mockReplace).toHaveBeenCalledWith('/collection/mag-1');
  });

  it('propose rescanner depuis un résultat existant', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine' };

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-rescan'));
    expect(mockReplace).toHaveBeenCalledWith('/scan/barcode');
  });

  it('ouvre la saisie manuelle avec le code-barres depuis un résultat existant', () => {
    params = { id: 'mag-1', publication: 'Picsou Magazine', barcode: '5901234123457' };

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { barcode: '5901234123457' },
    });
  });

  it('affiche un magazine absent avec son code-barres', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    expect(screen.getByText('Absent de la collection')).toBeTruthy();
    expect(screen.getByText(/5901234123457/)).toBeTruthy();
  });

  it('n affiche pas le bouton fiche pour un magazine absent', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    expect(screen.queryByTestId('result-view')).toBeNull();
  });

  it('ouvre la saisie manuelle avec le code depuis un résultat absent', () => {
    params = { barcode: '5901234123457' };

    render(<ScanResultScreen />);

    fireEvent.press(screen.getByTestId('result-manual'));
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: '/scan/manual',
      params: { barcode: '5901234123457' },
    });
  });
});
