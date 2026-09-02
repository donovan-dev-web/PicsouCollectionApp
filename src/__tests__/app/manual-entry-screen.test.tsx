import { render, screen } from '@testing-library/react-native';

import ManualEntryScreen from '@/app/scan/manual';

describe('ManualEntryScreen', () => {
  it('affiche le titre de la saisie manuelle', () => {
    render(<ManualEntryScreen />);

    expect(screen.getByText('Ajouter une édition')).toBeTruthy();
    expect(screen.getByText(/Saisie manuelle/)).toBeTruthy();
  });
});
