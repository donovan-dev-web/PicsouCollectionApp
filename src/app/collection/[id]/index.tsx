import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { ErrorView } from '@/components/error-view';
import { LoadingView } from '@/components/loading-view';
import { Screen } from '@/components/screen';
import { StatusBadge } from '@/components/status-badge';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';

type StyleSheetType = ReturnType<typeof makeStyles>;

function formatDate(iso: string | null): string {
  if (!iso) {
    return 'Inconnue';
  }
  return new Date(iso).toLocaleDateString('fr-FR');
}

/** Slugifie un libellé FR pour un testID stable (sans accents, sans espaces). */
function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
}

export default function MagazineDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const detailLoading = useCollectionStore((s) => s.detailLoading);
  const loadDetail = useCollectionStore((s) => s.loadDetail);
  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);
  const removeMagazine = useCollectionStore((s) => s.removeMagazine);

  const confirmDelete = () => {
    Alert.alert(`Supprimer l'édition`, `Retirer « ${detail?.publication} » et ses exemplaires ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await removeMagazine(id);
          router.back();
        },
      },
    ]);
  };

  const handleAddCopy = async () => {
    if (!detail) {
      return;
    }
    await addExistingCopy(detail.id);
    toast('Exemplaire ajouté à la collection');
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadDetail(id);
      }
    }, [id, loadDetail]),
  );

  if (detailLoading && !detail) {
    return (
      <Screen>
        <LoadingView message="Chargement de la fiche…" />
      </Screen>
    );
  }

  if (!detail) {
    return (
      <Screen>
        <ErrorView
          testID="detail-not-found"
          message="Édition introuvable."
          retryLabel="Retour"
          onRetry={goBack}
          retryTestID="detail-back"
        />
      </Screen>
    );
  }

  const quantity = detail.copies.length;

  return (
    <Screen>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.publication}>{detail.publication}</Text>
        <Text style={styles.issue} testID="detail-issue">
          n° {detail.issueNumber ?? '—'}
        </Text>

        <View style={styles.statusRow}>
          <StatusBadge owned={quantity > 0} quantity={quantity} />
          {quantity > 0 && (
            <Text style={styles.count} testID="detail-count">
              {quantity} exemplaire{quantity > 1 ? 's' : ''}
            </Text>
          )}
        </View>

        <View style={styles.card} testID="detail-info">
          <InfoRow styles={styles} label="Édition" value={detail.edition?.trim() || '—'} />
          <InfoRow styles={styles} label="Langue" value={detail.language?.trim() || '—'} />
          <InfoRow styles={styles} label="État" value={detail.condition?.trim() || '—'} />
          <InfoRow styles={styles} label="Date" value={formatDate(detail.publicationDate)} />
          <InfoRow styles={styles} label="Code-barres" value={detail.barcode?.trim() || '—'} />
          <InfoRow styles={styles} label="Ajouté le" value={formatDate(detail.createdAt)} />
        </View>

        {detail.notes ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notes}>{detail.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Exemplaires</Text>
        {detail.copies.length === 0 ? (
          <Text style={styles.muted} testID="detail-copies-empty">
            Aucun exemplaire pour l&apos;instant.
          </Text>
        ) : (
          detail.copies.map((copy, index) => (
            <View style={styles.copyRow} key={copy.id} testID="detail-copy">
              <Text style={styles.copyIndex}>#{index + 1}</Text>
              <Text style={styles.copyDate}>{formatDate(copy.dateAdded)}</Text>
            </View>
          ))
        )}

        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.pressed]}
          onPress={handleAddCopy}
          testID="detail-add-copy"
          accessibilityRole="button"
          accessibilityLabel="Ajouter un exemplaire de cette édition"
          android_ripple={{ color: 'rgba(0,0,0,0.12)' }}>
          <Feather name="plus" size={20} color={colors.accentText} />
          <Text style={styles.addButtonText}>Ajouter un exemplaire</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
          onPress={() => router.push(`/collection/${detail.id}/edit`)}
          testID="detail-edit"
          accessibilityRole="button"
          accessibilityLabel="Modifier cette édition"
          android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
          <Feather name="edit-3" size={18} color={colors.text} />
          <Text style={styles.editButtonText}>Modifier</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
          onPress={confirmDelete}
          testID="detail-delete"
          accessibilityRole="button"
          accessibilityLabel="Supprimer cette édition"
          accessibilityHint="Supprime l'édition et tous ses exemplaires après confirmation"
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}>
          <Feather name="trash-2" size={18} color={colors.onDanger} />
          <Text style={styles.deleteButtonText}>Supprimer</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function InfoRow({
  styles,
  label,
  value,
}: {
  styles: StyleSheetType;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} testID={`detail-${slug(label)}`} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
    },
    content: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.four,
    },
    publication: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
    },
    issue: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    count: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: Spacing.three,
      gap: Spacing.two,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.three,
    },
    infoLabel: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
      fontWeight: '500',
      flexShrink: 1,
      flex: 1,
      textAlign: 'right',
    },
    sectionTitle: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.two,
    },
    notes: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.text,
    },
    copyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      padding: Spacing.three,
      minHeight: HitTarget.minHeight,
    },
    copyIndex: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '700',
      color: colors.accentTextOnLight,
    },
    copyDate: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.textSecondary,
    },
    muted: {
      fontSize: 15,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    addButton: {
      flexDirection: 'row',
      marginTop: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.accent,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.two,
      borderRadius: 12,
    },
    addButtonText: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.accentText,
    },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.backgroundElement,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.two,
      borderRadius: 12,
    },
    editButtonText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '600',
      color: colors.text,
    },
    deleteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.two,
      backgroundColor: colors.danger,
      minHeight: HitTarget.minHeight,
      paddingVertical: Spacing.two,
      borderRadius: 12,
    },
    deleteButtonText: {
      fontSize: 17,
      lineHeight: 24,
      fontWeight: '700',
      color: colors.onDanger,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
