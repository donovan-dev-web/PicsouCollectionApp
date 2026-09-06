import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { useSettingsStore, type ColorSchemeSetting } from '@/store/use-settings-store';

const THEME_OPTIONS: { value: ColorSchemeSetting; label: string; description: string }[] = [
  { value: 'system', label: 'Système', description: 'Suivre le thème de l’appareil' },
  { value: 'light', label: 'Clair', description: 'Appliquer le thème clair' },
  { value: 'dark', label: 'Sombre', description: 'Appliquer le thème sombre' },
];

export default function AppearanceScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  return (
    <Screen noBottom>
      <AppHeader
        title="Apparence"
        leading={
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            testID="appearance-back"
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Thème</Text>
        <View style={styles.options} testID="theme-options">
          {THEME_OPTIONS.map((option) => {
            const selected = option.value === colorScheme;
            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => setColorScheme(option.value)}
                testID={`theme-option-${option.value}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={option.label}>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selected ? (
                  <Feather name="check" size={20} color={colors.accentTextOnLight} />
                ) : null}
              </Pressable>
            );
          })}
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
    headerButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: Spacing.two,
    },
    options: {
      gap: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      minHeight: 56,
      borderWidth: 2,
      borderColor: colors.backgroundElement,
    },
    optionSelected: {
      borderColor: colors.accent,
    },
    optionTextWrap: {
      flex: 1,
      gap: 2,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionLabelSelected: {
      color: colors.accentTextOnLight,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
