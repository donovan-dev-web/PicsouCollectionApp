import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';

export default function HomeScreen() {
  const router = useRouter();
  const totalCopies = useCollectionStore((s) => s.totalCopies);
  const loading = useCollectionStore((s) => s.loading);
  const loaded = useCollectionStore((s) => s.loaded);

  return (
    <View style={styles.container}>
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

      <Pressable
        style={({ pressed }) => [styles.scanButton, pressed && styles.scanButtonPressed]}
        onPress={() => router.push('/scan')}
        testID="scan-button"
        accessibilityRole="button"
        accessibilityLabel="Scanner un magazine">
        <Text style={styles.scanButtonText}>📷 Scanner</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.addButton, pressed && styles.scanButtonPressed]}
        onPress={() => router.push('/scan/manual')}
        testID="add-button"
        accessibilityRole="button"
        accessibilityLabel="Ajouter une édition">
        <Text style={styles.addButtonText}>+ Ajouter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
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
  scanButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
    paddingVertical: Spacing.three,
    borderRadius: 12,
    marginTop: 'auto',
  },
  scanButtonPressed: {
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
