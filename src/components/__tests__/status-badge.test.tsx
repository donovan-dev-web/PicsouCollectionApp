import { render, screen } from '@testing-library/react-native';

import { StatusBadge } from '@/components/status-badge';

describe('StatusBadge', () => {
  it('annonce la quantité possédée quand elle est positive', () => {
    render(<StatusBadge owned quantity={3} />);

    const badge = screen.getByTestId('status-owned');
    expect(badge).toBeTruthy();
    expect(screen.getByText('Possédé (3)')).toBeTruthy();
    expect(badge).toHaveAccessibleName('Possédé, 3 exemplaires');
  });

  it('reste générique quand le nombre d exemplaires est nul', () => {
    render(<StatusBadge owned />);

    const badge = screen.getByTestId('status-owned');
    expect(screen.getByText('Possédé')).toBeTruthy();
    expect(badge).toHaveAccessibleName('Possédé');
  });

  it('indique l’absence sans quantification', () => {
    render(<StatusBadge owned={false} quantity={0} />);

    const badge = screen.getByTestId('status-absent');
    expect(screen.getByText('Absent')).toBeTruthy();
    expect(badge).toHaveAccessibleName('Absent de la collection');
  });
});
