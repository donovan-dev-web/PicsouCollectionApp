import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  message?: string;
  testID?: string;
};

/** État de chargement pro (M10-11) : spinner + message, annoncé (live-region). */
export function LoadingView({ message = 'Chargement…', testID }: Props) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  return (
    <View
      style={styles.wrap}
      testID={testID}
      accessibilityRole="progressbar"
      accessibilityLiveRegion="polite"
      accessibilityLabel={message}>
      <ActivityIndicator
        testID={testID ? `${testID}-spinner` : 'loading-spinner'}
        color={colors.navActive}
      />
      <Text style={styles.message}>{message}</Text>
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
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
}
