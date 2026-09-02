import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { MagazineCard } from '@/components/magazine-card';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';

export default function CollectionScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const magazines = useCollectionStore((s) => s.magazines);
  const loading = useCollectionStore((s) => s.loading);
  const load = useCollectionStore((s) => s.load);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return magazines;
    }
    return magazines.filter((m) => {
      const numMatch = m.issueNumber != null && String(m.issueNumber) === term;
      return m.publication.toLowerCase().includes(term) || numMatch;
    });
  }, [magazines, query]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Ma Collection</Text>
      <TextInput
        style={styles.search}
        value={query}
        onChangeText={setQuery}
        placeholder="Rechercher par titre ou numéro"
        placeholderTextColor={colors.textSecondary}
        testID="collection-search"
        accessibilityLabel="Rechercher"
      />
      {loading && magazines.length === 0 ? (
        <Text style={styles.empty}>Chargement…</Text>
      ) : filtered.length === 0 ? (
        <Text style={styles.empty} testID="collection-empty">
          Aucune édition.
        </Text>
      ) : (
        <>
          {query.trim() !== '' && (
            <Text style={styles.resultCount} testID="collection-result-count">
              {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
            </Text>
          )}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <MagazineCard magazine={item} onPress={() => router.push(`/collection/${item.id}`)} />
            )}
          />
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
    search: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
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
  });
}
