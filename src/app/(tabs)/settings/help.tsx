import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';

const GITHUB_DISCUSSIONS_URL = 'https://github.com/donovan-dev-web/PicsouCollectionApp/discussions';

const HELP_ITEMS: {
  icon: React.ComponentProps<typeof Feather>['name'];
  label: string;
  description: string;
  testID: string;
}[] = [
  {
    icon: 'alert-triangle',
    label: 'Signaler un bug',
    description: 'Un comportement qui cloche ?',
    testID: 'help-bug',
  },
  {
    icon: 'star',
    label: 'Proposer une idée',
    description: 'Une fonctionnalité qui manque ?',
    testID: 'help-idea',
  },
  {
    icon: 'message-circle',
    label: 'Laisser une suggestion',
    description: 'Améliorer l’expérience d’utilisation.',
    testID: 'help-suggestion',
  },
];

/** Ouvre la page Discussions du dépôt GitHub (M10R2-06). */
function openDiscussions() {
  void Linking.openURL(GITHUB_DISCUSSIONS_URL);
}

export default function HelpScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();

  return (
    <Screen noBottom>
      <AppHeader
        title="Aide & retours"
        leading={
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            testID="help-back"
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.intro}>
          Un bug, une idée, une suggestion ? Ouvrez la page Discussions du projet sur GitHub.
        </Text>
        <View style={styles.menu} testID="help-menu">
          {HELP_ITEMS.map((item) => (
            <Pressable
              key={item.testID}
              style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
              onPress={openDiscussions}
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
              <Feather name="external-link" size={18} color={colors.textSecondary} />
            </Pressable>
          ))}
        </View>
        <Pressable
          style={({ pressed }) => [styles.discussionsButton, pressed && styles.pressed]}
          onPress={openDiscussions}
          testID="help-discussions"
          accessibilityRole="button">
          <Text style={styles.discussionsButtonText}>Ouvrir les Discussions</Text>
        </Pressable>
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
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    intro: {
      marginTop: Spacing.two,
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
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
    discussionsButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
    },
    discussionsButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
