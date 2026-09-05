import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props<T extends string> = {
  label: string;
  placeholder: string;
  value: string | null;
  options: readonly T[];
  onSelect: (value: string | null) => void;
  testID: string;
  /** Option ajoutée en tête permettant de réinitialiser (émet `null`). */
  noneLabel?: string;
};

/**
 * Liste déroulante légère (sans dépendance native). Affiche une liste de choix
 * sur appui, permettant de sélectionner une valeur (ex. mois, année) ou de la
 * réinitialiser via `noneLabel`.
 */
export function SelectField<T extends string>({
  label,
  placeholder,
  value,
  options,
  onSelect,
  testID,
  noneLabel,
}: Props<T>) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string | null) => {
    onSelect(option);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}
        onPress={() => setOpen((o) => !o)}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ expanded: open }}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
        <Feather
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {open && (
        <View style={styles.listContainer}>
          <FlatList
            data={(noneLabel ? [noneLabel, ...options] : options) as readonly string[]}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const isNone = noneLabel != null && item === noneLabel;
              const selected = value === null ? isNone : item === value;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => handleSelect(isNone ? null : item)}
                  testID={`${testID}-option-${item}`}
                  accessibilityRole="button">
                  <Text style={selected ? styles.optionTextSelected : styles.optionText}>
                    {item}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
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
    control: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 8,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    value: {
      fontSize: 16,
      color: colors.text,
      flexShrink: 1,
    },
    placeholder: {
      fontSize: 16,
      color: colors.textSecondary,
      flexShrink: 1,
    },
    pressed: {
      opacity: 0.7,
    },
    listContainer: {
      marginTop: Spacing.two,
      borderWidth: 1,
      borderColor: colors.textSecondary,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.background,
      maxHeight: 240,
    },
    listContent: {
      flexGrow: 0,
    },
    option: {
      justifyContent: 'center',
      minHeight: 44,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
    },
    optionSelected: {
      backgroundColor: colors.backgroundElement,
    },
    optionText: {
      fontSize: 15,
      color: colors.text,
    },
    optionTextSelected: {
      fontSize: 15,
      color: colors.accentTextOnLight,
      fontWeight: '600',
    },
  });
}
