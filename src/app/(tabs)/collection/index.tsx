import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { EmptyState } from '@/components/empty-state';
import { LoadingView } from '@/components/loading-view';
import { MagazineCard } from '@/components/magazine-card';
import { SelectField } from '@/components/select-field';
import { Screen } from '@/components/screen';
import { ScanFAB } from '@/components/scan-fab';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
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

  const hasFilters = issueQuery.trim().length > 0 || editionFilter !== null;
  const clearFilters = () => {
    setIssueQuery('');
    setEditionFilter(null);
    setPage(1);
  };

  return (
    <Screen noBottom>
      <View style={styles.screen}>
        <ScanFAB testID="collection-scan-fab" />
        <Text style={styles.title}>Ma Collection</Text>

        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Numéro</Text>
          <TextInput
            style={styles.input}
            value={issueQuery}
            onChangeText={applyIssue}
            placeholder="Ex : 547"
            keyboardType="number-pad"
            returnKeyType="done"
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
          {hasFilters ? (
            <Pressable
              style={({ pressed }) => [styles.clearButton, pressed && styles.buttonPressed]}
              onPress={clearFilters}
              testID="filter-clear"
              accessibilityRole="button"
              accessibilityLabel="Effacer les filtres"
              android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
              <Feather name="x" size={16} color={colors.textSecondary} />
              <Text style={styles.clearButtonText}>Effacer les filtres</Text>
            </Pressable>
          ) : null}
        </View>

        {loading && magazines.length === 0 ? (
          <LoadingView message="Chargement de la collection…" />
        ) : filtered.length === 0 ? (
          <EmptyState
            testID="collection-empty"
            icon={hasFilters ? 'search' : 'book-open'}
            title={hasFilters ? 'Aucun résultat' : 'Collection vide'}
            message={
              hasFilters
                ? 'Aucune édition ne correspond à ces filtres.'
                : 'Scannez votre premier magazine pour commencer.'
            }
            actionLabel={hasFilters ? undefined : 'Scanner un magazine'}
            onAction={hasFilters ? undefined : () => router.push('/scan')}
            actionTestID="collection-empty-scan"
          />
        ) : (
          <>
            <Text style={styles.resultCount} testID="collection-result-count">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </Text>
            <FlatList
              data={visible}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              keyboardShouldPersistTaps="handled"
              refreshControl={
                <RefreshControl
                  refreshing={loading}
                  onRefresh={load}
                  tintColor={colors.navActive}
                />
              }
              renderItem={({ item }) => (
                <MagazineCard
                  magazine={item}
                  onPress={() => router.push(`/collection/${item.id}`)}
                />
              )}
            />
            {totalPages > 1 ? (
              <View style={styles.pagination}>
                <Pressable
                  style={({ pressed }) => [styles.pageButton, pressed && styles.buttonPressed]}
                  onPress={() => goToPage(safePage - 1)}
                  disabled={safePage <= 1}
                  accessibilityRole="button"
                  accessibilityLabel="Page précédente"
                  accessibilityState={{ disabled: safePage <= 1 }}
                  testID="pagination-prev">
                  <Feather name="chevron-left" size={20} color={colors.text} />
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
                    <Text
                      style={p === safePage ? styles.pageButtonTextActive : styles.pageButtonText}>
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
                  accessibilityState={{ disabled: safePage >= totalPages }}
                  testID="pagination-next">
                  <Feather name="chevron-right" size={20} color={colors.text} />
                </Pressable>
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
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
      gap: Spacing.two,
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
    resultCount: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    list: {
      gap: Spacing.two,
    },
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
