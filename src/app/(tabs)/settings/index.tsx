import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useSettingsStore, type ColorSchemeSetting } from '@/store/use-settings-store';

const THEME_OPTIONS: { value: ColorSchemeSetting; label: string; description: string }[] = [
  { value: 'system', label: 'Système', description: 'Suivre le thème de l’appareil' },
  { value: 'light', label: 'Clair', description: 'Appliquer le thème clair' },
  { value: 'dark', label: 'Sombre', description: 'Appliquer le thème sombre' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paramètres</Text>

      <Text style={styles.sectionTitle}>Apparence</Text>
      <View style={styles.options} testID="theme-options">
        {THEME_OPTIONS.map((option) => {
          const selected = option.value === colorScheme;
          return (
            <Pressable
              key={option.value}
              style={({ pressed }) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.buttonPressed,
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
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
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
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
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
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      borderWidth: 1,
      borderColor: colors.backgroundElement,
    },
    optionSelected: {
      borderColor: colors.accent,
    },
    optionTextWrap: {
      gap: 2,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionLabelSelected: {
      color: colors.accent,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
