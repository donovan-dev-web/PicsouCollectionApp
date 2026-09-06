import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';

const MENU_ITEMS: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  description: string;
  route: string;
  testID: string;
}[] = [
  {
    icon: 'sun',
    label: 'Apparence',
    description: 'Thème de l’application',
    route: '/settings/appearance',
    testID: 'settings-appearance',
  },
  {
    icon: 'download',
    label: 'Sauvegarde',
    description: 'Export et import de la collection',
    route: '/settings/backup',
    testID: 'settings-backup',
  },
  {
    icon: 'eye',
    label: 'Accessibilité',
    description: 'Réduire les animations',
    route: '/settings/accessibility',
    testID: 'settings-accessibility',
  },
  {
    icon: 'message-circle',
    label: 'Aide & retours',
    description: 'Bug, idée, suggestion',
    route: '/settings/help',
    testID: 'settings-help',
  },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();

  return (
    <Screen noBottom>
      <AppHeader title="Paramètres" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.menu} testID="settings-menu">
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.route}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={() => router.push(item.route)}
              testID={item.testID}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
              <View style={styles.menuIcon}>
                <Feather name={item.icon} size={20} color={colors.accent} />
              </View>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    menu: {
      gap: Spacing.two,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      minHeight: 64,
    },
    menuIcon: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: {
      flex: 1,
      gap: 2,
    },
    menuLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    menuDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
