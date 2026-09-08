import { act, fireEvent, render, screen } from '@testing-library/react-native';

import { DrawerMenu, isLeftEdgeGesture, isOpenGesture } from '@/components/drawer-content';
import { useSettingsStore } from '@/store/use-settings-store';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('DrawerMenu', () => {
  const onClose = jest.fn();

  beforeEach(() => {
    mockPush.mockClear();
    onClose.mockClear();
    useSettingsStore.setState({ reducedMotion: true });
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

  it('navigue vers l’accueil puis ferme le menu (mouvements réduits)', () => {
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    fireEvent.press(screen.getByTestId('drawer-item-accueil'));

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(onClose).toHaveBeenCalled();
  });

  it('navigue vers une sous-catégorie Scan après ouverture de la section', () => {
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    fireEvent.press(screen.getByTestId('drawer-collapsible-scan'));
    fireEvent.press(screen.getByTestId('drawer-sub-ocr-couverture'));

    expect(mockPush).toHaveBeenCalledWith('/scan/camera');
  });

  it('navigue vers la collection filtrée par édition', () => {
    render(<DrawerMenu visible onClose={onClose} editions={['Panini']} />);

    fireEvent.press(screen.getByTestId('drawer-sub-panini'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/collection',
      params: { edition: 'Panini' },
    });
  });

  it('considère un glissement comme ouverture au-delà de 40 % de la largeur', () => {
    expect(isOpenGesture(150)).toBe(true);
    expect(isOpenGesture(10)).toBe(false);
  });

  it('ne prend en compte que les glissements débutant sur le bord gauche', () => {
    expect(isLeftEdgeGesture(20, 5)).toBe(true);
    expect(isLeftEdgeGesture(5, 5)).toBe(false);
    expect(isLeftEdgeGesture(20, 50)).toBe(false);
  });

  it('ferme le menu via le fond lorsque le panneau est ouvert', () => {
    render(<DrawerMenu visible onClose={onClose} editions={[]} />);

    fireEvent.press(screen.getByLabelText('Fermer le menu'));

    expect(onClose).toHaveBeenCalled();
  });

  it('replie « Par édition » automatiquement quand peu d’éditions', () => {
    render(<DrawerMenu visible onClose={onClose} editions={['Panini']} />);

    expect(screen.getByTestId('drawer-sub-panini')).toBeTruthy();
  });

  it('reste replié sur beaucoup d’éditions', () => {
    const editions = Array.from({ length: 8 }, (_, i) => `Édition ${i + 1}`);
    render(<DrawerMenu visible onClose={onClose} editions={editions} />);

    expect(screen.queryByTestId('drawer-sub-edition-1')).toBeNull();
  });

  it('n’ajuste plus « Par édition » quand l’utilisateur a replié manuellement', () => {
    render(<DrawerMenu visible onClose={onClose} editions={['Panini', 'Español']} />);

    fireEvent.press(screen.getByTestId('drawer-collapsible-par-edition'));
    act(() => {
      swipe(screen.getByTestId('drawer-panel'), [
        { pageX: 10, ts: 2000 },
        { pageX: 40, ts: 2100 },
        { pageX: 300, ts: 2200 },
        { pageX: 300, ts: 2300 },
      ]);
    });

    expect(screen.queryByTestId('drawer-sub-panini')).toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('DrawerMenu — animations (mouvements réduits désactivés)', () => {
  const animOnClose = jest.fn();

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    animOnClose.mockClear();
    useSettingsStore.setState({ reducedMotion: false });
  });

  it('ferme le panneau via l’animation puis rappelle onClose', () => {
    render(<DrawerMenu visible onClose={animOnClose} editions={[]} />);

    fireEvent.press(screen.getByLabelText('Fermer le menu'));
    act(() => {
      jest.runAllTimers();
    });

    expect(animOnClose).toHaveBeenCalled();
  });

  it('navigue après la fermeture animée', () => {
    render(<DrawerMenu visible onClose={animOnClose} editions={[]} />);

    fireEvent.press(screen.getByTestId('drawer-item-accueil'));
    act(() => {
      jest.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith('/');
    expect(animOnClose).toHaveBeenCalled();
  });

  it('suit le glissement et ouvre le panneau au-delà du seuil (animation)', () => {
    render(<DrawerMenu visible onClose={animOnClose} editions={[]} />);
    const panel = screen.getByTestId('drawer-panel');

    act(() => {
      swipe(panel, [
        { pageX: 10, ts: 1000 },
        { pageX: 60, ts: 1100 },
        { pageX: 250, ts: 1200 },
        { pageX: 250, ts: 1300 },
      ]);
    });

    expect(animOnClose).not.toHaveBeenCalled();
  });

  it('ferme le panneau lors d’un court glissement (animation)', () => {
    render(<DrawerMenu visible onClose={animOnClose} editions={[]} />);
    const panel = screen.getByTestId('drawer-panel');

    act(() => {
      swipe(panel, [
        { pageX: 10, ts: 1000 },
        { pageX: 30, ts: 1100 },
        { pageX: 30, ts: 1200 },
      ]);
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(animOnClose).toHaveBeenCalled();
  });
});

function touchHistory(pageX: number, ts: number) {
  return {
    mostRecentTimeStamp: ts,
    numberActiveTouches: 1,
    indexOfSingleActiveTouch: 0,
    touchBank: [
      {
        startPageX: 10,
        currentPageX: pageX,
        startPageY: 0,
        currentPageY: 0,
        startTimeStamp: 900,
        currentTimeStamp: ts,
        previousPageX: 10,
        previousPageY: 0,
        previousTimeStamp: ts - 60,
        touchActive: true,
      },
    ],
  };
}

function fireResponder(
  panel: ReturnType<typeof screen.getByTestId>,
  handler: string,
  pageX: number,
  ts: number,
) {
  const props = panel.props as Record<string, unknown>;
  const fn = props[handler] as ((arg: unknown) => void) | undefined;
  expect(fn).toBeDefined();
  fn?.({
    persist: jest.fn(),
    preventDefault: jest.fn(),
    nativeEvent: { touches: [{ pageX, pageY: 0 }], changedTouches: [] },
    touchHistory: touchHistory(pageX, ts),
  });
}

function swipe(
  panel: ReturnType<typeof screen.getByTestId>,
  steps: { pageX: number; ts: number }[],
) {
  const [first, ...rest] = steps;
  fireResponder(panel, 'onMoveShouldSetResponder', first.pageX, first.ts);
  fireResponder(panel, 'onResponderGrant', first.pageX, first.ts);
  for (const { pageX, ts } of rest) {
    fireResponder(panel, 'onResponderMove', pageX, ts);
  }
  const last = rest[rest.length - 1] ?? first;
  fireResponder(panel, 'onResponderRelease', last.pageX, last.ts);
}
