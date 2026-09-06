import { act, fireEvent, render, screen } from '@testing-library/react-native';

import OnboardingScreen from '@/app/onboarding';
import { setDepsForTest, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';

const mockRequestPermission = jest.fn();
const mockSetOnboardingDone = jest.fn();

let mockPermissionState: { granted: boolean; canAskAgain: boolean; status: string } = {
  granted: false,
  canAskAgain: true,
  status: 'undetermined',
};

jest.mock('expo-camera', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require('react-native');
  return {
    useCameraPermissions: () => [mockPermissionState, mockRequestPermission],
    CameraView: (props: any) => <View testID="camera-view" {...props} />,
  };
});

describe('OnboardingScreen', () => {
  beforeEach(() => {
    mockPermissionState = { granted: false, canAskAgain: true, status: 'undetermined' };
    mockRequestPermission.mockClear();
    mockSetOnboardingDone.mockClear();
    setDepsForTest({
      magazineRepository: {} as Dependencies['magazineRepository'],
      collectionRepository: {} as Dependencies['collectionRepository'],
      settingsRepository: {
        setOnboardingDone: mockSetOnboardingDone,
      } as unknown as Dependencies['settingsRepository'],
      identificationService: {} as Dependencies['identificationService'],
      ocrEngine: {} as Dependencies['ocrEngine'],
      backupService: {} as Dependencies['backupService'],
      fileGateway: {} as Dependencies['fileGateway'],
    });
    useSettingsStore.setState({ onboardingDone: false, onboardingLoaded: true });
  });

  it('affiche la présentation au premier lancement', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText('Picsou Collection')).toBeTruthy();
    expect(screen.getByTestId('onboarding-start')).toBeTruthy();
  });

  it('passe à la demande de permission caméra via Commencer', async () => {
    render(<OnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-start'));
    });
    expect(screen.getByTestId('permission-request')).toBeTruthy();
  });

  it('termine directement quand la permission est déjà accordée', async () => {
    mockPermissionState = { granted: true, canAskAgain: true, status: 'granted' };
    render(<OnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-start'));
    });
    expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
    expect(useSettingsStore.getState().onboardingDone).toBe(true);
  });

  it('demande la permission puis conclut si elle est accordée', async () => {
    mockRequestPermission.mockImplementation(() => {
      mockPermissionState = { granted: true, canAskAgain: true, status: 'granted' };
      return Promise.resolve({ granted: true, canAskAgain: true, status: 'granted' });
    });
    render(<OnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-start'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('permission-request'));
    });

    expect(mockRequestPermission).toHaveBeenCalled();
    expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
  });

  it('permet de passer Plus tard sans autoriser la caméra', async () => {
    render(<OnboardingScreen />);
    await act(async () => {
      fireEvent.press(screen.getByTestId('onboarding-start'));
    });
    await act(async () => {
      fireEvent.press(screen.getByTestId('permission-cancel'));
    });

    expect(mockRequestPermission).not.toHaveBeenCalled();
    expect(mockSetOnboardingDone).toHaveBeenCalledWith(true);
  });
});