import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';

type StyleSheetType = ReturnType<typeof makeStyles>;

function formatDate(iso: string | null): string {
  if (!iso) {
    return 'Inconnue';
  }
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function MagazineDetailScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const detailLoading = useCollectionStore((s) => s.detailLoading);
  const loadDetail = useCollectionStore((s) => s.loadDetail);
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

  useFocusEffect(
    useCallback(() => {
      if (id) {
        loadDetail(id);
      }
    }, [id, loadDetail]),
  );

  if (detailLoading && !detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Chargement…</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted} testID="detail-not-found">
          Édition introuvable.
        </Text>
      </View>
    );
  }

  const quantity = detail.copies.length;

  return (
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
        style={({ pressed }) => [styles.editButton, pressed && styles.pressed]}
        onPress={() => router.push(`/collection/${detail.id}/edit`)}
        testID="detail-edit"
        accessibilityRole="button">
        <Text style={styles.editButtonText}>Modifier</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}
        onPress={confirmDelete}
        testID="detail-delete"
        accessibilityRole="button">
        <Text style={styles.deleteButtonText}>Supprimer</Text>
      </Pressable>
    </ScrollView>
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
      <Text style={styles.infoValue} testID={`detail-${label.toLowerCase()}`}>
        {value}
      </Text>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: Spacing.four,
    },
    publication: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    issue: {
      fontSize: 16,
      color: colors.textSecondary,
      marginTop: -Spacing.two,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    count: {
      fontSize: 14,
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
    },
    infoLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    infoValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
      flexShrink: 1,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.two,
    },
    notes: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    copyRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.three,
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      padding: Spacing.three,
    },
    copyIndex: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.accent,
    },
    copyDate: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    muted: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    editButton: {
      marginTop: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    editButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    deleteButton: {
      marginTop: Spacing.two,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.danger,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    deleteButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.onDanger,
    },
    pressed: {
      opacity: 0.85,
    },
  });
}
