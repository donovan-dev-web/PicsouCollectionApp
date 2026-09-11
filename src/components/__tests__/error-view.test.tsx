import { fireEvent, render, screen } from '@testing-library/react-native';

import { ErrorView } from '@/components/error-view';

describe('ErrorView', () => {
  it('affiche le message sans bouton quand aucune action de reprise', () => {
    render(<ErrorView message="Base indisponible" testID="error-view" />);

    expect(screen.getByText('Base indisponible')).toBeTruthy();
    expect(screen.getByTestId('error-view')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('permet de réessayer via le bouton dédié', () => {
    const onRetry = jest.fn();
    render(
      <ErrorView
        message="Base indisponible"
        retryLabel="Réessayer"
        onRetry={onRetry}
        retryTestID="error-retry"
      />,
    );

    fireEvent.press(screen.getByTestId('error-retry'));

    expect(screen.getByLabelText('Réessayer')).toBeTruthy();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
