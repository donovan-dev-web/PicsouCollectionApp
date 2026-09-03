import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AutocompleteInput } from '@/components/autocomplete-input';
import { SelectField } from '@/components/select-field';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { consumePendingBarcode } from '@/lib/pending-barcode';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput, Magazine } from '@/types';

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const;

const YEARS = Array.from({ length: 40 }, (_, i) => String(2025 - i));

type FormValues = {
  publication: string;
  issueNumber: string;
  edition: string;
  language: string;
  condition: string;
  month: string | null;
  year: string | null;
  barcode: string;
  notes: string;
};

type Props = {
  initial?: Magazine;
  initialBarcode?: string;
  initialPublication?: string;
  initialIssueNumber?: number | null;
  initialYear?: string | null;
  submitLabel: string;
  onSubmit: (input: CreateMagazineInput) => Promise<void> | void;
};

function publicationDateFrom(month: string | null, year: string | null): string | null {
  if (!month || !year) {
    return null;
  }
  return `${year}-${month}`;
}

export function MagazineForm({
  initial,
  initialBarcode,
  initialPublication,
  initialIssueNumber,
  initialYear,
  submitLabel,
  onSubmit,
}: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  const magazines = useCollectionStore((s) => s.magazines);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [values, setValues] = useState<FormValues>(() => {
    const date = initial?.publicationDate ?? '';
    const [year, month] = date.length === 7 ? date.split('-') : ['', ''];
    const prefilledYear = initialYear ?? (year || null);
    return {
      publication: initialPublication ?? initial?.publication ?? '',
      issueNumber:
        initialIssueNumber != null
          ? String(initialIssueNumber)
          : initial?.issueNumber != null
            ? String(initial.issueNumber)
            : '',
      edition: initial?.edition ?? '',
      language: initial?.language ?? '',
      condition: initial?.condition ?? '',
      month: month || null,
      year: prefilledYear || null,
      barcode: initial?.barcode ?? initialBarcode ?? '',
      notes: initial?.notes ?? '',
    };
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const styles = makeStyles(colors);

  const set = (key: keyof FormValues, value: string | null) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (formError) {
      setFormError(null);
    }
  };

  const publications = [...new Set(magazines.map((m) => m.publication))];
  const editions = [...new Set(magazines.map((m) => m.edition).filter((e): e is string => !!e))];
  const languages = [...new Set(magazines.map((m) => m.language).filter((l): l is string => !!l))];

  const openBarcodeScanner = () => {
    router.push('/scan/form-barcode');
  };

  useFocusEffect(
    useCallback(() => {
      const pending = consumePendingBarcode();
      if (pending) {
        setValues((prev) => ({ ...prev, barcode: pending }));
      }
    }, []),
  );

  const canSubmit = values.publication.trim().length > 0 && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setSubmitting(true);
    const input: CreateMagazineInput = {
      publication: values.publication.trim(),
      issueNumber: values.issueNumber.trim() ? Number(values.issueNumber) : null,
      edition: values.edition.trim() || null,
      language: values.language.trim() || null,
      condition: values.condition.trim() || null,
      publicationDate: publicationDateFrom(values.month, values.year),
      barcode: values.barcode.trim() || null,
      notes: values.notes.trim() || null,
    };
    try {
      await onSubmit(input);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Erreur lors de l’enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={styles.form}
      keyboardShouldPersistTaps="handled">
      {/* Section essentielle (toujours visible) */}
      <AutocompleteInput
        label="Publication *"
        value={values.publication}
        options={publications}
        onChangeText={(v) => set('publication', v)}
        placeholder="Ex : Picsou Magazine"
        testID="field-publication"
        accessibilityLabel="Publication"
      />

      <Text style={styles.label}>Numéro</Text>
      <TextInput
        style={styles.input}
        value={values.issueNumber}
        onChangeText={(v) => set('issueNumber', v)}
        placeholder="Ex : 547"
        keyboardType="number-pad"
        placeholderTextColor={colors.textSecondary}
        testID="field-issue-number"
        accessibilityLabel="Numéro"
      />

      <AutocompleteInput
        label="Édition"
        value={values.edition}
        options={editions}
        onChangeText={(v) => set('edition', v)}
        placeholder="Ex : édition française"
        testID="field-edition"
        accessibilityLabel="Édition"
      />

      {/* Bouton « Plus de détails » */}
      <Pressable
        style={({ pressed }) => [styles.detailsToggle, pressed && styles.buttonPressed]}
        onPress={() => setDetailsOpen((o) => !o)}
        testID="details-toggle"
        accessibilityRole="button">
        <Text style={styles.detailsToggleText}>
          {detailsOpen ? '▲ Masquer les détails' : '▼ Plus de détails'}
        </Text>
      </Pressable>

      {detailsOpen && (
        <View style={styles.details}>
          <AutocompleteInput
            label="Langue"
            value={values.language}
            options={languages}
            onChangeText={(v) => set('language', v)}
            placeholder="Ex : FR"
            testID="field-language"
            accessibilityLabel="Langue"
          />

          <Text style={styles.label}>État</Text>
          <TextInput
            style={styles.input}
            value={values.condition}
            onChangeText={(v) => set('condition', v)}
            placeholder="Ex : Neuf, usé, abîmé…"
            placeholderTextColor={colors.textSecondary}
            testID="field-condition"
            accessibilityLabel="État"
          />

          <Text style={styles.label}>Date de publication</Text>
          <View style={styles.dateRow}>
            <View style={styles.dateCol}>
              <SelectField
                label="Mois"
                placeholder="—"
                value={values.month}
                options={MONTHS}
                onSelect={(v) => set('month', v)}
                testID="select-month"
              />
            </View>
            <View style={styles.dateCol}>
              <SelectField
                label="Année"
                placeholder="—"
                value={values.year}
                options={YEARS}
                onSelect={(v) => set('year', v)}
                testID="select-year"
              />
            </View>
          </View>

          <Text style={styles.label}>Code-barres</Text>
          <View style={styles.barcodeRow}>
            <TextInput
              style={[styles.input, styles.barcodeInput]}
              value={values.barcode}
              onChangeText={(v) => set('barcode', v)}
              placeholder="Ex : 3271234000011"
              keyboardType="default"
              autoCapitalize="characters"
              placeholderTextColor={colors.textSecondary}
              testID="field-barcode"
              accessibilityLabel="Code-barres"
            />
            <Pressable
              style={({ pressed }) => [styles.scanButton, pressed && styles.buttonPressed]}
              onPress={openBarcodeScanner}
              testID="barcode-scan"
              accessibilityRole="button"
              accessibilityLabel="Scanner le code-barres">
              <Text style={styles.scanButtonText}>▣ Scanner</Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={values.notes}
            onChangeText={(v) => set('notes', v)}
            placeholder="Informations complémentaires…"
            multiline
            placeholderTextColor={colors.textSecondary}
            testID="field-notes"
            accessibilityLabel="Notes"
          />
        </View>
      )}

      {formError ? (
        <Text style={styles.formError} testID="form-error">
          {formError}
        </Text>
      ) : null}

      <Pressable
        style={[styles.submit, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="form-submit"
        accessibilityRole="button">
        <Text style={styles.submitText}>{submitting ? 'Enregistrement…' : submitLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    formScroll: {
      flex: 1,
    },
    form: {
      gap: Spacing.two,
      paddingBottom: Spacing.four,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginTop: Spacing.two,
    },
    input: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      fontSize: 16,
      color: colors.text,
    },
    notesInput: {
      minHeight: 72,
      textAlignVertical: 'top',
    },
    formError: {
      marginTop: Spacing.two,
      fontSize: 14,
      fontWeight: '600',
      color: colors.danger,
      textAlign: 'center',
    },
    detailsToggle: {
      marginTop: Spacing.three,
      alignSelf: 'flex-start',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      backgroundColor: colors.backgroundElement,
    },
    detailsToggleText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accent,
    },
    details: {
      gap: Spacing.two,
    },
    dateRow: {
      flexDirection: 'row',
      gap: Spacing.three,
    },
    dateCol: {
      flex: 1,
    },
    barcodeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    barcodeInput: {
      flex: 1,
    },
    scanButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.accent,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    scanButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    buttonPressed: {
      opacity: 0.8,
    },
    submit: {
      marginTop: Spacing.three,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    submitDisabled: {
      opacity: 0.5,
    },
    submitText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
  });
}
