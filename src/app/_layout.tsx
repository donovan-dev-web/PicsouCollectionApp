import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { initialize } from '@/dependencies';
import { useCollectionStore } from '@/store/use-collection-store';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const loadCollection = useCollectionStore((s) => s.load);

  useEffect(() => {
    initialize().then(loadCollection);
  }, [loadCollection]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
