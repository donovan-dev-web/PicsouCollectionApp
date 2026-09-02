import { fireEvent, render, screen } from '@testing-library/react-native';

import CameraScanScreen from '@/app/scan/camera';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('CameraScanScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('affiche le placeholder OCR et les méthodes de repli', () => {
    render(<CameraScanScreen />);

    expect(screen.getByText('Caméra / OCR')).toBeTruthy();
    expect(screen.getByTestId('go-barcode')).toBeTruthy();
    expect(screen.getByTestId('go-manual')).toBeTruthy();
  });

  it('propose le scan code-barres', () => {
    render(<CameraScanScreen />);
    fireEvent.press(screen.getByTestId('go-barcode'));
    expect(mockPush).toHaveBeenCalledWith('/scan/barcode');
  });

  it('propose la saisie manuelle', () => {
    render(<CameraScanScreen />);
    fireEvent.press(screen.getByTestId('go-manual'));
    expect(mockPush).toHaveBeenCalledWith('/scan/manual');
  });
});
