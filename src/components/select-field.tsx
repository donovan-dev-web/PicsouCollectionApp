import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';

type Props<T extends string> = {
  label: string;
  placeholder: string;
  value: string | null;
  options: readonly T[];
  onSelect: (value: string) => void;
  testID: string;
};

/**
 * Liste déroulante légère (sans dépendance native). Affiche une liste de choix
 * sur appui, permettant de sélectionner une valeur (ex. mois, année).
 */
export function SelectField<T extends string>({
  label,
  placeholder,
  value,
  options,
  onSelect,
  testID,
}: Props<T>) {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const [open, setOpen] = useState(false);

  const handleSelect = (option: string) => {
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
        accessibilityLabel={label}>
        <Text style={value ? styles.value : styles.placeholder}>{value || placeholder}</Text>
        <Text style={styles.chevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>

      {open && (
        <View style={styles.listContainer}>
          <FlatList
            data={options}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.option,
                  item === value && styles.optionSelected,
                  pressed && styles.pressed,
                ]}
                onPress={() => handleSelect(item)}
                testID={`${testID}-option-${item}`}
                accessibilityRole="button">
                <Text style={item === value ? styles.optionTextSelected : styles.optionText}>
                  {item}
                </Text>
              </Pressable>
            )}
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
      paddingVertical: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    value: {
      fontSize: 16,
      color: colors.text,
    },
    placeholder: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    chevron: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    pressed: {
      opacity: 0.7,
    },
    listContainer: {
      marginTop: Spacing.two,
      borderWidth: 1,
      borderColor: colors.backgroundElement,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: colors.background,
    },
    listContent: {
      maxHeight: 240,
    },
    option: {
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
      color: colors.accent,
      fontWeight: '600',
    },
  });
}
