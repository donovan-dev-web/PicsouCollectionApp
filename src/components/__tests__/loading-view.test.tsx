import { render, screen } from '@testing-library/react-native';

import { LoadingView } from '@/components/loading-view';

describe('LoadingView', () => {
  it('affiche le message par défaut quand aucun n est fourni', () => {
    render(<LoadingView />);

    expect(screen.getByText('Chargement…')).toBeTruthy();
    expect(screen.getByTestId('loading-spinner')).toBeTruthy();
  });

  it('affiche le message et un identifiant de test fournis', () => {
    render(<LoadingView message="Recherche…" testID="scan-loading" />);

    expect(screen.getByText('Recherche…')).toBeTruthy();
    expect(screen.getByTestId('scan-loading-spinner')).toBeTruthy();
  });
});
