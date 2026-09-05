import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { Screen } from '@/components/screen';

export default function ScanMethodScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Identifier le magazine</Text>
        <Text style={styles.subtitle}>Choisissez une méthode d&apos;identification.</Text>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan/barcode')}
            testID="method-barcode"
            accessibilityRole="button"
            accessibilityLabel="Scanner le code-barres"
            android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
            <Feather name="crop" size={20} color={colors.accentText} />
            <Text style={styles.primaryButtonText}>Scanner le code-barres</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan/camera')}
            testID="method-camera"
            accessibilityRole="button"
            accessibilityLabel="Identifier avec la caméra"
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
            <Feather name="camera" size={20} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Identifier avec la caméra</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan/manual')}
            testID="method-manual"
            accessibilityRole="button"
            accessibilityLabel="Saisir manuellement"
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
            <Feather name="edit-3" size={20} color={colors.text} />
            <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
          </Pressable>
        </View>

        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
          onPress={handleCancel}
          testID="method-cancel"
          accessibilityRole="button"
          accessibilityLabel="Annuler"
          hitSlop={HitTarget.hitSlop}>
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: Spacing.four,
      justifyContent: 'center',
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: Spacing.three,
    },
    actions: {
      gap: Spacing.three,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    secondaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.backgroundElement,
      minHeight: HitTarget.minHeight,
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
      minHeight: HitTarget.minHeight,
      justifyContent: 'center',
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
