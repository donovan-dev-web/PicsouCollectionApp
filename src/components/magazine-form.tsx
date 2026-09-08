import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, type Ref } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AutocompleteInput } from '@/components/autocomplete-input';
import { SelectField } from '@/components/select-field';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';
import type { CreateMagazineInput, Magazine } from '@/types';
import { makeMagazineFormStyles } from './magazine-form-styles';
import { useMagazineForm, type FormValues, type MagazineFormHandle } from './use-magazine-form';

export {
  publicationDateFrom,
  buildMagazineInput,
  initialFormValues,
  MagazineFormHandle,
} from './use-magazine-form';

const MONTHS_OPTIONS = [
  '01',
  '02',
  '03',
  '04',
  '05',
  '06',
  '07',
  '08',
  '09',
  '10',
  '11',
  '12',
] as const;

/** Années dynamiques : année courante → -39 ans (M10-08, fini `2025` en dur). */
const YEARS = Array.from({ length: 40 }, (_, i) => String(new Date().getFullYear() - i));

type Props = {
  initial?: Magazine;
  initialBarcode?: string;
  initialPublication?: string;
  initialIssueNumber?: number | null;
  initialYear?: string | null;
  submitLabel: string;
  onSubmit: (input: CreateMagazineInput) => Promise<void> | void;
  ref?: Ref<MagazineFormHandle>;
};

export function MagazineForm({
  initial,
  initialBarcode,
  initialPublication,
  initialIssueNumber,
  initialYear,
  submitLabel,
  onSubmit,
  ref,
}: Props) {
  const colors = useThemeColors();
  const router = useRouter();
  const magazines = useCollectionStore((s) => s.magazines);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { values, set, submitting, formError, canSubmit, handleSubmit, consumeBarcode } =
    useMagazineForm({
      initial,
      initialBarcode,
      initialPublication,
      initialIssueNumber,
      initialYear,
      onSubmit,
      ref,
    });

  const styles = makeMagazineFormStyles(colors);

  const publications = [...new Set(magazines.map((m) => m.publication))];
  const editions = [...new Set(magazines.map((m) => m.edition).filter((e): e is string => !!e))];
  const languages = [...new Set(magazines.map((m) => m.language).filter((l): l is string => !!l))];

  const openBarcodeScanner = () => {
    router.push('/scan/form-barcode');
  };

  useFocusEffect(
    useCallback(() => {
      consumeBarcode();
    }, [consumeBarcode]),
  );

  return (
    <KeyboardAvoidingView
      style={styles.formKeyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
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
          accessibilityRole="button"
          accessibilityLabel={detailsOpen ? 'Masquer les détails' : 'Afficher plus de détails'}
          accessibilityState={{ expanded: detailsOpen }}>
          <Feather
            name={detailsOpen ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={colors.accentTextOnLight}
          />
          <Text style={styles.detailsToggleText}>
            {detailsOpen ? 'Masquer les détails' : 'Plus de détails'}
          </Text>
        </Pressable>

        {detailsOpen ? (
          <DetailsSection
            values={values}
            set={set}
            editions={editions}
            languages={languages}
            onScanBarcode={openBarcodeScanner}
          />
        ) : null}

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
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}>
          <Text style={styles.submitText}>{submitting ? 'Enregistrement…' : submitLabel}</Text>
        </Pressable>
        {!canSubmit && !submitting ? (
          <Text style={styles.submitHint} testID="form-submit-hint">
            Renseignez la publication pour enregistrer.
          </Text>
        ) : null}
        <View style={styles.keyboardSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailsSection({
  values,
  set,
  editions,
  languages,
  onScanBarcode,
}: {
  values: FormValues;
  set: (key: keyof FormValues, value: string | null) => void;
  editions: string[];
  languages: string[];
  onScanBarcode: () => void;
}) {
  const colors = useThemeColors();
  const styles = makeMagazineFormStyles(colors);

  return (
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
            options={MONTHS_OPTIONS}
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
          onPress={onScanBarcode}
          testID="barcode-scan"
          accessibilityRole="button"
          accessibilityLabel="Scanner le code-barres">
          <Feather name="crop" size={18} color={colors.text} />
          <Text style={styles.scanButtonText}>Scanner</Text>
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
  );
}
