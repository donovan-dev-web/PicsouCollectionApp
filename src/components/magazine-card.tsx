import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import type { MagazineListItem } from '@/types';

import { StatusBadge } from './status-badge';

type Props = {
  magazine: MagazineListItem;
  onPress?: () => void;
};

export function MagazineCard({ magazine, onPress }: Props) {
  const owned = magazine.quantity > 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      testID="magazine-card"
      accessibilityRole="button"
      accessibilityLabel={`${magazine.publication} numéro ${magazine.issueNumber}`}>
      <View style={styles.header}>
        <Text style={styles.publication}>{magazine.publication}</Text>
        <Text style={styles.issue}>n° {magazine.issueNumber}</Text>
      </View>
      <StatusBadge owned={owned} quantity={magazine.quantity} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  publication: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    flexShrink: 1,
  },
  issue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.light.accent,
  },
});
