import { Tabs } from 'expo-router';

import { useThemeColors } from '@/hooks/use-theme';

export default function TabsLayout() {
  const colors = useThemeColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="collection/index" options={{ title: 'Collection' }} />
      <Tabs.Screen name="settings/index" options={{ title: 'Paramètres' }} />
    </Tabs>
  );
}
