import { render, screen } from '@testing-library/react-native';

import ScanMethodScreen from '@/app/scan/index';

describe('ScanMethodScreen', () => {
  it('affiche le titre et le placeholder du choix de methode', () => {
    render(<ScanMethodScreen />);

    expect(screen.getByText('Scanner')).toBeTruthy();
    expect(screen.getByText(/Choisissez une méthode/)).toBeTruthy();
  });
});
