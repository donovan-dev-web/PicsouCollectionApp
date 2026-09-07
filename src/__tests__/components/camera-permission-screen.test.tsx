import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';

const mockRequest = jest.fn();
const mockCancel = jest.fn();

describe('CameraPermissionScreen', () => {
  beforeEach(() => {
    mockRequest.mockClear();
    mockCancel.mockClear();
  });

  it('affiche l’état de chargement tant que la permission n’est pas résolue', () => {
    render(
      <CameraPermissionScreen
        loading
        canAskAgain={false}
        onRequestPermission={mockRequest}
        onCancel={mockCancel}
        description="x"
      />,
    );
    expect(screen.getByTestId('camera-permission-loading')).toBeTruthy();
    expect(screen.queryByTestId('permission-request')).toBeNull();
  });

  it('affiche la demande quand canAskAgain est vrai', () => {
    render(
      <CameraPermissionScreen
        loading={false}
        canAskAgain
        onRequestPermission={mockRequest}
        onCancel={mockCancel}
        description="Le scan a besoin de la caméra."
      />,
    );
    expect(screen.getByText('Le scan a besoin de la caméra.')).toBeTruthy();
    fireEvent.press(screen.getByTestId('permission-request'));
    expect(mockRequest).toHaveBeenCalled();
  });

  it('ouvre les réglages quand la permission est définitivement refusée', () => {
    const spy = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    render(
      <CameraPermissionScreen
        loading={false}
        canAskAgain={false}
        onRequestPermission={mockRequest}
        onCancel={mockCancel}
        description="Le scan a besoin de la caméra."
      />,
    );
    expect(screen.getByTestId('permission-denied')).toBeTruthy();
    fireEvent.press(screen.getByTestId('permission-settings'));
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('propose un retour qui annule', () => {
    render(
      <CameraPermissionScreen
        loading={false}
        canAskAgain
        onRequestPermission={mockRequest}
        onCancel={mockCancel}
        description="Le scan a besoin de la caméra."
      />,
    );
    fireEvent.press(screen.getByTestId('permission-cancel'));
    expect(mockCancel).toHaveBeenCalled();
  });
});
