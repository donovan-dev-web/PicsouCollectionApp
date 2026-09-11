import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

/**
 * Badge Possédé — retours test physique : le système d'exemplaires a été
 * supprimé, une édition en collection est donc toujours possédée. Le badge
 * confirme simplement la présence (vert positif + check, thématisé clair/sombre).
 */
export function StatusBadge() {
  const colors = useThemeColors();
  const styles = makeStyles();
  return (
    <View
      style={[styles.badge, { backgroundColor: colors.ownedBg }]}
      testID="status-owned"
      accessibilityLabel="Possédé">
      <Feather name="check-circle" size={14} color={colors.ownedText} />
      <Text style={[styles.text, { color: colors.ownedText }]}>Possédé</Text>
    </View>
  );
}

function makeStyles() {
  return StyleSheet.create({
    badge: {
      borderRadius: 8,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    text: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '700',
    },
  });
}
