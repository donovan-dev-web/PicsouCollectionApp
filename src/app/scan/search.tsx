import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AutocompleteInput } from '@/components/autocomplete-input';
import { Screen } from '@/components/screen';
import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';
import type { OcrLookupResult } from '@/identification/identificationService';

const EMPTY_ISSUE = '';

export default function ScanSearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const magazines = useCollectionStore((s) => s.magazines);
  const loadDetail = useCollectionStore((s) => s.loadDetail);
  const detail = useCollectionStore((s) => s.detail);
  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);

  const [publication, setPublication] = useState('');
  const [issueNumber, setIssueNumber] = useState(EMPTY_ISSUE);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Extract<OcrLookupResult, { status: 'found' | 'unknown' }> | null>(
    null,
  );

  const publications = [...new Set(magazines.map((m) => m.publication))];

  const foundId = result?.status === 'found' ? result.magazine.id : null;

  useFocusEffect(
    useCallback(() => {
      if (foundId) {
        loadDetail(foundId);
      }
    }, [foundId, loadDetail]),
  );

  const issue = issueNumber.replace(/[^0-9]/g, '');
  const canSearch = publication.trim().length > 0 && issue.length > 0 && !searching;

  const search = async () => {
    if (!canSearch) {
      return;
    }
    setSearching(true);
    const { identificationService } = getDeps();
    const resultNow = await identificationService.searchByOcrFields(
      publication.trim(),
      Number(issue),
      null,
    );
    if (resultNow.status === 'found' || resultNow.status === 'unknown') {
      setResult(resultNow);
    } else {
      setResult(null);
    }
    setSearching(false);
  };

  const resetForm = () => {
    setResult(null);
    setPublication('');
    setIssueNumber(EMPTY_ISSUE);
  };

  const resolved = detail != null && detail.id === foundId;
  const owned = resolved && detail.copies.length > 0;
  const ownedCount = resolved ? detail.copies.length : 0;

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleAddCopy = () => {
    if (!foundId) {
      return;
    }
    const alreadyOwned = owned;
    const perform = async () => {
      await addExistingCopy(foundId);
      toast(alreadyOwned ? 'Exemplaire ajouté à la collection' : 'Ajouté à la collection');
    };
    if (alreadyOwned) {
      Alert.alert(
        'Vous possédez déjà ce magazine',
        `Exemplaires actuels : ${ownedCount}\nVoulez-vous ajouter un deuxième exemplaire ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ajouter quand même', style: 'destructive', onPress: perform },
        ],
      );
    } else {
      perform();
    }
  };

  const handleManual = () => {
    router.replace({
      pathname: '/scan/manual',
      params:
        publication.trim() || issue
          ? { publication: publication.trim(), issueNumber: issue }
          : {},
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            onPress={handleCancel}
            testID="search-cancel"
            accessibilityRole="button"
            accessibilityLabel="Annuler la recherche"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Rechercher un magazine</Text>
        </View>

        {!result ? (
          <View style={styles.form}>
            <AutocompleteInput
              label="Publication *"
              value={publication}
              options={publications}
              onChangeText={setPublication}
              placeholder="Ex : Picsou Magazine"
              testID="search-publication"
              accessibilityLabel="Publication"
            />

            <Text style={styles.label}>Numéro</Text>
            <TextInput
              style={styles.input}
              value={issueNumber}
              onChangeText={setIssueNumber}
              placeholder="Ex : 547"
              keyboardType="number-pad"
              returnKeyType="done"
              placeholderTextColor={colors.textSecondary}
              testID="search-issue"
              accessibilityLabel="Numéro"
            />

            <Pressable
              style={({ pressed }) => [styles.primaryButton, !canSearch && styles.disabled]}
              onPress={search}
              disabled={!canSearch}
              testID="search-submit"
              accessibilityRole="button"
              accessibilityState={{ disabled: !canSearch }}>
              <Text style={styles.primaryButtonText}>
                {searching ? 'Recherche…' : 'Rechercher'}
              </Text>
            </Pressable>
            {!canSearch && !searching ? (
              <Text style={styles.hint} testID="search-hint">
                Renseignez la publication et le numéro pour rechercher.
              </Text>
            ) : null}
          </View>
        ) : result.status === 'found' ? (
          <View style={styles.form}>
            <Text style={styles.resultTitle}>Déjà dans votre collection</Text>
            <View style={styles.card}>
              <Text style={styles.magazine} testID="search-magazine">
                {result.publication}
              </Text>
              {result.issueNumber != null ? <Text style={styles.issue}>N° {result.issueNumber}</Text> : null}
              {resolved ? (
                <Text
                  style={owned ? styles.ownedText : styles.absentText}
                  testID={`search-status-${owned ? 'owned' : 'absent'}`}>
                  {owned ? `✓ Possédé (${ownedCount})` : '○ Absent'}
                </Text>
              ) : (
                <Text style={styles.muted} testID="search-loading">
                  Vérification…
                </Text>
              )}
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleAddCopy}
              testID="search-add"
              accessibilityRole="button"
              accessibilityLabel={owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}>
              <Text style={styles.primaryButtonText}>
                {owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={() => router.replace(`/collection/${foundId}`)}
              testID="search-view"
              accessibilityRole="button"
              accessibilityLabel="Voir la fiche du magazine">
              <Text style={styles.secondaryButtonText}>Voir la fiche</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={() => router.replace('/scan/barcode')}
              testID="search-rescan"
              accessibilityRole="button"
              accessibilityLabel="Scanner à nouveau">
              <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.resultTitle}>Non référencé</Text>
            <View style={styles.card}>
              <Text style={styles.message}>
                « {result.publication} » n&apos;est pas encore dans votre collection.
              </Text>
              {result.issueNumber != null ? <Text style={styles.issue}>N° {result.issueNumber}</Text> : null}
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              onPress={handleManual}
              testID="search-manual"
              accessibilityRole="button"
              accessibilityLabel="Saisir manuellement">
              <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
              onPress={resetForm}
              testID="search-again"
              accessibilityRole="button"
              accessibilityLabel="Rechercher un autre magazine">
              <Text style={styles.secondaryButtonText}>Rechercher un autre magazine</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      padding: Spacing.four,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    backButton: {
      minWidth: HitTarget.minHeight,
      minHeight: HitTarget.minHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
    title: {
      flex: 1,
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700',
      color: colors.text,
    },
    form: {
      flex: 1,
      gap: Spacing.three,
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
      minHeight: 44,
      fontSize: 16,
      color: colors.text,
    },
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
    },
    disabled: {
      opacity: 0.5,
    },
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.accentText,
    },
    secondaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    resultTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      padding: Spacing.four,
      alignItems: 'center',
      gap: Spacing.two,
    },
    magazine: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    issue: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    message: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    muted: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    ownedText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.ownedText,
      backgroundColor: colors.ownedBg,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      borderRadius: 8,
      overflow: 'hidden',
    },
    absentText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.absentText,
      backgroundColor: colors.absentBg,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      borderRadius: 8,
      overflow: 'hidden',
    },
  });
}