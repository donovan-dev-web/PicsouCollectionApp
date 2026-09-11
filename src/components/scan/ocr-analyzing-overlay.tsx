import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/use-theme';
import type { DetectedInfo } from './ocr-analysis';
import type { CameraOcrStyles } from './camera-ocr-styles';

type Props = {
  styles: CameraOcrStyles;
  detected: DetectedInfo;
  hint: string;
  weakCycles: number;
  capturing: boolean;
  torchOn: boolean;
  onGoBarcode: () => void;
  onGoManual: (detected: Partial<DetectedInfo>) => void;
  onBack: () => void;
  onToggleTorch: () => void;
};

export function OcrAnalyzingOverlay({
  styles,
  detected,
  hint,
  weakCycles,
  capturing,
  torchOn,
  onGoBarcode,
  onGoManual,
  onBack,
  onToggleTorch,
}: Props) {
  const colors = useThemeColors();

  return (
    <>
      <View style={styles.overlay}>
        <Text style={styles.scanHint} testID="ocr-hint">
          {hint}
        </Text>
        {capturing && (
          <View style={styles.processingPill}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.processingText}>Lecture…</Text>
          </View>
        )}
      </View>

      <View style={styles.analyzingActions}>
        <Pressable
          style={({ pressed }) => [styles.analyzingActionButton, pressed && styles.buttonPressed]}
          onPress={() => onGoManual(detected)}
          testID="ocr-manual-shortcut"
          accessibilityRole="button">
          <Text style={styles.analyzingActionText}>Saisie manuelle</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.analyzingActionButton, pressed && styles.buttonPressed]}
          onPress={onGoBarcode}
          testID="ocr-barcode"
          accessibilityRole="button">
          <Text style={styles.analyzingActionText}>Scanner le code-barres</Text>
        </Pressable>
      </View>

      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={onBack}
        testID="ocr-back"
        accessibilityRole="button"
        accessibilityLabel="Annuler">
        <Feather name="x" size={22} color="#FFFFFF" />
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.torchButton, pressed && styles.buttonPressed]}
        onPress={onToggleTorch}
        testID="ocr-torch"
        accessibilityRole="button"
        accessibilityLabel={torchOn ? 'Désactiver la torche' : 'Activer la torche'}>
        <Feather name={torchOn ? 'zap' : 'zap-off'} size={20} color="#FFFFFF" />
      </Pressable>

      {weakCycles > 3 && detected?.publication && detected?.issueNumber === null && (
        <View style={styles.guidanceCard} testID="ocr-guidance-card">
          <Feather name="alert-circle" size={16} color={colors.accent} />
          <Text style={styles.guidanceText}>
            Le texte stylisé est difficile à lire automatiquement.
          </Text>
          <View style={styles.guidanceActions}>
            <Pressable
              style={({ pressed }) => [styles.guidanceButton, pressed && styles.buttonPressed]}
              onPress={onGoBarcode}
              testID="ocr-guidance-barcode"
              accessibilityRole="button">
              <Text style={styles.guidanceButtonText}>Code-barres</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.guidanceButton, pressed && styles.buttonPressed]}
              onPress={() => onGoManual(detected)}
              testID="ocr-guidance-manual"
              accessibilityRole="button">
              <Text style={styles.guidanceButtonText}>Saisie manuelle</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );
}
