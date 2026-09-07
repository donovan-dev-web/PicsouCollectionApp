import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  /** null tant que la permission n'est pas résolue (chargement). */
  loading: boolean;
  canAskAgain: boolean;
  onRequestPermission: () => void;
  onCancel: () => void;
  /** Ajuste l'explication de l'accès caméra selon le contexte du flux. */
  description: string;
};

/**
 * Écran partagé de permission caméra (M10R2-02). Rendu dans `Screen` (SafeZone :
 * encoche + gesture bar) — variantes loading, demande (`canAskAgain`) et refus
 * définitif (« Ouvrir les réglages »), plus un bouton Retour. Évite la
 * duplication du même état entre les écrans caméra.
 */
export function CameraPermissionScreen({
  loading,
  canAskAgain,
  onRequestPermission,
  onCancel,
  description,
}: Props) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  return (
    <Screen style={styles.screen}>
      <View style={styles.container}>
        {loading ? (
          <View testID="camera-permission-loading">
            <Text style={styles.title}>Accès à la caméra</Text>
            <Text style={styles.message}>Demande d&apos;accès à la caméra…</Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>Accès à la caméra requis</Text>
            <Text style={styles.message}>{description}</Text>
            {canAskAgain ? (
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                onPress={onRequestPermission}
                testID="permission-request"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Autoriser la caméra</Text>
              </Pressable>
            ) : (
              <>
                <Text style={styles.errorText} testID="permission-denied">
                  Permission refusée. Autorisez la caméra dans les réglages.
                </Text>
                <Pressable
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                  onPress={() => void Linking.openSettings()}
                  testID="permission-settings"
                  accessibilityRole="button"
                  accessibilityLabel="Ouvrir les réglages">
                  <Text style={styles.primaryButtonText}>Ouvrir les réglages</Text>
                </Pressable>
              </>
            )}
          </>
        )}
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          onPress={onCancel}
          testID="permission-cancel"
          accessibilityRole="button">
          <Text style={styles.cancelButtonText}>Retour</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      padding: Spacing.four,
    },
    container: {
      flex: 1,
      justifyContent: 'center',
      gap: Spacing.three,
    },
    title: {
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
    },
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
      alignSelf: 'stretch',
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
      textAlign: 'center',
    },
    cancelButton: {
      alignSelf: 'center',
      minHeight: 44,
      justifyContent: 'center',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.8,
    },
  });
}
