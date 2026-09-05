import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { initialize } from '@/dependencies';
import { useEffectiveColorScheme } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { DrawerMenu } from '@/components/drawer-content';
import { DrawerProvider, useDrawer } from '@/lib/drawer-context';

function RootLayoutInner() {
  const scheme = useEffectiveColorScheme();
  const { open, close } = useDrawer();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const loadSummary = useCollectionStore((s) => s.loadSummary);
  const loadColorScheme = useSettingsStore((s) => s.loadColorScheme);
  const magazines = useCollectionStore((s) => s.magazines);

  const editions = [
    ...new Set(magazines.map((m) => m.edition).filter((e): e is string => !!e)),
  ].sort();

  useEffect(() => {
    initialize().then(async () => {
      await Promise.all([loadColorScheme(), loadSummary()]);
    });
  }, [loadColorScheme, loadSummary]);

  const handleOpen = () => setDrawerVisible(true);
  const handleClose = () => setDrawerVisible(false);

  return (
    <SafeAreaProvider>
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="scan/index" options={{ title: 'Identifier' }} />
          <Stack.Screen name="scan/barcode" options={{ title: 'Scanner code-barres' }} />
          <Stack.Screen name="scan/camera" options={{ title: 'Caméra OCR' }} />
          <Stack.Screen name="scan/manual" options={{ title: 'Saisie manuelle' }} />
          <Stack.Screen name="scan/form-barcode" options={{ title: 'Scanner code-barres' }} />
          <Stack.Screen name="scan/multiple" options={{ title: 'Choisir édition' }} />
          <Stack.Screen name="scan/result" options={{ title: 'Résultat' }} />
          <Stack.Screen
            name="collection/[id]/index"
            options={{ presentation: 'modal', title: 'Fiche magazine' }}
          />
          <Stack.Screen
            name="collection/[id]/edit"
            options={{ presentation: 'modal', title: 'Modifier' }}
          />
        </Stack>
        <DrawerMenu visible={drawerVisible} onClose={handleClose} editions={editions} />
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <DrawerProvider>
      <RootLayoutInner />
    </DrawerProvider>
  );
}
