import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props = {
  label: string;
  value: string;
  placeholder?: string;
  options: readonly string[];
  onChangeText: (value: string) => void;
  testID: string;
  accessibilityLabel?: string;
};

/** Normalise une valeur pour comparer sans tenir compte de la casse. */
function normalize(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Champ de saisie avec suggestions (autocomplétion). Propose les valeurs déjà
 * présentes en base qui contiennent la saisie en cours, pour accélérer la
 * saisie et éviter les doublons / différences de casse (US-COL-07).
 */
export function AutocompleteInput({
  label,
  value,
  placeholder,
  options,
  onChangeText,
  testID,
  accessibilityLabel,
}: Props) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const normalizedInput = normalize(value);
  const suggestions =
    normalizedInput.length > 0
      ? [...new Set(options)]
          .filter((option) => {
            const normalizedOption = normalize(option);
            return (
              normalizedOption !== normalizedInput && normalizedOption.includes(normalizedInput)
            );
          })
          .slice(0, 5)
      : [];

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        testID={testID}
        accessibilityLabel={accessibilityLabel ?? label}
      />
      {suggestions.length > 0 && (
        <FlatList
          style={styles.suggestions}
          data={suggestions}
          keyExtractor={(item) => item}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}
              onPress={() => onChangeText(item)}
              testID={`${testID}-suggestion-${item}`}
              accessibilityRole="button">
              <Text style={styles.suggestionText}>{item}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    field: {
      gap: 4,
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
    suggestions: {
      marginTop: Spacing.two,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.backgroundElement,
    },
    suggestion: {
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderBottomWidth: 1,
      borderBottomColor: colors.background,
    },
    suggestionText: {
      fontSize: 15,
      color: colors.text,
    },
    pressed: {
      opacity: 0.7,
    },
  });
}
