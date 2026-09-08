import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HitTarget, Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

export function makeSearchResultStyles(colors: ThemeColors) {
  return StyleSheet.create({
    form: {
      flex: 1,
      gap: Spacing.three,
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
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      minHeight: 48,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 12,
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
    pressed: {
      opacity: 0.7,
    },
  });
}

type SearchFoundResultProps = {
  publication: string;
  issueNumber: number | null;
  owned: boolean;
  ownedCount: number;
  resolved: boolean;
  onAddCopy: () => void;
  onView: () => void;
  onRescan: () => void;
};

export function SearchFoundResult({
  publication,
  issueNumber,
  owned,
  ownedCount,
  resolved,
  onAddCopy,
  onView,
  onRescan,
}: SearchFoundResultProps) {
  const colors = useThemeColors();
  const styles = makeSearchResultStyles(colors);

  return (
    <View style={styles.form}>
      <Text style={styles.resultTitle}>Déjà dans votre collection</Text>
      <View style={styles.card}>
        <Text style={styles.magazine} testID="search-magazine">
          {publication}
        </Text>
        {issueNumber != null ? <Text style={styles.issue}>N° {issueNumber}</Text> : null}
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
        onPress={onAddCopy}
        testID="search-add"
        accessibilityRole="button"
        accessibilityLabel={owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}>
        <Text style={styles.primaryButtonText}>
          {owned ? 'Ajouter un exemplaire' : 'Ajouter à la collection'}
        </Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={onView}
        testID="search-view"
        accessibilityRole="button"
        accessibilityLabel="Voir la fiche du magazine">
        <Text style={styles.secondaryButtonText}>Voir la fiche</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={onRescan}
        testID="search-rescan"
        accessibilityRole="button"
        accessibilityLabel="Scanner à nouveau">
        <Text style={styles.secondaryButtonText}>Scanner à nouveau</Text>
      </Pressable>
    </View>
  );
}

type SearchUnknownResultProps = {
  publication: string;
  issueNumber: number | null;
  onManual: () => void;
  onAgain: () => void;
};

export function SearchUnknownResult({
  publication,
  issueNumber,
  onManual,
  onAgain,
}: SearchUnknownResultProps) {
  const colors = useThemeColors();
  const styles = makeSearchResultStyles(colors);

  return (
    <View style={styles.form}>
      <Text style={styles.resultTitle}>Non référencé</Text>
      <View style={styles.card}>
        <Text style={styles.message}>
          « {publication} » n&apos;est pas encore dans votre collection.
        </Text>
        {issueNumber != null ? <Text style={styles.issue}>N° {issueNumber}</Text> : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
        onPress={onManual}
        testID="search-manual"
        accessibilityRole="button"
        accessibilityLabel="Saisir manuellement">
        <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
        onPress={onAgain}
        testID="search-again"
        accessibilityRole="button"
        accessibilityLabel="Rechercher un autre magazine">
        <Text style={styles.secondaryButtonText}>Rechercher un autre magazine</Text>
      </Pressable>
    </View>
  );
}

export function makeSearchScreenStyles(colors: ThemeColors) {
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
    disabled: {
      opacity: 0.5,
    },
    hint: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
