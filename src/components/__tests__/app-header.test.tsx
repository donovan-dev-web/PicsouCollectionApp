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
});
