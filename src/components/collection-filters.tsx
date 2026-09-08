import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { SelectField } from '@/components/select-field';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { SORT_OPTIONS, type SortOption } from '@/lib/collection-list';

export function makeCollectionFilterStyles(colors: ThemeColors) {
  return StyleSheet.create({
    filters: {
      gap: Spacing.two,
    },
    searchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    searchButtonText: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.accentText,
    },
    filtersPanel: {
      gap: Spacing.two,
    },
    filtersRow: {
      flexDirection: 'row',
      gap: Spacing.two,
      alignItems: 'flex-start',
    },
    filtersColumn: {
      flex: 1,
    },
    filterLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.two,
    },
    input: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      minHeight: HitTarget.minHeight,
      fontSize: 16,
      color: colors.text,
    },
    clearButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 6,
      minHeight: HitTarget.minHeight,
      paddingHorizontal: Spacing.two,
    },
    clearButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    buttonPressed: {
      opacity: 0.7,
    },
  });
}

type Props = {
  issueQuery: string;
  editionFilter: string | null;
  sort: SortOption;
  editions: string[];
  onIssueChange: (value: string) => void;
  onEditionChange: (value: string | null) => void;
  onSortChange: (value: string | null) => void;
  onClear: () => void;
};

export function CollectionFilters({
  issueQuery,
  editionFilter,
  sort,
  editions,
  onIssueChange,
  onEditionChange,
  onSortChange,
  onClear,
}: Props) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(Boolean(editionFilter));
  const styles = makeCollectionFilterStyles(colors);
  const hasFilters = issueQuery.trim().length > 0 || editionFilter !== null;

  return (
    <View style={styles.filters}>
      <Pressable
        style={({ pressed }) => [styles.searchButton, pressed && styles.buttonPressed]}
        onPress={() => setOpen((o) => !o)}
        testID="filter-toggle"
        accessibilityRole="button"
        accessibilityLabel="Rechercher"
        accessibilityState={{ expanded: open }}>
        <Feather name="search" size={20} color={colors.accentText} />
        <Text style={styles.searchButtonText}>Rechercher</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.accentText} />
      </Pressable>

      {open ? (
        <View style={styles.filtersPanel}>
          <View style={styles.filtersRow}>
            <View style={styles.filtersColumn}>
              <Text style={styles.filterLabel}>Numéro</Text>
              <TextInput
                style={styles.input}
                value={issueQuery}
                onChangeText={onIssueChange}
                placeholder="Ex : 547"
                keyboardType="number-pad"
                returnKeyType="done"
                placeholderTextColor={colors.textSecondary}
                testID="filter-issue"
                accessibilityLabel="Filtrer par numéro"
              />
            </View>
            <View style={styles.filtersColumn}>
              <SelectField
                label="Tri"
                placeholder="Tri"
                value={sort}
                options={SORT_OPTIONS}
                onSelect={onSortChange}
                testID="filter-sort"
              />
            </View>
          </View>
          <SelectField
            label="Édition"
            placeholder="Toutes les éditions"
            value={editionFilter}
            options={editions}
            onSelect={onEditionChange}
            noneLabel="Toutes les éditions"
            testID="filter-edition"
          />
          {hasFilters ? (
            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
              onPress={onClear}
              testID="filter-clear"
              accessibilityRole="button"
              accessibilityLabel="Effacer les filtres"
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
              <Feather name="x" size={16} color={colors.textSecondary} />
              <Text style={styles.clearButtonText}>Effacer les filtres</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
