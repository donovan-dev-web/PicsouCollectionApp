import { StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  owned: boolean;
  quantity?: number;
};

/**
 * Badge Possédé / Absent — M10-01/M10-07 : sémantique inversée validée.
 * Possédé = vert positif (+ check), Absent = neutre. Thématisé clair/sombre,
 * `accessibilityRole="status"`, 13px min (M10-10).
 */
export function StatusBadge({ owned, quantity = 0 }: Props) {
  const colors = useThemeColors();
  const styles = makeStyles();
  return owned ? (
    <View
      style={[styles.badge, { backgroundColor: colors.ownedBg }]}
      testID="status-owned"
      accessibilityRole="summary"
      accessibilityLabel={quantity > 0 ? `Possédé, ${quantity} exemplaires` : 'Possédé'}>
      <Feather name="check-circle" size={14} color={colors.ownedText} />
      <Text style={[styles.text, { color: colors.ownedText }]}>
        Possédé{quantity > 0 ? ` (${quantity})` : ''}
      </Text>
    </View>
  ) : (
    <View
      style={[styles.badge, { backgroundColor: colors.absentBg }]}
      testID="status-absent"
      accessibilityRole="summary"
      accessibilityLabel="Absent de la collection">
      <Feather name="x-circle" size={14} color={colors.absentText} />
      <Text style={[styles.text, { color: colors.absentText }]}>Absent</Text>
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
