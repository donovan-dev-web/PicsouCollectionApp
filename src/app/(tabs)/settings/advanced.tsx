import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { useSettingsStore } from '@/store/use-settings-store';

/** Paramètres avancés — retours test physique : debug OCR activé depuis l'app. */
export default function AdvancedSettingsScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const router = useRouter();
  const ocrDebug = useSettingsStore((s) => s.ocrDebug);
  const setOcrDebug = useSettingsStore((s) => s.setOcrDebug);

  return (
    <Screen noBottom>
      <AppHeader
        title="Paramètres avancés"
        leading={
          <Pressable
            style={({ pressed }) => [styles.headerButton, pressed && styles.pressed]}
            onPress={() => router.back()}
            testID="advanced-back"
            accessibilityRole="button"
            accessibilityLabel="Retour">
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
        }
      />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Reconnaissance</Text>
        <Pressable
          style={({ pressed }) => [styles.option, pressed && styles.pressed]}
          onPress={() => setOcrDebug(!ocrDebug)}
          testID="advanced-ocr-debug"
          accessibilityRole="switch"
          accessibilityState={{ checked: ocrDebug }}>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionLabel}>Debug OCR</Text>
            <Text style={styles.optionDescription}>
              Affiche en surcouche caméra le texte brut détecté, les champs parsés, la confiance et
              le nombre de lectures identiques.
            </Text>
          </View>
          <View style={[styles.switch, ocrDebug && styles.switchActive]} testID="advanced-switch">
            <View style={[styles.switchKnob, ocrDebug && styles.switchKnobActive]} />
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
