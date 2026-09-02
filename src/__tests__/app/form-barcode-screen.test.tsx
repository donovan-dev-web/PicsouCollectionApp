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

    await act(async () => {
      scan()({ data: '5901234123457', type: 'ean13' });
    });

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    expect(consumePendingBarcode()).toBe('5901234123457');
  });

  it('ignore les codes invalides et ne revient pas', async () => {
    render(<FormBarcodeScreen />);

    await act(async () => {
      scan()({ data: '0000', type: 'ean13' });
    });

    expect(mockBack).not.toHaveBeenCalled();
    expect(consumePendingBarcode()).toBeNull();
  });

  it('n ignore pas un code déjà scanné quand le premier était invalide', async () => {
    render(<FormBarcodeScreen />);

    await act(async () => {
      scan()({ data: '0000', type: 'ean13' });
    });
    await act(async () => {
      scan()({ data: '5901234123457', type: 'ean13' });
    });

    await waitFor(() => expect(mockBack).toHaveBeenCalledTimes(1));
    expect(consumePendingBarcode()).toBe('5901234123457');
  });
});
