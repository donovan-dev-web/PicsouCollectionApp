import { fireEvent, render, screen } from '@testing-library/react-native';

import { DrawerMenu } from '@/components/drawer-content';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('DrawerMenu', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    onClose.mockClear();
  });

  afterEach(() => {
    global.__resetSafeAreaInsets?.();
  });

  it("affiche les liens directs d'accès", () => {
    render(<DrawerMenu visible onClose={onClose} editions={['Panini']} />);

    expect(screen.getByTestId('drawer-item-accueil')).toBeTruthy();
    expect(screen.getByTestId('drawer-item-toute-la-collection')).toBeTruthy();
    expect(screen.getByTestId('drawer-item-parametres')).toBeTruthy();
    expect(screen.getByTestId('drawer-collapsible-scan')).toBeTruthy();
  });

  it('affiche une sous-catégorie par édition de la collection', () => {
    render(
      <DrawerMenu visible onClose={onClose} editions={['Panini', 'Casterman', 'Sans édition']} />,
    );

    expect(screen.getByTestId('drawer-collapsible-par-edition')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-panini')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-casterman')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-sans-edition')).toBeTruthy();
  });

  it('affiche les sous-catégories Scan après ouverture de la section', () => {
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    expect(screen.queryByTestId('drawer-sub-ocr-couverture')).toBeNull();

    fireEvent.press(screen.getByTestId('drawer-collapsible-scan'));

    expect(screen.getByTestId('drawer-sub-ocr-couverture')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-code-barres')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-saisie-manuelle')).toBeTruthy();
  });

  it('garde la section « Par édition » repliée après ouverture si > 5 éditions', () => {
    const editions = Array.from({ length: 8 }, (_, i) => `Édition ${i + 1}`);
    render(<DrawerMenu visible onClose={onClose} editions={editions} />);

    expect(screen.queryByTestId('drawer-sub-edition-1')).toBeNull();
    expect(screen.queryByTestId('drawer-sub-edition-8')).toBeNull();
  });

  it('déplie « Par édition » au clic puis conserve l’état au rendu suivant', () => {
    const editions = Array.from({ length: 8 }, (_, i) => `Édition ${i + 1}`);
    const { rerender } = render(<DrawerMenu visible onClose={onClose} editions={editions} />);

    fireEvent.press(screen.getByTestId('drawer-collapsible-par-edition'));
    expect(screen.getByTestId('drawer-sub-edition-1')).toBeTruthy();

    rerender(<DrawerMenu visible onClose={onClose} editions={editions} />);
    expect(screen.getByTestId('drawer-sub-edition-1')).toBeTruthy();
  });

  it('rend le menu dans un conteneur scrollable pour atteindre toutes les éditions', () => {
    const editions = Array.from({ length: 15 }, (_, i) => `Édition ${i + 1}`);
    render(<DrawerMenu visible onClose={onClose} editions={editions} />);

    fireEvent.press(screen.getByTestId('drawer-collapsible-par-edition'));

    expect(screen.getByTestId('drawer-scroll')).toBeTruthy();
    expect(screen.getByTestId('drawer-sub-edition-15')).toBeTruthy();
    expect(screen.getByTestId('drawer-item-parametres')).toBeTruthy();
  });

  it('applique la SafeZone (insets encoche + gesture bar)', () => {
    global.__setSafeAreaInsets?.({ top: 44, bottom: 34 });
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    const header = screen.getByTestId('drawer-header');
    expect(header.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 44 + 16 })]),
    );

    const panel = screen.getByTestId('drawer-panel');
    expect(panel).toBeTruthy();
  });

  it('n\u2019applique aucun inset suppl\u00e9mentaire sans encoche', () => {
    global.__resetSafeAreaInsets?.();
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    const header = screen.getByTestId('drawer-header');
    expect(header.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ paddingTop: 0 + 16 })]),
    );
  });
});
