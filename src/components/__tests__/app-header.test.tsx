import type { ReactNode } from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import { AppHeader } from '@/components/app-header';
import { DrawerProvider, useDrawer } from '@/lib/drawer-context';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

function DrawerStateProbe() {
  const { visible } = useDrawer();
  return <Text testID="drawer-visible">{visible ? 'ouvert' : 'ferme'}</Text>;
}

function renderWithDrawer(ui: ReactNode) {
  return render(
    <DrawerProvider>
      {ui}
      <DrawerStateProbe />
    </DrawerProvider>,
  );
}

describe('AppHeader', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('affiche le titre et les boutons menu/scan', () => {
    renderWithDrawer(<AppHeader title="Ma Collection" />);

    expect(screen.getByText('Ma Collection')).toBeTruthy();
    expect(screen.getByTestId('header-menu')).toBeTruthy();
    expect(screen.getByTestId('header-scan')).toBeTruthy();
  });

  it('ouvre le drawer via le bouton menu', () => {
    renderWithDrawer(<AppHeader title="Accueil" />);

    fireEvent.press(screen.getByTestId('header-menu'));

    expect(screen.getByTestId('drawer-visible')).toHaveTextContent('ouvert');
  });

  it('navigue vers le scan via le bouton scan', () => {
    renderWithDrawer(<AppHeader title="Accueil" />);

    fireEvent.press(screen.getByTestId('header-scan'));

    expect(mockPush).toHaveBeenCalledWith('/scan');
  });

  it('remplace le bouton menu par l’élément leading fourni', () => {
    renderWithDrawer(
      <AppHeader title="Sous-écran" leading={<Text testID="header-retour">Retour</Text>} />,
    );

    expect(screen.getByTestId('header-retour')).toBeTruthy();
    expect(screen.queryByTestId('header-menu')).toBeNull();
  });

  it('affiche l’élément trailing fourni', () => {
    renderWithDrawer(<AppHeader title="Accueil" trailing={<Text testID="header-extra">✚</Text>} />);

    expect(screen.getByTestId('header-extra')).toBeTruthy();
  });

  it('applique l’état pressé sur les boutons menu et scan', () => {
    renderWithDrawer(<AppHeader title="Accueil" />);
    const fakeEvent = () => ({
      persist: jest.fn(),
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      nativeEvent: {},
    });

    const menu = screen.getByTestId('header-menu');
    fireEvent(menu, 'responderGrant', fakeEvent());
    expect(menu).toHaveStyle({ opacity: 0.6 });
    fireEvent(menu, 'responderRelease', fakeEvent());

    const scan = screen.getByTestId('header-scan');
    fireEvent(scan, 'responderGrant', fakeEvent());
    expect(scan).toHaveStyle({ opacity: 0.6 });
    fireEvent(scan, 'responderRelease', fakeEvent());
  });
});
