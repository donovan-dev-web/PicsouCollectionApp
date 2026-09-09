import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { getDeps } from '@/dependencies';
import { extractFieldValue, type OcrField } from '@/identification/ocr/ocrCandidateAnalyzer';
import type { OcrProposals } from '@/identification/ocr/ocrProposals';
import { buildManualParams } from '@/components/scan/ocr-analysis';
import { mapBoxToViewRect } from '@/components/scan/ocr-coords';
import { consumePendingOcrReview, type OcrReviewPayload } from '@/lib/ocr-pending';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type FieldValue = {
  value: string;
  source: 'auto' | 'zone' | 'manual';
  confidence: number | null;
};

type FieldsState = Record<OcrField, FieldValue>;

const FIELDS: { field: OcrField; label: string; placeholder: string }[] = [
  { field: 'title', label: 'Titre', placeholder: 'Nom du magazine' },
  { field: 'issueNumber', label: 'Numéro', placeholder: 'N° du magazine' },
  { field: 'year', label: 'Année', placeholder: 'Optionnel' },
];

function fieldFromProposal(proposal: OcrProposals['title']): FieldValue {
  if (proposal.kind === 'auto') {
    return { value: proposal.value, source: 'auto', confidence: proposal.confidence };
  }
  return { value: '', source: 'manual', confidence: null };
}

function initialFields(payload: OcrReviewPayload): FieldsState {
  return {
    title: fieldFromProposal(payload.proposals.title),
    issueNumber: fieldFromProposal(payload.proposals.issueNumber),
    year: fieldFromProposal(payload.proposals.year),
  };
}

export default function OcrReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = makeStyles(colors, insets);

  const params = useLocalSearchParams<{ back?: string }>();
  const [payload] = useState<OcrReviewPayload | null>(() => consumePendingOcrReview());
  const [fields, setFields] = useState<FieldsState>(() =>
    payload
      ? initialFields(payload)
      : {
          title: { value: '', source: 'manual', confidence: null },
          issueNumber: { value: '', source: 'manual', confidence: null },
          year: { value: '', source: 'manual', confidence: null },
        },
  );
  const [activeField, setActiveField] = useState<OcrField | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [viewSize, setViewSize] = useState<{ width: number; height: number } | null>(null);
  const [searching, setSearching] = useState(false);

  const setField = (field: OcrField, value: string, source: FieldValue['source']) => {
    setFields((prev) => ({ ...prev, [field]: { value, source, confidence: null } }));
  };

  const assignZone = (field: OcrField, zoneText: string, zoneId: string) => {
    const value = extractFieldValue(field, zoneText);
    if (value !== null) {
      setField(field, value, 'zone');
    }
    setActiveField(null);
    setSelectedZoneId(null);
  };

  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(params.back ?? '/scan/camera');
    }
  };

  if (!payload) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={goBack}
            testID="ocr-review-back"
            accessibilityRole="button"
            accessibilityLabel="Retour"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Affiner la lecture</Text>
        </View>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune analyse de couverture en attente.</Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={goBack}
            testID="ocr-review-empty-back"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Retour</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const issueReady = fields.issueNumber.value.trim() !== '';
  const titleReady = fields.title.value.trim() !== '';
  const canSearch = titleReady && issueReady && !searching;

  const search = async () => {
    const publication = fields.title.value.trim();
    const issue = Number(fields.issueNumber.value.replace(/[^0-9]/g, ''));
    const year = fields.year.value.trim() || null;
    if (!publication || !Number.isFinite(issue)) {
      goManual({ publication, issueNumber: fields.issueNumber.value ? issue : null, date: year });
      return;
    }
    setSearching(true);
    try {
      const { identificationService } = getDeps();
      const result = await identificationService.searchByOcrFields(publication, issue, year);
      if (result.status === 'found') {
        router.replace({
          pathname: '/scan/result',
          params: {
            id: result.magazine.id,
            publication: result.publication,
            issueNumber: String(result.issueNumber ?? ''),
            barcode: result.magazine.barcode ?? undefined,
          },
        });
        return;
      }
      if (result.status === 'unknown') {
        router.replace({
          pathname: '/scan/result',
          params: {
            publication: result.publication,
            issueNumber: String(result.issueNumber ?? ''),
          },
        });
        return;
      }
      goManual({ publication, issueNumber: issue, date: year });
    } finally {
      setSearching(false);
    }
  };

  const goManual = (detected: {
    publication?: string;
    issueNumber?: number | null;
    date?: string | null;
  }) => {
    router.replace({ pathname: '/scan/manual', params: buildManualParams(detected) });
  };

  const zoneBoxes =
    viewSize !== null && viewSize.width > 0
      ? payload.zones
          .map((zone) => ({
            zone,
            box: mapBoxToViewRect(
              zone.boundingBox,
              payload.width,
              payload.height,
              viewSize.width,
              viewSize.height,
            ),
          }))
          .filter((z) => z.box !== null)
      : [];

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
          onPress={goBack}
          testID="ocr-review-back"
          accessibilityRole="button"
          accessibilityLabel="Retour"
          hitSlop={HitTarget.hitSlop}>
          <Feather name="arrow-left" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>Affiner la lecture</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.help}>
          Touchez un texte sur la photo dans le champ à compléter, ou utilisez la barre de zones.
        </Text>

        <View
          style={[styles.photoFrame, { aspectRatio: payload.width / Math.max(payload.height, 1) }]}
          onLayout={(e) => {
            const { width, height } = e.nativeEvent.layout;
            setViewSize({ width, height });
          }}
          testID="ocr-review-photo">
          <Image
            source={{ uri: payload.uri }}
            style={styles.photo}
            resizeMode="contain"
            testID="ocr-review-image"
          />
          {zoneBoxes.map(({ zone, box }) => {
            if (box === null) {
              return null;
            }
            const isSelected = selectedZoneId === zone.id;
            return (
              <Pressable
                key={zone.id}
                style={[styles.zone, box, isSelected && styles.zoneSelected]}
                onPress={() => {
                  if (activeField) {
                    assignZone(activeField, zone.text, zone.id);
                  } else {
                    setSelectedZoneId(zone.id === selectedZoneId ? null : zone.id);
                  }
                }}
                testID={`ocr-zone-${zone.id}`}
                accessibilityRole="button"
                accessibilityLabel={`Zone : ${zone.text}`}
              />
            );
          })}
        </View>

        {selectedZoneId && !activeField && (
          <View style={styles.zoneToolbar} testID="ocr-zone-toolbar">
            <Text style={styles.zoneToolbarText}>Utiliser cette zone comme :</Text>
            {FIELDS.map(({ field, label }) => (
              <Pressable
                key={field}
                style={({ pressed }) => [styles.zoneToolbarButton, pressed && styles.pressed]}
                onPress={() => {
                  const zone = payload.zones.find((z) => z.id === selectedZoneId);
                  if (zone) {
                    assignZone(field, zone.text, zone.id);
                  }
                }}
                testID={`ocr-zone-as-${field}`}
                accessibilityRole="button">
                <Text style={styles.zoneToolbarButtonText}>{label}</Text>
              </Pressable>
            ))}
          </View>
        )}

        <View style={styles.fields} testID="ocr-review-fields">
          {FIELDS.map(({ field, label, placeholder }) => {
            const f = fields[field];
            return (
              <View key={field} style={styles.fieldWrap}>
                <View style={styles.fieldHeader}>
                  <Text style={styles.fieldLabel}>{label}</Text>
                  {f.source === 'auto' && (
                    <Text style={styles.autoBadge}>
                      ✓ {Math.round((f.confidence ?? 0) * 100)} %
                    </Text>
                  )}
                  {f.source === 'zone' && <Text style={styles.zoneBadge}>✓ photo</Text>}
                </View>
                <View style={styles.fieldRow}>
                  <TextInput
                    style={styles.input}
                    value={f.value}
                    onChangeText={(t) => setField(field, t, 'manual')}
                    placeholder={placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={field === 'issueNumber' ? 'number-pad' : 'default'}
                    returnKeyType="done"
                    testID={`ocr-review-input-${field}`}
                    accessibilityLabel={`${label} (champ de saisie)`}
                  />
                  <Pressable
                    style={({ pressed }) => [
                      styles.zonePickButton,
                      activeField === field && styles.zonePickButtonActive,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => setActiveField(activeField === field ? null : field)}
                    testID={`ocr-review-pick-${field}`}
                    accessibilityRole="button"
                    accessibilityLabel={`Choisir une zone pour ${label}`}>
                    <Feather
                      name={activeField === field ? 'crosshair' : 'map-pin'}
                      size={18}
                      color={activeField === field ? colors.accent : colors.textSecondary}
                    />
                  </Pressable>
                </View>
                {activeField === field && (
                  <Text style={styles.armingHint}>Touchez la bonne zone sur la photo.</Text>
                )}
              </View>
            );
          })}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            !canSearch && styles.primaryButtonDisabled,
            pressed && styles.pressed,
          ]}
          onPress={search}
          disabled={!canSearch}
          testID="ocr-review-search"
          accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Rechercher</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={() =>
            goManual({
              publication: fields.title.value.trim() || undefined,
              issueNumber: fields.issueNumber.value
                ? Number(fields.issueNumber.value.replace(/[^0-9]/g, ''))
                : null,
              date: fields.year.value.trim() || null,
            })
          }
          testID="ocr-review-manual"
          accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(colors: ThemeColors, insets: { top: number; bottom: number }) {
  return {
    screen: { flex: 1, paddingTop: insets.top, backgroundColor: colors.background },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: Spacing.two,
      paddingHorizontal: Spacing.four,
      paddingVertical: Spacing.three,
    },
    backButton: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    pressed: { opacity: 0.7 },
    title: {
      flex: 1,
      fontSize: 22,
      lineHeight: 30,
      fontWeight: '700' as const,
      color: colors.text,
    },
    scrollContent: { padding: Spacing.four, paddingBottom: insets.bottom + Spacing.five },
    help: {
      fontSize: 14,
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: Spacing.three,
    },
    photoFrame: {
      width: '100%' as const,
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      overflow: 'hidden' as const,
      position: 'relative' as const,
    },
    photo: { width: '100%' as const, height: '100%' as const },
    zone: {
      position: 'absolute' as const,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: 'rgba(0, 122, 255, 0.15)',
      borderRadius: 4,
    },
    zoneSelected: {
      borderColor: '#ffd21f',
      backgroundColor: 'rgba(255, 210, 31, 0.25)',
    },
    zoneToolbar: {
      marginTop: Spacing.three,
      flexDirection: 'column' as const,
      gap: Spacing.two,
    },
    zoneToolbarText: { fontSize: 13, color: colors.textSecondary },
    zoneToolbarButton: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
    },
    zoneToolbarButtonText: { color: colors.text, fontWeight: '600' as const },
    fields: { gap: Spacing.three, marginTop: Spacing.four },
    fieldWrap: { gap: Spacing.two },
    fieldHeader: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.two },
    fieldLabel: { fontSize: 13, fontWeight: '600' as const, color: colors.textSecondary },
    autoBadge: { fontSize: 12, color: colors.accent, fontWeight: '700' as const },
    zoneBadge: { fontSize: 12, color: '#e0a800', fontWeight: '700' as const },
    fieldRow: { flexDirection: 'row' as const, alignItems: 'center' as const, gap: Spacing.two },
    input: {
      flex: 1,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      backgroundColor: colors.backgroundElement,
      color: colors.text,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      fontSize: 16,
    },
    zonePickButton: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    zonePickButtonActive: {
      backgroundColor: colors.navActive,
    },
    armingHint: { fontSize: 12, color: colors.accent },
    primaryButton: {
      marginTop: Spacing.four,
      backgroundColor: colors.accent,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    primaryButtonDisabled: { opacity: 0.4 },
    primaryButtonText: { color: colors.accentText, fontSize: 16, fontWeight: '700' as const },
    secondaryButton: {
      marginTop: Spacing.three,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      paddingVertical: Spacing.three,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondaryButtonText: { color: colors.text, fontSize: 16, fontWeight: '600' as const },
    empty: {
      flex: 1,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      padding: Spacing.four,
      gap: Spacing.three,
    },
    emptyText: { color: colors.textSecondary, textAlign: 'center' as const },
  };
}
