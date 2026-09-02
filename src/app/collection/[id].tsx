import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StatusBadge } from '@/components/status-badge';
import { Colors, Spacing } from '@/constants/theme';
import { useCollectionStore } from '@/store/use-collection-store';

function formatDate(iso: string | null): string {
  if (!iso) {
    return 'Inconnue';
  }
  return new Date(iso).toLocaleDateString('fr-FR');
}

export default function MagazineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const detail = useCollectionStore((s) => s.detail);
  const detailLoading = useCollectionStore((s) => s.detailLoading);
  const loadDetail = useCollectionStore((s) => s.loadDetail);

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
        <InfoRow label="Édition" value={detail.edition?.trim() || '—'} />
        <InfoRow label="Pays" value={detail.country?.trim() || '—'} />
        <InfoRow label="Date" value={formatDate(detail.publicationDate)} />
        <InfoRow label="Code-barres" value={detail.barcode?.trim() || '—'} />
        <InfoRow label="Ajouté le" value={formatDate(detail.createdAt)} />
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
            <Text style={styles.copyMeta}>{copy.condition?.trim() || 'État non précisé'}</Text>
            <Text style={styles.copyDate}>{formatDate(copy.dateAdded)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} testID={`detail-${label.toLowerCase()}`}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.background,
    padding: Spacing.four,
  },
  publication: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  issue: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: -Spacing.two,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  count: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  card: {
    backgroundColor: Colors.light.backgroundElement,
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
    color: Colors.light.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
    flexShrink: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: Spacing.two,
  },
  notes: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.three,
  },
  copyIndex: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.accent,
  },
  copyMeta: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.text,
  },
  copyDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  muted: {
    fontSize: 15,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});
