import { render, screen } from '@testing-library/react-native';

import { MagazineCard } from '@/components/magazine-card';
import type { MagazineListItem } from '@/types';

const base: MagazineListItem = {
  id: 'm1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: null,
  country: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00Z',
  updatedAt: '2026-09-01T10:00:00Z',
  quantity: 1,
};

describe('MagazineCard', () => {
  it('affiche la publication et le numero en grand', () => {
    render(<MagazineCard magazine={base} />);

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
    expect(screen.getByText('n° 547')).toBeTruthy();
  });

  it('affiche Possede avec la quantite', () => {
    render(<MagazineCard magazine={{ ...base, quantity: 3 }} />);

    expect(screen.getByTestId('status-owned')).toBeTruthy();
    expect(screen.getByText(/Possédé \(3\)/)).toBeTruthy();
  });

  it('affiche Absent quand aucune copie', () => {
    render(<MagazineCard magazine={{ ...base, quantity: 0 }} />);

    expect(screen.getByTestId('status-absent')).toBeTruthy();
    expect(screen.getByText('🟢 Absent')).toBeTruthy();
  });
});
