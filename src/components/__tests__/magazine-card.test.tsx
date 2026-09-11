import { render, screen } from '@testing-library/react-native';

import { MagazineCard } from '@/components/magazine-card';
import type { MagazineListItem } from '@/types';

const base: MagazineListItem = {
  id: 'm1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: null,
  language: null,
  condition: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
};

describe('MagazineCard', () => {
  it('affiche la publication et le numero en grand', () => {
    render(<MagazineCard magazine={base} />);

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('n° 547')).toBeTruthy();
  });

  it('affiche le badge Possédé (plus d exemplaires)', () => {
    render(<MagazineCard magazine={base} />);

    expect(screen.getByTestId('status-owned')).toBeTruthy();
    expect(screen.getByText('Possédé')).toBeTruthy();
  });

  it('annonce le statut possédé au lecteur d’écran', () => {
    render(<MagazineCard magazine={base} />);

    expect(screen.getByRole('button')).toHaveAccessibleName('Picsou Magazine numéro 547, possédé');
  });
});
