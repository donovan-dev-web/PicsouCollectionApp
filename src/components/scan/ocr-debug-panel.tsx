import { Text, View } from 'react-native';

import type { CameraOcrStyles } from './camera-ocr-styles';
import type { OcrDebugFrame } from './ocr-analysis';

type DebugFields = {
  publication: string | null;
  issueNumber: number | null;
  date: string | null;
};

type Props = {
  styles: CameraOcrStyles;
  frame: OcrDebugFrame | null;
  fields: DebugFields;
};

/**
 * Panneau de debug OCR (paramètres avancés) : texte brut reconnu, champs
 * parsés, confiance et nombre de lectures identiques consécutives.
 */
export function OcrDebugPanel({ styles, frame, fields }: Props) {
  const confidence = frame?.confidence != null ? `${Math.round(frame.confidence * 100)} %` : null;

  return (
    <View style={styles.debugPanel} testID="ocr-debug-panel">
      <Text style={styles.debugTitle}>Debug OCR</Text>
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Texte brut</Text>
        <Text
          style={[styles.debugValue, !frame?.rawText && styles.debugValueEmpty]}
          numberOfLines={2}
          testID="ocr-debug-raw">
          {frame?.rawText || '…'}
        </Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Nom</Text>
        <Text
          style={[styles.debugValue, !fields.publication && styles.debugValueEmpty]}
          numberOfLines={1}
          testID="ocr-debug-publication">
          {fields.publication ?? '…'}
        </Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Numéro</Text>
        <Text style={[styles.debugValue, fields.issueNumber === null && styles.debugValueEmpty]}>
          {fields.issueNumber?.toString() ?? '…'}
        </Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Confiance</Text>
        <Text style={[styles.debugValue, !confidence && styles.debugValueEmpty]}>
          {confidence ?? '…'}
        </Text>
      </View>
      <View style={styles.debugRow}>
        <Text style={styles.debugLabel}>Lectures identiques</Text>
        <Text style={[styles.debugValue, (frame?.voteCount ?? 0) === 0 && styles.debugValueEmpty]}>
          {frame?.voteCount ?? '…'}
        </Text>
      </View>
    </View>
  );
}
