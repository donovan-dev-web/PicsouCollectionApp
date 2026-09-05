import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionTestID?: string;
  testID?: string;
};

/**
 * État vide pro (M10-11) : icône Feather, titre, message, CTA primaire.
 * `testID` préservé pour compatibilité (ex. `collection-empty`).
 */
export function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  actionTestID,
  testID,
}: Props) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  return (
    <View style={styles.wrap} testID={testID} accessibilityRole="summary">
      <Feather name={icon} size={40} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          onPress={onAction}
          testID={actionTestID}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
          <Text style={styles.actionText}>{actionLabel}</Text>
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
    title: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    action: {
      marginTop: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: HitTarget.minHeight,
      justifyContent: 'center',
      paddingHorizontal: Spacing.four,
      borderRadius: 10,
    },
    pressed: {
      opacity: 0.8,
    },
    actionText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
    },
  });
}
