import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export default function ScanMethodScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Identifier le magazine</Text>
      <Text style={styles.subtitle}>Choisissez une méthode d&apos;identification.</Text>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/scan/barcode')}
          testID="method-barcode"
          accessibilityRole="button"
          accessibilityLabel="Scanner le code-barres">
          <Text style={styles.primaryButtonText}>▣ Scanner le code-barres</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/scan/camera')}
          testID="method-camera"
          accessibilityRole="button"
          accessibilityLabel="Identifier avec la caméra">
          <Text style={styles.secondaryButtonText}>📷 Identifier avec la caméra</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={() => router.push('/scan/manual')}
          testID="method-manual"
          accessibilityRole="button"
          accessibilityLabel="Saisir manuellement">
          <Text style={styles.secondaryButtonText}>✎ Saisir manuellement</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
        onPress={() => router.back()}
        testID="method-cancel"
        accessibilityRole="button"
        accessibilityLabel="Annuler">
        <Text style={styles.cancelButtonText}>Annuler</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
      justifyContent: 'center',
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.three,
    },
    actions: {
      gap: Spacing.three,
    },
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    cancelButton: {
      alignSelf: 'center',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      marginTop: Spacing.three,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
  });
}
