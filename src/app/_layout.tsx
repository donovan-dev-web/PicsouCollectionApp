import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { initialize } from '@/dependencies';
import { useEffectiveColorScheme } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import { useSettingsStore } from '@/store/use-settings-store';

export default function RootLayout() {
  const scheme = useEffectiveColorScheme();
  const loadSummary = useCollectionStore((s) => s.loadSummary);
  const loadColorScheme = useSettingsStore((s) => s.loadColorScheme);

  useEffect(() => {
    initialize().then(async () => {
      await Promise.all([loadColorScheme(), loadSummary()]);
    });
  }, [loadColorScheme, loadSummary]);

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="scan/index" />
        <Stack.Screen name="scan/manual" />
        <Stack.Screen name="collection/[id]/index" options={{ presentation: 'modal' }} />
        <Stack.Screen name="collection/[id]/edit" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}
