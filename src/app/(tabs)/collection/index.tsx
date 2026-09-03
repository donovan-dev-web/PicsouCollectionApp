import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { MagazineCard } from '@/components/magazine-card';
import { SelectField } from '@/components/select-field';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';

const PAGE_SIZE = 20;

function pageWindow(current: number, total: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export default function CollectionScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const magazines = useCollectionStore((s) => s.magazines);
  const loading = useCollectionStore((s) => s.loading);
  const load = useCollectionStore((s) => s.load);
  const [issueQuery, setIssueQuery] = useState('');
  const [editionFilter, setEditionFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const editions = useMemo(
    () => [...new Set(magazines.map((m) => m.edition).filter((e): e is string => !!e))].sort(),
    [magazines],
  );

  const filtered = useMemo(() => {
    const issue = issueQuery.trim();
    return magazines.filter((m) => {
      if (editionFilter && m.edition !== editionFilter) {
        return false;
      }
      if (issue) {
        const parsed = Number(issue);
        if (Number.isNaN(parsed) || m.issueNumber !== parsed) {
          return false;
        }
      }
      return true;
    });
  }, [magazines, issueQuery, editionFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages) {
      return;
    }
    setPage(target);
  };

  const applyIssue = (value: string) => {
    setIssueQuery(value);
    setPage(1);
  };

  const applyEdition = (value: string | null) => {
    setEditionFilter(value);
    setPage(1);
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ma Collection</Text>

      <View style={styles.filters}>
        <Text style={styles.filterLabel}>Numéro</Text>
        <TextInput
          style={styles.input}
          value={issueQuery}
          onChangeText={applyIssue}
          placeholder="Ex : 547"
          keyboardType="number-pad"
          placeholderTextColor={colors.textSecondary}
          testID="filter-issue"
          accessibilityLabel="Filtrer par numéro"
        />
        <SelectField
          label="Édition"
          placeholder="Toutes les éditions"
          value={editionFilter}
          options={editions}
          onSelect={applyEdition}
          noneLabel="Toutes les éditions"
          testID="filter-edition"
        />
      </View>

      {loading && magazines.length === 0 ? (
        <Text style={styles.empty}>Chargement…</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty} testID="collection-empty">
          Aucune édition.
        </Text>
      ) : (
        <>
          <Text style={styles.resultCount} testID="collection-result-count">
            {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
          </Text>
          <FlatList
            data={visible}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MagazineCard magazine={item} onPress={() => router.push(`/collection/${item.id}`)} />
            )}
          />
          <View style={styles.pagination}>
            <Pressable
              style={({ pressed }) => [styles.pageButton, pressed && styles.buttonPressed]}
              onPress={() => goToPage(safePage - 1)}
              disabled={safePage <= 1}
              accessibilityRole="button"
              accessibilityLabel="Page précédente"
              testID="pagination-prev">
              <Text style={styles.pageButtonText}>‹</Text>
            </Pressable>
            {pageWindow(safePage, totalPages).map((p) => (
              <Pressable
                key={p}
                style={({ pressed }) => [
                  styles.pageButton,
                  p === safePage && styles.pageButtonActive,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => goToPage(p)}
                disabled={p === safePage}
                accessibilityRole="button"
                accessibilityLabel={`Page ${p}`}
                accessibilityState={{ selected: p === safePage }}
                testID={`pagination-page-${p}`}>
                <Text style={p === safePage ? styles.pageButtonTextActive : styles.pageButtonText}>
                  {p}
                </Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.pageButton, pressed && styles.buttonPressed]}
              onPress={() => goToPage(safePage + 1)}
              disabled={safePage >= totalPages}
              accessibilityRole="button"
              accessibilityLabel="Page suivante"
              testID="pagination-next">
              <Text style={styles.pageButtonText}>›</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    filters: {
      gap: 4,
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
      fontSize: 16,
      color: colors.text,
    },
    resultCount: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    list: {
      gap: Spacing.two,
    },
    empty: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.four,
    },
    pagination: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      flexWrap: 'wrap',
    },
    pageButton: {
      minWidth: 36,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: Spacing.two,
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
