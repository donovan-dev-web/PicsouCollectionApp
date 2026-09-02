import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.accent,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="collection/index" options={{ title: 'Collection' }} />
      <Tabs.Screen name="settings/index" options={{ title: 'Paramètres' }} />
    </Tabs>
  );
}
