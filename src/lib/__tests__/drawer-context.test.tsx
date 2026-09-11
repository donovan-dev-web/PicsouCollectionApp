import { act, renderHook } from '@testing-library/react-native';

import { DrawerProvider, useDrawer } from '@/lib/drawer-context';

describe('useDrawer / DrawerProvider', () => {
  it('expose par défaut un tiroir fermé et inerte', () => {
    const { result } = renderHook(() => useDrawer());

    expect(result.current.visible).toBe(false);
    result.current.open();
    expect(result.current.visible).toBe(false);
  });

  it('ouvre puis ferme le tiroir via le provider', () => {
    const { result } = renderHook(() => useDrawer(), { wrapper: DrawerProvider });

    expect(result.current.visible).toBe(false);

    act(() => result.current.open());
    expect(result.current.visible).toBe(true);

    act(() => result.current.close());
    expect(result.current.visible).toBe(false);
  });
});
