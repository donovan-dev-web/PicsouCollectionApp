import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { consumePendingBarcode } from '@/lib/pending-barcode';
import type { CreateMagazineInput, Magazine } from '@/types';

type FormValues = {
  publication: string;
  issueNumber: string;
  edition: string;
  country: string;
  publicationDate: string;
  barcode: string;
};

type Props = {
  initial?: Magazine;
  initialBarcode?: string;
  submitLabel: string;
  onSubmit: (input: CreateMagazineInput) => Promise<void> | void;
};

export function MagazineForm({ initial, initialBarcode, submitLabel, onSubmit }: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  const [values, setValues] = useState<FormValues>({
    publication: initial?.publication ?? '',
    issueNumber: initial?.issueNumber != null ? String(initial.issueNumber) : '',
    edition: initial?.edition ?? '',
    country: initial?.country ?? '',
    publicationDate: initial?.publicationDate ?? '',
    barcode: initial?.barcode ?? initialBarcode ?? '',
  });
  const [submitting, setSubmitting] = useState(false);
  const styles = makeStyles(colors);

  const set = (key: keyof FormValues) => (value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

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
      country: values.country.trim() || null,
      publicationDate: values.publicationDate.trim() || null,
      barcode: values.barcode.trim() || null,
    };
    try {
      await onSubmit(input);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.label}>Publication *</Text>
      <TextInput
        style={styles.input}
        value={values.publication}
        onChangeText={set('publication')}
        placeholder="Ex : Picsou Magazine"
        placeholderTextColor={colors.textSecondary}
        testID="field-publication"
        accessibilityLabel="Publication"
      />

      <Text style={styles.label}>Numéro</Text>
      <TextInput
        style={styles.input}
        value={values.issueNumber}
        onChangeText={set('issueNumber')}
        placeholder="Ex : 547"
        keyboardType="number-pad"
        placeholderTextColor={colors.textSecondary}
        testID="field-issue-number"
        accessibilityLabel="Numéro"
      />

      <Text style={styles.label}>Édition</Text>
      <TextInput
        style={styles.input}
        value={values.edition}
        onChangeText={set('edition')}
        placeholder="Ex : édition française"
        placeholderTextColor={colors.textSecondary}
        testID="field-edition"
        accessibilityLabel="Édition"
      />

      <Text style={styles.label}>Pays</Text>
      <TextInput
        style={styles.input}
        value={values.country}
        onChangeText={set('country')}
        placeholder="Ex : FR"
        placeholderTextColor={colors.textSecondary}
        testID="field-country"
        accessibilityLabel="Pays"
      />

      <Text style={styles.label}>Date de publication</Text>
      <TextInput
        style={styles.input}
        value={values.publicationDate}
        onChangeText={set('publicationDate')}
        placeholder="Ex : 2023-03"
        placeholderTextColor={colors.textSecondary}
        testID="field-publication-date"
        accessibilityLabel="Date de publication"
      />

      <Text style={styles.label}>Code-barres</Text>
      <View style={styles.barcodeRow}>
        <TextInput
          style={[styles.input, styles.barcodeInput]}
          value={values.barcode}
          onChangeText={set('barcode')}
          placeholder="Ex : 3271234000011"
          keyboardType="number-pad"
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

      <Pressable
        style={[styles.submit, !canSubmit && styles.submitDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
        testID="form-submit"
        accessibilityRole="button">
        <Text style={styles.submitText}>{submitting ? 'Enregistrement…' : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    form: {
      gap: Spacing.two,
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
