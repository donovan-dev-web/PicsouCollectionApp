import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export default function CameraScanScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Caméra / OCR</Text>
      <Text style={styles.subtitle}>
        La reconnaissance de couverture par OCR arrive dans la phase M-05. Le scan code-barres reste
        disponible.
      </Text>
      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        onPress={() => router.push('/scan/barcode')}
        testID="go-barcode"
        accessibilityRole="button">
        <Text style={styles.primaryButtonText}>Scanner le code-barres</Text>
      </Pressable>
      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={() => router.push('/scan/manual')}
        testID="go-manual"
        accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    primaryButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    primaryButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.accentText,
    },
    secondaryButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
