import { render, screen } from '@testing-library/react-native';

import { StatusBadge } from '@/components/status-badge';

describe('StatusBadge', () => {
  it('affiche le statut possédé de manière générique', () => {
    render(<StatusBadge />);

    const badge = screen.getByTestId('status-owned');
    expect(screen.getByText('Possédé')).toBeTruthy();
    expect(badge).toHaveAccessibleName('Possédé');
  });
});
