import { act, render, screen, waitFor } from '@testing-library/react-native';

import FormBarcodeScreen from '@/app/scan/form-barcode';
import { consumePendingBarcode } from '@/lib/pending-barcode';

const mockBack = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack }),
}));

jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  const MockCameraView = (props: any) => <View testID="camera-view" {...props} />;
  return {
    useCameraPermissions: () => [
      { granted: true, canAskAgain: true, status: 'granted' },
      mockRequestPermission,
    ],
    CameraView: MockCameraView,
  };
});

function scan() {
  return screen.getByTestId('camera-view').props.onBarcodeScanned;
}

/** Émet `times` lectures identiques pour atteindre le seuil du stabilisateur (3 par défaut). */
async function scanTimes(code: string, type = 'ean13', times = 3) {
  for (let i = 0; i < times; i++) {
    await act(async () => {
      scan()({ data: code, type });
    });
  }
}

describe('FormBarcodeScreen', () => {
  beforeEach(() => {
    mockBack.mockClear();
    // ensure clean slate
    consumePendingBarcode();
  });

  it('affiche le preview caméra quand la permission est accordée', () => {
    render(<FormBarcodeScreen />);
    expect(screen.getByTestId('camera-view')).toBeTruthy();
  });

  it('stocke le code scanné et revient au formulaire pour un code valide', async () => {
    render(<FormBarcodeScreen />);

    await scanTimes('5901234123457');

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    expect(consumePendingBarcode()).toBe('5901234123457');
  });

  it('ne revient pas tant que la lecture n est pas stabilisée', async () => {
    render(<FormBarcodeScreen />);

    await scanTimes('5901234123457', 'ean13', 2);

    expect(mockBack).not.toHaveBeenCalled();
    expect(consumePendingBarcode()).toBeNull();
  });

  it('ignore les codes invalides et ne revient pas', async () => {
    render(<FormBarcodeScreen />);

    await scanTimes('0000');

    expect(mockBack).not.toHaveBeenCalled();
    expect(consumePendingBarcode()).toBeNull();
  });

  it('ne stocke pas un code invalide puis accepte un code valide ensuite', async () => {
    render(<FormBarcodeScreen />);

    // code trop court → invalide, quel que soit le nombre de lectures
    await scanTimes('0000');
    expect(mockBack).not.toHaveBeenCalled();

    await scanTimes('5901234123457');

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    expect(consumePendingBarcode()).toBe('5901234123457');
  });
});
