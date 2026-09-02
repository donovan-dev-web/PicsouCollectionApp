import { render, screen } from '@testing-library/react-native';

import HomeScreen from '@/app/index';
import { useCollectionStore } from '@/store/use-collection-store';

describe('HomeScreen (compteur)', () => {
  it('affiche le nombre d exemplaires possedes', () => {
    useCollectionStore.setState({ totalCopies: 12, loading: false, loaded: true });

    render(<HomeScreen />);

    expect(screen.getByTestId('collection-counter')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('exemplaires possédés')).toBeTruthy();
  });

  it('affiche le chargement lorsque la collection est en cours de chargement', () => {
    useCollectionStore.setState({ totalCopies: 0, loading: true, loaded: false });

    render(<HomeScreen />);

    expect(screen.getByTestId('counter-loading')).toBeTruthy();
  });
});
