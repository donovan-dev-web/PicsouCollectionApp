import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { AppHeader } from '@/components/app-header';
import { Screen } from '@/components/screen';
import { useCollectionStore } from '@/store/use-collection-store';
import { formatDateLong } from '@/lib/date';

/**
 * Accueil cockpit brocante (M10-04) : un seul CTA primaire Scanner,
 * compteur annoncé (live-region), récents 48px + chevron, dates localisées,
 * empty + CTA, erreur store affichée.
 */
export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const totalMagazines = useCollectionStore((s) => s.totalMagazines);
  const recent = useCollectionStore((s) => s.recent);
  const loading = useCollectionStore((s) => s.loading);
  const loaded = useCollectionStore((s) => s.loaded);
  const error = useCollectionStore((s) => s.error);
  const loadSummary = useCollectionStore((s) => s.loadSummary);

  useFocusEffect(
    useCallback(() => {
      loadSummary();
    }, [loadSummary]),
  );

  return (
    <Screen noBottom>
      <AppHeader title="Picsou Collection" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.subtitle}>
          Collectionnez vos magazines Disney, sans doublons, sans internet.
        </Text>

        <View
          style={styles.counterCard}
          testID="collection-counter"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`${totalMagazines} éditions possédées`}>
          {loading && !loaded ? (
            <ActivityIndicator testID="counter-loading" color={colors.navActive} />
          ) : error ? (
            <Text style={styles.errorText} testID="counter-error">
              {error}
            </Text>
          ) : (
            <>
              <Text style={styles.counterValue}>{totalMagazines}</Text>
              <Text style={styles.counterLabel}>éditions possédées</Text>
            </>
          )}
        </View>

        <View style={styles.ctaRow}>
          <Pressable
            style={({ pressed }) => [styles.scanButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan')}
            testID="scan-button"
            accessibilityRole="button"
            accessibilityLabel="Scanner un magazine"
            android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
            <Feather name="camera" size={22} color={colors.accentText} />
            <Text style={styles.scanButtonText}>Scanner</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.addButton, pressed && styles.buttonPressed]}
            onPress={() => router.push('/scan/manual')}
            testID="add-button"
            accessibilityRole="button"
            accessibilityLabel="Ajouter une édition"
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
            <Feather name="plus" size={20} color={colors.text} />
            <Text style={styles.addButtonText}>Ajouter</Text>
          </Pressable>
        </View>

        <View style={styles.recentSection}>
          <Text style={styles.recentTitle}>Ajouts récents</Text>
          {recent.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText} testID="recent-empty">
                Aucun ajout pour le moment.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyCta, pressed && styles.buttonPressed]}
                onPress={() => router.push('/scan')}
                testID="recent-empty-cta"
                accessibilityRole="button"
                accessibilityLabel="Scanner votre premier magazine"
                android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
                <Feather name="camera" size={18} color={colors.accentText} />
                <Text style={styles.emptyCtaText}>Scanner un magazine</Text>
              </Pressable>
            </View>
          ) : (
            recent.map((magazine) => (
              <Pressable
                key={magazine.id}
                style={({ pressed }) => [styles.recentItem, pressed && styles.buttonPressed]}
                onPress={() => router.push(`/collection/${magazine.id}`)}
                testID="recent-item"
                accessibilityRole="button"
                accessibilityLabel={`Voir ${magazine.publication}${magazine.issueNumber != null ? ` numéro ${magazine.issueNumber}` : ''}`}
                android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
                <View style={styles.recentItemText}>
                  <Text style={styles.recentItemTitle} numberOfLines={1}>
                    {magazine.publication}
                    {magazine.issueNumber != null ? ` n°${magazine.issueNumber}` : ''}
                  </Text>
                  <Text style={styles.recentItemDate}>{formatDateLong(magazine.createdAt)}</Text>
                </View>
                <Feather name="chevron-right" size={20} color={colors.textSecondary} />
              </Pressable>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      alignItems: 'stretch',
      padding: Spacing.four,
      gap: Spacing.three,
      flexGrow: 1,
    },
    subtitle: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    counterCard: {
      alignItems: 'center',
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      paddingVertical: Spacing.four,
      paddingHorizontal: Spacing.four,
      minWidth: 160,
    },
    counterValue: {
      fontSize: 48,
      lineHeight: 56,
      fontWeight: '800',
      color: colors.accentTextOnLight,
    },
    counterLabel: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginTop: Spacing.two,
    },
    errorText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.danger,
      textAlign: 'center',
    },
    recentSection: {
      gap: Spacing.two,
      marginTop: Spacing.two,
    },
    recentTitle: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.text,
    },
    emptyWrap: {
      gap: Spacing.two,
    },
    emptyText: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    emptyCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: HitTarget.minHeight,
      borderRadius: 10,
      paddingHorizontal: Spacing.three,
      alignSelf: 'flex-start',
    },
    emptyCtaText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
    },
    recentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    recentItemText: {
      flex: 1,
      gap: 2,
    },
    recentItemTitle: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600',
      color: colors.text,
    },
    recentItemDate: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    ctaRow: {
      gap: Spacing.two,
    },
    scanButton: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: 56,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    scanButtonText: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '700',
      color: colors.accentText,
    },
    addButton: {
      flexDirection: 'row',
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: colors.textSecondary,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.two,
      borderRadius: 12,
    },
    addButtonText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600',
      color: colors.text,
    },
  });
}
