import { Stack } from 'expo-router';

/**
 * Paramètres en sous-menus (M10R2-06) : chaque entrée du menu est un écran
 * dédié (Apparence, Sauvegarde, Accessibilité, Aide & retours) rendu dans un
 * Stack embarqué dans l'onglet Paramètres.
 */
export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Paramètres' }} />
      <Stack.Screen name="appearance" options={{ title: 'Apparence' }} />
      <Stack.Screen name="backup" options={{ title: 'Sauvegarde' }} />
      <Stack.Screen name="accessibility" options={{ title: 'Accessibilité' }} />
      <Stack.Screen name="advanced" options={{ title: 'Paramètres avancés' }} />
      <Stack.Screen name="help" options={{ title: 'Aide & retours' }} />
    </Stack>
  );
}
