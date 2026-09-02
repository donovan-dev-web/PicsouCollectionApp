import { fireEvent, render, screen } from '@testing-library/react-native';

import ScanMethodScreen from '@/app/scan/index';

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

describe('ScanMethodScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockBack.mockClear();
  });

  it('affiche le titre et les trois méthodes d identification', () => {
    render(<ScanMethodScreen />);

    expect(screen.getByText('Identifier le magazine')).toBeTruthy();
    expect(screen.getByTestId('method-barcode')).toBeTruthy();
    expect(screen.getByTestId('method-camera')).toBeTruthy();
    expect(screen.getByTestId('method-manual')).toBeTruthy();
  });

  it('navigue vers le scan code-barres', () => {
    render(<ScanMethodScreen />);
    fireEvent.press(screen.getByTestId('method-barcode'));
    expect(mockPush).toHaveBeenCalledWith('/scan/barcode');
  });

  it('navigue vers la caméra', () => {
    render(<ScanMethodScreen />);
    fireEvent.press(screen.getByTestId('method-camera'));
    expect(mockPush).toHaveBeenCalledWith('/scan/camera');
  });

  it('navigue vers la saisie manuelle', () => {
    render(<ScanMethodScreen />);
    fireEvent.press(screen.getByTestId('method-manual'));
    expect(mockPush).toHaveBeenCalledWith('/scan/manual');
  });

  it('annule et revient en arrière', () => {
    render(<ScanMethodScreen />);
    fireEvent.press(screen.getByTestId('method-cancel'));
    expect(mockBack).toHaveBeenCalled();
  });
});
