import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
  retryTestID?: string;
  testID?: string;
};

/** État d'erreur pro (M10-11) : icône + message + bouton Réessayer. */
export function ErrorView({
  message,
  retryLabel = 'Réessayer',
  onRetry,
  retryTestID,
  testID,
}: Props) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.wrap} testID={testID} accessibilityRole="alert">
      <Feather name="alert-circle" size={40} color={colors.danger} />
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
          onPress={onRetry}
          testID={retryTestID}
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      paddingVertical: Spacing.five,
      paddingHorizontal: Spacing.four,
    },
    message: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.text,
      textAlign: 'center',
    },
    retry: {
      marginTop: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      minHeight: HitTarget.minHeight,
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
      borderRadius: 10,
    },
    pressed: {
      opacity: 0.8,
    },
    retryText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
