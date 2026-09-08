import { Pressable, Text, TextInput, View } from 'react-native';

import { useThemeColors } from '@/hooks/use-theme';
import type { DetectedInfo } from './ocr-analysis';
import type { CameraOcrStyles } from './camera-ocr-styles';

type Props = {
  styles: CameraOcrStyles;
  draft: DetectedInfo;
  onDraftChange: (draft: DetectedInfo) => void;
  onSearch: () => void;
  onGoManual: () => void;
  onBack: () => void;
};

export function OcrConfirmOverlay({
  styles,
  draft,
  onDraftChange,
  onSearch,
  onGoManual,
  onBack,
}: Props) {
  const colors = useThemeColors();

  return (
    <View style={styles.overlay}>
      <View style={styles.resultCard} testID="ocr-override-panel">
        <Text style={styles.mutedTitle}>Vérifier les informations</Text>
        <Text style={styles.message}>
          Corrigez les informations détectées puis validez la recherche, même si la confiance était
          insuffisante.
        </Text>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Nom</Text>
          <TextInput
            style={styles.input}
            value={draft.publication ?? ''}
            onChangeText={(t) => onDraftChange({ ...draft, publication: t })}
            placeholder="Publication du magazine"
            placeholderTextColor={colors.textSecondary}
            testID="ocr-override-publication"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Numéro</Text>
          <TextInput
            style={styles.input}
            value={draft.issueNumber?.toString() ?? ''}
            onChangeText={(t) => {
              const digits = t.replace(/[^0-9]/g, '');
              onDraftChange({ ...draft, issueNumber: digits ? Number(digits) : null });
            }}
            placeholder="N° du magazine"
            keyboardType="number-pad"
            returnKeyType="done"
            placeholderTextColor={colors.textSecondary}
            testID="ocr-override-issue"
            accessibilityLabel="Numéro du magazine (chiffres uniquement)"
          />
        </View>

        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>Année</Text>
          <TextInput
            style={styles.input}
            value={draft.date ?? ''}
            onChangeText={(t) => onDraftChange({ ...draft, date: t })}
            placeholder="Année / date (optionnel)"
            keyboardType="default"
            placeholderTextColor={colors.textSecondary}
            testID="ocr-override-date"
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          onPress={onSearch}
          testID="ocr-override-search"
          accessibilityRole="button">
          <Text style={styles.primaryButtonText}>Rechercher</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
          onPress={onGoManual}
          testID="ocr-override-manual"
          accessibilityRole="button">
          <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
          onPress={onBack}
          testID="ocr-override-back"
          accessibilityRole="button">
          <Text style={styles.cancelButtonText}>Retour à la caméra</Text>
        </Pressable>
      </View>
    </View>
  );
}
