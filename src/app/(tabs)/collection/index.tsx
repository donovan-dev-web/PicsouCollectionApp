import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/app-header';
import { CollectionFilters } from '@/components/collection-filters';
import { EmptyState } from '@/components/empty-state';
import { LoadingView } from '@/components/loading-view';
import { MagazineCard } from '@/components/magazine-card';
import { Pagination } from '@/components/pagination';
import { Screen } from '@/components/screen';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineListItem } from '@/types';
import {
  buildEditionOptions,
  filterAndSortMagazines,
  PAGE_SIZE,
  type SortOption,
} from '@/lib/collection-list';

export default function CollectionScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams<{ edition?: string }>();
  const magazines = useCollectionStore((s) => s.magazines);
  const loading = useCollectionStore((s) => s.loading);
  const load = useCollectionStore((s) => s.load);
  const [issueQuery, setIssueQuery] = useState('');
  const [editionFilter, setEditionFilter] = useState<string | null>(null);
  const [sort, setSort] = useState<SortOption>('Numéro ↑');
  const [page, setPage] = useState(1);
  const [lastParamEdition, setLastParamEdition] = useState<string | undefined>(undefined);

  const paramEdition = typeof params.edition === 'string' ? params.edition : undefined;
  if (paramEdition !== lastParamEdition) {
    setLastParamEdition(paramEdition);
    if (paramEdition) {
      setEditionFilter(paramEdition);
      setPage(1);
    }
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const editions = useMemo(() => buildEditionOptions(magazines), [magazines]);

  const filtered = useMemo(
    () => filterAndSortMagazines(magazines, editionFilter, issueQuery, sort),
    [magazines, editionFilter, issueQuery, sort],
  );

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

  const applySort = (value: string | null) => {
    if (value != null) {
      setSort(value as SortOption);
      setPage(1);
    }
  };

  const hasFilters = issueQuery.trim().length > 0 || editionFilter !== null;
  const clearFilters = () => {
    setIssueQuery('');
    setEditionFilter(null);
    setPage(1);
    router.setParams({ edition: undefined });
  };

  return (
    <Screen noBottom>
      <AppHeader title="Ma Collection" />
      <View style={styles.screen}>
        <CollectionFilters
          issueQuery={issueQuery}
          editionFilter={editionFilter}
          sort={sort}
          editions={editions}
          onIssueChange={applyIssue}
          onEditionChange={applyEdition}
          onSortChange={applySort}
          onClear={clearFilters}
        />

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
          <CollectionList
            items={visible}
            resultCount={filtered.length}
            loading={loading}
            onRefresh={load}
            onPress={(item) => router.push(`/collection/${item.id}`)}
            tintColor={colors.navActive}
            listStyle={styles.list}
          />
        )}
        <Pagination
          current={safePage}
          total={totalPages}
          onPrev={() => goToPage(safePage - 1)}
          onNext={() => goToPage(safePage + 1)}
          onPage={goToPage}
        />
      </View>
    </Screen>
  );
}

function CollectionList({
  items,
  resultCount,
  loading,
  onRefresh,
  onPress,
  tintColor,
  listStyle,
}: {
  items: MagazineListItem[];
  resultCount: number;
  loading: boolean;
  onRefresh: () => void;
  onPress: (item: MagazineListItem) => void;
  tintColor: string;
  listStyle: object;
}) {
  const colors = useThemeColors();
  return (
    <>
      <Text style={makeResultCountStyles(colors).resultCount} testID="collection-result-count">
        {resultCount} résultat{resultCount > 1 ? 's' : ''}
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={listStyle}
        keyboardShouldPersistTaps="handled"
        testID="collection-list"
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={tintColor} />
        }
        renderItem={({ item }) => <MagazineCard magazine={item} onPress={() => onPress(item)} />}
      />
    </>
  );
}

function makeResultCountStyles(colors: ThemeColors) {
  return StyleSheet.create({
    resultCount: {
      fontSize: 13,
      color: colors.textSecondary,
    },
  });
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    list: {
      gap: Spacing.two,
    },
  });
}
