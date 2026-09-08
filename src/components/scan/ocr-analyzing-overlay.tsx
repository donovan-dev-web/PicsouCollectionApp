import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { useThemeColors } from '@/hooks/use-theme';
import { hasAnyDetected, type DetectedInfo } from './ocr-analysis';
import type { CameraOcrStyles } from './camera-ocr-styles';

type Props = {
  styles: CameraOcrStyles;
  detected: DetectedInfo;
  hint: string;
  weakCycles: number;
  torchOn: boolean;
  onOpenConfirm: () => void;
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
  torchOn,
  onOpenConfirm,
  onGoBarcode,
  onGoManual,
  onBack,
  onToggleTorch,
}: Props) {
  const colors = useThemeColors();

  return (
    <>
      <View style={styles.overlay}>
        <View style={styles.reticle} />
        <Text style={styles.scanHint} testID="ocr-hint">
          {hint}
        </Text>
        <View style={styles.processingPill}>
          <ActivityIndicator color={colors.accent} />
          <Text style={styles.processingText}>Lecture…</Text>
        </View>

        {/* Surcouche US-ID-08 : champs détectés en direct. */}
        <View style={styles.detectedBoard} testID="ocr-detected-board">
          <View style={styles.detectedRow}>
            <Text style={styles.detectedLabel}>Nom</Text>
            <Text
              style={[
                styles.detectedValue,
                detected.publication === null && styles.detectedValueEmpty,
              ]}
              testID="ocr-field-publication">
              {detected.publication ?? '…'}
            </Text>
          </View>
          <View style={styles.detectedRow}>
            <Text style={styles.detectedLabel}>Numéro</Text>
            <Text
              style={[
                styles.detectedValue,
                detected.issueNumber === null && styles.detectedValueEmpty,
              ]}
              testID="ocr-field-issue">
              {detected.issueNumber?.toString() ?? '…'}
            </Text>
          </View>
          <View style={styles.detectedRow}>
            <Text style={styles.detectedLabel}>Édition / date</Text>
            <Text
              style={[styles.detectedValue, detected.date === null && styles.detectedValueEmpty]}
              testID="ocr-field-date">
              {detected.date ?? '…'}
            </Text>
          </View>
        </View>

        {hasAnyDetected(detected) && (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={onOpenConfirm}
            testID="ocr-confirm-detected"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Valider ces informations détectées</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
        onPress={onGoBarcode}
        testID="ocr-barcode"
        accessibilityRole="button">
        <Text style={styles.secondaryButtonText}>Scanner le code-barres</Text>
      </Pressable>

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
