import { Pressable, ScrollView, Text, View } from 'react-native';

import { confidenceLabel, type OcrUiState } from './ocr-analysis';
import type { CameraOcrStyles } from './camera-ocr-styles';

type FoundState = Extract<OcrUiState, { status: 'found' }>;
type UnknownState = Extract<OcrUiState, { status: 'unknown' }>;

type Props = {
  styles: CameraOcrStyles;
  state: FoundState | UnknownState;
  onConfirm?: () => void;
  onRetry: () => void;
  onGoManual: () => void;
};

export function OcrResultOverlay({ styles, state, onConfirm, onRetry, onGoManual }: Props) {
  if (state.status === 'found') {
    return (
      <View style={styles.backdrop} testID="ocr-found">
        <ScrollView contentContainerStyle={styles.sheetScroll}>
          <View style={styles.resultCard}>
            <View style={styles.resultCardContent}>
              <Text style={styles.mutedTitle}>Couverture reconnue</Text>
              <Text style={styles.magazine} testID="ocr-publication">
                {state.publication}
              </Text>
              {state.issueNumber != null && (
                <Text style={styles.issue}>N° {state.issueNumber}</Text>
              )}
              {state.date && <Text style={styles.date}>{state.date}</Text>}
              <Text style={styles.confidence} testID="ocr-confidence">
                Confiance : {confidenceLabel(state.confidence)}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={onConfirm}
                testID="ocr-confirm"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Confirmer</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={onRetry}
                testID="ocr-retry"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Réessayer</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={onGoManual}
                testID="ocr-manual"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Saisie manuelle</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (state.status === 'unknown') {
    return (
      <View style={styles.backdrop} testID="ocr-unknown">
        <ScrollView contentContainerStyle={styles.sheetScroll}>
          <View style={styles.resultCard}>
            <View style={styles.resultCardContent}>
              <Text style={styles.mutedTitle}>Non trouvé en collection</Text>
              <Text style={styles.magazine}>{state.publication}</Text>
              {state.issueNumber != null && (
                <Text style={styles.issue}>N° {state.issueNumber}</Text>
              )}
              <Text style={styles.message}>
                {state.publication} n&apos;est pas encore référencé. Vous pouvez le saisir
                manuellement pour le créer.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={onGoManual}
                testID="ocr-manual"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={onRetry}
                testID="ocr-retry"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Réessayer avec la caméra</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return null;
}
