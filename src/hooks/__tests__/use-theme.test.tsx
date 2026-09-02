import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';

describe('useThemeColors', () => {
  it('renvoie la palette claire par defaut', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#FFFFFF');
    expect(result.current.text).toBe('#001B3D');
    jest.restoreAllMocks();
  });

  it('renvoie la palette sombre quand le systeme est en dark', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#0B1B33');
    expect(result.current.text).toBe('#FFFFFF');
    jest.restoreAllMocks();
  });
});
