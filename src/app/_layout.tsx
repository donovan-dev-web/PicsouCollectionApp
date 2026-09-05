import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createDrawerNavigator } from '@react-navigation/drawer';

import { initialize } from '@/dependencies';
import { useEffectiveColorScheme, useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import { useSettingsStore } from '@/store/use-settings-store';
import { DrawerContent } from '@/components/drawer-content';

const Drawer = createDrawerNavigator();

function RootDrawer() {
  const colors = useThemeColors();
  const editions = useCollectionStore((s) =>
    [...new Set(s.magazines.map((m) => m.edition).filter((e): e is string => !!e))].sort(),
  );

  return (
    <Drawer.Navigator
      drawerContent={() => <DrawerContent editions={editions} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          backgroundColor: colors.background,
          width: 280,
        },
      }}>
      <Drawer.Screen name="app" component={RootStack} />
    </Drawer.Navigator>
  );
}

function RootStack() {
  return (
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
  );
}

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootDrawer />
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
