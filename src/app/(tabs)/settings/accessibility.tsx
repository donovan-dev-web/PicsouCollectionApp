import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { useSettingsStore } from '@/store/use-settings-store';

export default function AccessibilityScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);

  return (
    <Screen noBottom>
      <AppHeader
        title="Accessibilité"
        leading={
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            testID="accessibility-back"
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Mouvement & animations</Text>
        <Pressable
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          onPress={() => setReducedMotion(!reducedMotion)}
          testID="accessibility-reduced-motion"
          accessibilityRole="switch"
          accessibilityState={{ checked: reducedMotion }}>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionLabel}>Réduire les animations</Text>
            <Text style={styles.optionDescription}>
              Limite les transitions (menu, panneaux) pour un confort de lecture.
            </Text>
          </View>
          <View style={[styles.switch, reducedMotion && styles.switchActive]} testID="accessibility-switch">
            <View style={[styles.switchKnob, reducedMotion && styles.switchKnobActive]} />
          </View>
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
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      minHeight: 64,
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
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    switch: {
      width: 48,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.textSecondary,
      padding: 2,
    },
    switchActive: {
      backgroundColor: colors.accent,
    },
    switchKnob: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: '#FFFFFF',
    },
    switchKnobActive: {
      transform: [{ translateX: 20 }],
    },
    pressed: {
      opacity: 0.8,
    },
  });
}