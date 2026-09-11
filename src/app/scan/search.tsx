import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Screen } from '@/components/screen';
import { SelectField } from '@/components/select-field';
import { HitTarget } from '@/constants/theme';
import {
  SearchFoundResult,
  SearchUnknownResult,
  makeSearchResultStyles,
  makeSearchScreenStyles,
} from '@/components/scan-search-views';
import { useThemeColors } from '@/hooks/use-theme';
import { useCollectionStore } from '@/store/use-collection-store';

const EMPTY_ISSUE = '';
const ALL_EDITIONS = 'Toutes les éditions';

type FoundResult = {
  status: 'found';
  magazineId: string;
  publication: string;
  issueNumber: number;
};
type UnknownResult = { status: 'unknown'; edition: string | null; issueNumber: number };

export default function ScanSearchScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const screenStyles = makeSearchScreenStyles(colors);
  const magazines = useCollectionStore((s) => s.magazines);

  const [edition, setEdition] = useState<string | null>(null);
  const [issueNumber, setIssueNumber] = useState(EMPTY_ISSUE);
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<FoundResult | UnknownResult | null>(null);

  const editions = [...new Set(magazines.map((m) => m.edition).filter((e): e is string => !!e))];

  const issue = issueNumber.replace(/[^0-9]/g, '');
  const canSearch = issue.length > 0 && !searching;

  const search = () => {
    if (!canSearch) {
      return;
    }
    setSearching(true);
    const query = Number(issue);
    const matches = magazines.filter(
      (m) => m.issueNumber === query && (edition === null || m.edition === edition),
    );
    if (matches.length > 0) {
      setResult({
        status: 'found',
        magazineId: matches[0].id,
        publication: matches[0].publication,
        issueNumber: query,
      });
    } else {
      setResult({ status: 'unknown', edition, issueNumber: query });
    }
    setSearching(false);
  };

  const resetForm = () => {
    setResult(null);
    setEdition(null);
    setIssueNumber(EMPTY_ISSUE);
  };

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const handleManual = () => {
    router.replace({
      pathname: '/scan/manual',
      params: issue ? { issueNumber: issue } : {},
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
            edition={edition}
            editions={editions}
            issueNumber={issueNumber}
            canSearch={canSearch}
            searching={searching}
            onEditionChange={setEdition}
            onIssueChange={setIssueNumber}
            onSearch={search}
          />
        ) : result.status === 'found' ? (
          <SearchFoundResult
            publication={result.publication}
            issueNumber={result.issueNumber}
            onView={() => router.replace(`/collection/${result.magazineId}`)}
            onRescan={() => router.replace('/scan/barcode')}
          />
        ) : (
          <SearchUnknownResult
            edition={result.edition}
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
  edition,
  editions,
  issueNumber,
  canSearch,
  searching,
  onEditionChange,
  onIssueChange,
  onSearch,
}: {
  edition: string | null;
  editions: string[];
  issueNumber: string;
  canSearch: boolean;
  searching: boolean;
  onEditionChange: (v: string | null) => void;
  onIssueChange: (v: string) => void;
  onSearch: () => void;
}) {
  const colors = useThemeColors();
  const styles = makeSearchResultStyles(colors);
  const screenStyles = makeSearchScreenStyles(colors);

  return (
    <View style={screenStyles.form}>
      <SelectField
        label="Édition"
        placeholder={ALL_EDITIONS}
        value={edition}
        options={editions}
        onSelect={onEditionChange}
        noneLabel={ALL_EDITIONS}
        testID="search-edition"
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
          Renseignez le numéro pour rechercher.
        </Text>
      ) : null}
    </View>
  );
}
