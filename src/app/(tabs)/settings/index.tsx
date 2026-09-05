import {
  Alert,
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { Screen } from '@/components/screen';
import { useSettingsStore, type ColorSchemeSetting } from '@/store/use-settings-store';
import { useBackupStore } from '@/store/use-backup-store';
import type { BackupFormat } from '@/backup/backup-types';

const THEME_OPTIONS: { value: ColorSchemeSetting; label: string; description: string }[] = [
  { value: 'system', label: 'Système', description: 'Suivre le thème de l’appareil' },
  { value: 'light', label: 'Clair', description: 'Appliquer le thème clair' },
  { value: 'dark', label: 'Sombre', description: 'Appliquer le thème sombre' },
];

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = makeStyles(colors);
  const colorScheme = useSettingsStore((s) => s.colorScheme);
  const setColorScheme = useSettingsStore((s) => s.setColorScheme);

  const exporting = useBackupStore((s) => s.exporting);
  const importing = useBackupStore((s) => s.importing);
  const message = useBackupStore((s) => s.message);
  const error = useBackupStore((s) => s.error);
  const lastExport = useBackupStore((s) => s.lastExport);

  const exportCollection = useBackupStore((s) => s.exportCollection);
  const pickAndValidate = useBackupStore((s) => s.pickAndValidate);
  const applyPendingImport = useBackupStore((s) => s.applyPendingImport);
  const reset = useBackupStore((s) => s.reset);

  const busy = exporting || importing;

  const handleExport = () => {
    Alert.alert('Format d’export', 'Choisissez le format de votre sauvegarde :', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'CSV', style: 'default', onPress: () => void exportCollection('csv') },
      { text: 'JSON', style: 'default', onPress: () => void exportCollection('json') },
    ]);
  };

  const handleImportChoice = (format: BackupFormat) => {
    void pickAndValidate(format).then((summary) => {
      if (!summary) {
        return;
      }
      Alert.alert(
        'Remplacer la collection ?',
        `L’import remplacera la collection actuelle par celle du fichier.\n\nFichier : ${summary.magazines} édition(s), ${summary.copies} exemplaire(s).`,
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Importer',
            style: 'destructive',
            onPress: () => {
              void applyPendingImport();
            },
          },
        ],
      );
    });
  };

  const handleImport = () => {
    Alert.alert('Format d’import', 'Choisissez le format du fichier à importer :', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'CSV', style: 'default', onPress: () => handleImportChoice('csv') },
      { text: 'JSON', style: 'default', onPress: () => handleImportChoice('json') },
    ]);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <Screen noBottom>
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <Text style={styles.title}>Paramètres</Text>

        <Text style={styles.sectionTitle}>Apparence</Text>
        <View style={styles.options} testID="theme-options">
          {THEME_OPTIONS.map((option) => {
            const selected = option.value === colorScheme;
            return (
              <Pressable
                key={option.value}
                style={({ pressed }) => [
                  styles.option,
                  selected && styles.optionSelected,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setColorScheme(option.value)}
                testID={`theme-option-${option.value}`}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={option.label}>
                <View style={styles.optionTextWrap}>
                  <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                    {option.label}
                  </Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
                {selected ? (
                  <Feather name="check" size={20} color={colors.accentTextOnLight} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>Sauvegarde</Text>
        <View style={styles.backupSection} testID="backup-actions">
          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            disabled={busy}
            onPress={handleExport}
            testID="backup-export"
            accessibilityRole="button"
            accessibilityLabel="Exporter la collection"
            accessibilityState={{ disabled: busy, busy: exporting }}
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
            <View style={styles.actionRow}>
              {exporting ? (
                <ActivityIndicator testID="backup-export-busy" size="small" color={colors.text} />
              ) : (
                <Feather name="upload" size={18} color={colors.text} />
              )}
              <Text style={styles.actionLabel}>
                {exporting ? 'Export en cours…' : 'Exporter la collection'}
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.actionButton, pressed && styles.buttonPressed]}
            disabled={busy}
            onPress={handleImport}
            testID="backup-import"
            accessibilityRole="button"
            accessibilityLabel="Importer une collection"
            accessibilityState={{ disabled: busy, busy: importing }}
            android_ripple={{ color: 'rgba(0,0,0,0.08)' }}>
            <View style={styles.actionRow}>
              {importing ? (
                <ActivityIndicator testID="backup-import-busy" size="small" color={colors.text} />
              ) : (
                <Feather name="download" size={18} color={colors.text} />
              )}
              <Text style={styles.actionLabel}>
                {importing ? 'Import en cours…' : 'Importer une collection'}
              </Text>
            </View>
          </Pressable>

          {lastExport ? (
            <Text style={styles.infoText} testID="backup-last-export">
              Dernière sauvegarde : {lastExport.name}
            </Text>
          ) : null}

          {message ? (
            <View style={styles.statusBox}>
              <Text style={styles.successText} testID="backup-message">
                {message}
              </Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText} testID="backup-error">
                {error}
              </Text>
            </View>
          ) : null}

          {error || message ? (
            <Pressable
              style={({ pressed }) => [styles.linkButton, pressed && styles.buttonPressed]}
              onPress={handleReset}
              testID="backup-dismiss"
              accessibilityRole="button"
              accessibilityLabel="Fermer le message">
              <Text style={styles.linkLabel}>Fermer</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </Screen>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      padding: Spacing.four,
      gap: Spacing.three,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textSecondary,
      marginTop: Spacing.two,
    },
    options: {
      gap: Spacing.two,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      minHeight: 56,
      borderWidth: 2,
      borderColor: colors.backgroundElement,
    },
    optionSelected: {
      borderColor: colors.accent,
    },
    optionTextWrap: {
      flex: 1,
      gap: 2,
    },
    optionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    optionLabelSelected: {
      color: colors.accentTextOnLight,
    },
    optionDescription: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    backupSection: {
      gap: Spacing.two,
    },
    actionButton: {
      backgroundColor: colors.backgroundElement,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      minHeight: 56,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.backgroundElement,
      alignItems: 'flex-start',
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
    },
    actionLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    infoText: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    statusBox: {
      backgroundColor: colors.ownedBg,
      borderRadius: 8,
      padding: Spacing.two,
      borderWidth: 1,
      borderColor: colors.success,
    },
    successText: {
      fontSize: 14,
      color: colors.success,
    },
    errorBox: {
      backgroundColor: colors.dangerBg,
      borderRadius: 8,
      padding: Spacing.two,
      borderWidth: 1,
      borderColor: colors.danger,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
    },
    linkButton: {
      alignSelf: 'flex-start',
      justifyContent: 'center',
      minHeight: 44,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.two,
      marginLeft: -Spacing.two,
    },
    linkLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
