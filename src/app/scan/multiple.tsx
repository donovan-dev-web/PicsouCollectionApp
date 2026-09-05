import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { ErrorView } from '@/components/error-view';
import { LoadingView } from '@/components/loading-view';
import { Screen } from '@/components/screen';
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
    <Screen>
      <View style={styles.container}>
        <Text style={styles.title}>Plusieurs éditions pour ce code</Text>

        {loading ? (
          <LoadingView testID="multiple-loading" message="Recherche des éditions…" />
        ) : error ? (
          <ErrorView
            testID="multiple-error"
            message="Impossible de charger les éditions."
            onRetry={load}
            retryTestID="multiple-retry"
          />
        ) : magazines && count === 0 ? (
          <EmptyState
            testID="multiple-empty"
            icon="search"
            title="Aucune édition pour ce code"
            message="Ce code-barres ne correspond à aucune édition connue."
            actionLabel="Saisir manuellement"
            onAction={() => router.replace({ pathname: '/scan/manual', params: { barcode } })}
            actionTestID="multiple-manual"
          />
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
                    accessibilityLabel={
                      item.issueNumber != null
                        ? `${item.publication} numéro ${item.issueNumber}`
                        : item.publication
                    }
                    accessibilityHint="Voir la fiche de l'édition"
                    android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.publication} numberOfLines={1} ellipsizeMode="tail">
                        {item.publication}
                      </Text>
                      {item.issueNumber != null ? (
                        <Text style={styles.issue}>n° {item.issueNumber}</Text>
                      ) : null}
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
    </Screen>
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
      color: colors.accentTextOnLight,
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
