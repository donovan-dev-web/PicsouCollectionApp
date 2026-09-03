import { renderHook } from '@testing-library/react-native';
import * as ReactNative from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/use-settings-store';

describe('useThemeColors', () => {
  beforeEach(() => {
    useSettingsStore.setState({ colorScheme: 'system' });
    jest.restoreAllMocks();
  });

  it('renvoie la palette claire par defaut (systeme light)', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#FFFFFF');
    expect(result.current.text).toBe('#001B3D');
  });

  it('renvoie la palette sombre quand le systeme est en dark', () => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#0B1B33');
    expect(result.current.text).toBe('#FFFFFF');
  });

  it('applique le theme sombre manuel meme si le systeme est clair', () => {
    useSettingsStore.setState({ colorScheme: 'dark' });
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('light');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#0B1B33');
    expect(result.current.text).toBe('#FFFFFF');
  });

  it('applique le theme clair manuel meme si le systeme est sombre', () => {
    useSettingsStore.setState({ colorScheme: 'light' });
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue('dark');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current.background).toBe('#FFFFFF');
    expect(result.current.text).toBe('#001B3D');
  });
});
