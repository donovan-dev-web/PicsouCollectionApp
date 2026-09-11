import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { pageWindow } from '@/lib/collection-list';

function makePaginationStyles(colors: ThemeColors) {
  return StyleSheet.create({
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      flexWrap: 'wrap',
      paddingTop: Spacing.two,
    },
    pageButton: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.two,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
    },
    pageButtonActive: {
      backgroundColor: colors.accent,
    },
    pageButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    pageButtonTextActive: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
}

export function Pagination({
  current,
  total,
  onPrev,
  onNext,
  onPage,
}: {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onPage: (page: number) => void;
}) {
  const colors = useThemeColors();
  const styles = makePaginationStyles(colors);

  if (total <= 1) {
    return null;
  }

  return (
    <View style={styles.pagination}>
      <Pressable
        style={({ pressed }) => [styles.pageButton, pressed && styles.buttonPressed]}
        onPress={onPrev}
        disabled={current <= 1}
        accessibilityRole="button"
        accessibilityLabel="Page précédente"
        accessibilityState={{ disabled: current <= 1 }}
        testID="pagination-prev">
        <Feather name="chevron-left" size={20} color={colors.text} />
      </Pressable>
      {pageWindow(current, total).map((p) => (
        <Pressable
          key={p}
          style={({ pressed }) => [
            styles.pageButton,
            p === current && styles.pageButtonActive,
            pressed && styles.buttonPressed,
          ]}
          onPress={() => onPage(p)}
          disabled={p === current}
          accessibilityRole="button"
          accessibilityLabel={`Page ${p}`}
          accessibilityState={{ selected: p === current }}
          testID={`pagination-page-${p}`}>
          <Text style={p === current ? styles.pageButtonTextActive : styles.pageButtonText}>
            {p}
          </Text>
        </Pressable>
      ))}
      <Pressable
        style={({ pressed }) => [styles.pageButton, pressed && styles.buttonPressed]}
        onPress={onNext}
        disabled={current >= total}
        accessibilityRole="button"
        accessibilityLabel="Page suivante"
        accessibilityState={{ disabled: current >= total }}
        testID="pagination-next">
        <Feather name="chevron-right" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}
