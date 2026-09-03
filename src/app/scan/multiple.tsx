import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';
import type { MagazineListItem } from '@/types';

export default function MultipleBarcodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const params = useLocalSearchParams<{ barcode?: string }>();
  const barcode = params.barcode ?? '';

  const [magazines, setMagazines] = useState<MagazineListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const inflightRef = useRef(false);

  const load = useCallback(async () => {
    if (!barcode) {
      setLoading(false);
      return;
    }
    if (inflightRef.current) {
      return;
    }
    inflightRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const { magazineRepository } = getDeps();
      const items = await magazineRepository.findManyByBarcode(barcode);
      setMagazines(items);
    } catch {
      setError(true);
    } finally {
      inflightRef.current = false;
      setLoading(false);
    }
  }, [barcode]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const count = magazines?.length ?? 0;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Plusieurs éditions pour ce code</Text>

      {loading ? (
        <Text style={styles.message} testID="multiple-loading">
          Recherche…
        </Text>
      ) : error ? (
        <Text style={styles.error} testID="multiple-error">
          Impossible de charger les éditions.
        </Text>
      ) : magazines && count === 0 ? (
        <Text style={styles.message} testID="multiple-empty">
          Aucune édition correspond à ce code-barres.
        </Text>
      ) : (
        magazines && (
          <>
            <Text style={styles.count} testID="multiple-count">
              {count} édition{count > 1 ? 's' : ''} trouvée{count > 1 ? 's' : ''}
            </Text>
            {barcode ? <Text style={styles.muted}>Code-barres : {barcode}</Text> : null}
            <FlatList
              data={magazines}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => (
                <Pressable
                  style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                  onPress={() => router.push(`/collection/${item.id}`)}
                  testID="multiple-item"
                  accessibilityRole="button"
                  accessibilityLabel={`${item.publication} numéro ${item.issueNumber}`}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.publication}>{item.publication}</Text>
                    <Text style={styles.issue}>n° {item.issueNumber}</Text>
                  </View>
                  <StatusBadge owned={item.quantity > 0} quantity={item.quantity} />
                </Pressable>
              )}
            />
          </>
        )
      )}

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={() => router.replace('/scan/barcode')}
        testID="multiple-rescan"
        accessibilityRole="button"
        accessibilityLabel="Scanner à nouveau">
        <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    count: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    muted: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: Spacing.four,
    },
    error: {
      fontSize: 15,
      color: colors.danger,
      textAlign: 'center',
      marginTop: Spacing.four,
    },
    list: {
      gap: Spacing.two,
    },
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    cardPressed: {
      opacity: 0.85,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline',
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
      color: colors.accent,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
