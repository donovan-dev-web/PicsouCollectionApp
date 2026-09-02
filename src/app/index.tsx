import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';

export default function HomeScreen() {
  const router = useRouter();
  const totalCopies = useCollectionStore((s) => s.totalCopies);
  const recentCopies = useCollectionStore((s) => s.recentCopies);
  const loading = useCollectionStore((s) => s.loading);
  const loaded = useCollectionStore((s) => s.loaded);
  const load = useCollectionStore((s) => s.load);
  const loadRecent = useCollectionStore((s) => s.loadRecent);

  useFocusEffect(
    useCallback(() => {
      load();
      loadRecent();
    }, [load, loadRecent]),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>🦆 Picsou Collection</Text>
      <Text style={styles.subtitle}>
        Collectionnez vos magazines Disney, sans doublons, sans internet.
      </Text>

      <View style={styles.counterCard} testID="collection-counter">
        {loading && !loaded ? (
          <ActivityIndicator testID="counter-loading" color={Colors.light.accent} />
        ) : (
          <>
            <Text style={styles.counterValue}>{totalCopies}</Text>
            <Text style={styles.counterLabel}>exemplaires possédés</Text>
          </>
        )}
      </View>

      <View style={styles.recentSection}>
        <Text style={styles.recentTitle}>Ajouts récents</Text>
        {recentCopies.length === 0 ? (
          <Text style={styles.emptyText} testID="recent-empty">
            Aucun ajout pour le moment.
          </Text>
        ) : (
          recentCopies.map(({ copy, magazine }) => (
            <View key={copy.id} style={styles.recentItem} testID="recent-item">
              <Text style={styles.recentItemTitle}>
                {magazine.publication}
                {magazine.issueNumber != null ? ` n°${magazine.issueNumber}` : ''}
              </Text>
              <Text style={styles.recentItemDate}>{copy.dateAdded.slice(0, 10)}</Text>
            </View>
          ))
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.scanButton, pressed && styles.buttonPressed]}
        onPress={() => router.push('/scan')}
        testID="scan-button"
        accessibilityRole="button"
        accessibilityLabel="Scanner un magazine">
        <Text style={styles.scanButtonText}>📷 Scanner</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
        onPress={() => router.push('/scan/manual')}
        testID="add-button"
        accessibilityRole="button"
        accessibilityLabel="Ajouter une édition">
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  container: {
    alignItems: 'stretch',
    padding: Spacing.four,
    gap: Spacing.three,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  counterCard: {
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 12,
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.four,
    minWidth: 160,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '800',
    color: Colors.light.accent,
  },
  counterLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: Spacing.two,
  },
  recentSection: {
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  recentItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.light.text,
  },
  recentItemDate: {
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  scanButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    marginTop: 'auto',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  scanButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.light.text,
  },
  addButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingVertical: Spacing.three,
    borderRadius: 12,
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
});
