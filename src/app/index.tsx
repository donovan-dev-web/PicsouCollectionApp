import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';

export default function HomeScreen() {
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
});
