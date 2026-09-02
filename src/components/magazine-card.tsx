import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import type { MagazineListItem } from '@/types';

import { StatusBadge } from './status-badge';

type Props = {
  magazine: MagazineListItem;
  onPress?: () => void;
};

export function MagazineCard({ magazine, onPress }: Props) {
  const colors = useThemeColors();
  const owned = magazine.quantity > 0;
  const styles = makeStyles(colors);

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

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.backgroundElement,
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
      color: colors.text,
      flexShrink: 1,
    },
    issue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.accent,
    },
  });
}
