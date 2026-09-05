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
      accessibilityLabel={
        magazine.issueNumber != null
          ? `${magazine.publication} numéro ${magazine.issueNumber}`
          : magazine.publication
      }
      accessibilityHint="Voir la fiche de l'édition"
      android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
      <View style={styles.header}>
        <Text style={styles.publication} numberOfLines={1} ellipsizeMode="tail">
          {magazine.publication}
        </Text>
        {magazine.issueNumber != null ? (
          <Text style={styles.issue} numberOfLines={1}>
            n° {magazine.issueNumber}
          </Text>
        ) : null}
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
      gap: Spacing.two,
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
      color: colors.accentTextOnLight,
    },
  });
}
