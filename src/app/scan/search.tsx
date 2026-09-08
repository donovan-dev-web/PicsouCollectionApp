import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AutocompleteInput } from '@/components/autocomplete-input';
import { Screen } from '@/components/screen';
import { HitTarget } from '@/constants/theme';
import {
  SearchFoundResult,
  SearchUnknownResult,
  makeSearchResultStyles,
  makeSearchScreenStyles,
} from '@/components/scan-search-views';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';
import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';
import type { OcrLookupResult } from '@/identification/identificationService';

const EMPTY_ISSUE = '';

export default function ScanSearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const screenStyles = makeSearchScreenStyles(colors);
  const magazines = useCollectionStore((s) => s.magazines);
  const loadDetail = useCollectionStore((s) => s.loadDetail);
  const detail = useCollectionStore((s) => s.detail);
  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);

  const [publication, setPublication] = useState('');
  const [issueNumber, setIssueNumber] = useState(EMPTY_ISSUE);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<Extract<
    OcrLookupResult,
    { status: 'found' | 'unknown' }
  > | null>(null);

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
        publication.trim() || issue ? { publication: publication.trim(), issueNumber: issue } : {},
    });
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        style={screenStyles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
        <View style={screenStyles.header}>
          <Pressable
            style={({ pressed }) => [screenStyles.backButton, pressed && screenStyles.pressed]}
            onPress={handleCancel}
            testID="search-cancel"
            accessibilityRole="button"
            accessibilityLabel="Annuler la recherche"
            hitSlop={HitTarget.hitSlop}>
            <Feather name="arrow-left" size={22} color={colors.text} />
          </Pressable>
          <Text style={screenStyles.title}>Rechercher un magazine</Text>
        </View>

        {!result ? (
          <SearchForm
            publication={publication}
            publications={publications}
            issueNumber={issueNumber}
            canSearch={canSearch}
            searching={searching}
            onPublicationChange={setPublication}
            onIssueChange={setIssueNumber}
            onSearch={search}
          />
        ) : result.status === 'found' ? (
          <SearchFoundResult
            publication={result.publication}
            issueNumber={result.issueNumber}
            owned={owned}
            ownedCount={ownedCount}
            resolved={resolved}
            onAddCopy={handleAddCopy}
            onView={() => router.replace(`/collection/${foundId}`)}
            onRescan={() => router.replace('/scan/barcode')}
          />
        ) : (
          <SearchUnknownResult
            publication={result.publication}
            issueNumber={result.issueNumber}
            onManual={handleManual}
            onAgain={resetForm}
          />
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

function SearchForm({
  publication,
  publications,
  issueNumber,
  canSearch,
  searching,
  onPublicationChange,
  onIssueChange,
  onSearch,
}: {
  publication: string;
  publications: string[];
  issueNumber: string;
  canSearch: boolean;
  searching: boolean;
  onPublicationChange: (v: string) => void;
  onIssueChange: (v: string) => void;
  onSearch: () => void;
}) {
  const colors = useThemeColors();
  const styles = makeSearchResultStyles(colors);
  const screenStyles = makeSearchScreenStyles(colors);

  return (
    <View style={screenStyles.form}>
      <AutocompleteInput
        label="Publication *"
        value={publication}
        options={publications}
        onChangeText={onPublicationChange}
        placeholder="Ex : Picsou Magazine"
        testID="search-publication"
        accessibilityLabel="Publication"
      />

      <Text style={screenStyles.label}>Numéro</Text>
      <TextInput
        style={screenStyles.input}
        value={issueNumber}
        onChangeText={onIssueChange}
        placeholder="Ex : 547"
        keyboardType="number-pad"
        returnKeyType="done"
        placeholderTextColor={colors.textSecondary}
        testID="search-issue"
        accessibilityLabel="Numéro"
      />

      <Pressable
        style={({ pressed }) => [
          styles.primaryButton,
          !canSearch && screenStyles.disabled,
          pressed && screenStyles.pressed,
        ]}
        onPress={onSearch}
        disabled={!canSearch}
        testID="search-submit"
        accessibilityRole="button"
        accessibilityState={{ disabled: !canSearch }}>
        <Text style={styles.primaryButtonText}>{searching ? 'Recherche…' : 'Rechercher'}</Text>
      </Pressable>
      {!canSearch && !searching ? (
        <Text style={screenStyles.hint} testID="search-hint">
          Renseignez la publication et le numéro pour rechercher.
        </Text>
      ) : null}
    </View>
  );
}
