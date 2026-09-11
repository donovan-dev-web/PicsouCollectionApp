import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import type { ScanState } from './use-barcode-scanning';
import type { BarcodeStyles } from './barcode-styles';

type Props = {
  styles: BarcodeStyles;
  state: ScanState;
  showContinuousStart: boolean;
  showCameraButtons: boolean;
  torchOn: boolean;
  onStartContinuous: () => void;
  onBack: () => void;
  onToggleTorch: () => void;
  onRetry: () => void;
};

export function BarcodeOverlayControls({
  styles,
  state,
  showContinuousStart,
  showCameraButtons,
  torchOn,
  onStartContinuous,
  onBack,
  onToggleTorch,
  onRetry,
}: Props) {
  return (
    <>
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.hintRow}>
          {state.status === 'searching' ? (
            <ActivityIndicator
              testID="scan-searching"
              size="small"
              color="#FFFFFF"
              accessibilityLabel="Recherche en cours"
            />
          ) : null}
          <Text style={styles.scanHint}>
            {state.status === 'searching' ? 'Recherche…' : 'Alignez le code-barres dans le cadre'}
          </Text>
        </View>
        {state.status === 'invalid' && (
          <Text style={styles.invalidText} testID="invalid-reason">
            {state.reason}
          </Text>
        )}
      </View>

      {showContinuousStart && (
        <Pressable
          style={({ pressed }) => [styles.startContinuousButton, pressed && styles.buttonPressed]}
          onPress={onStartContinuous}
          testID="continuous-start"
          accessibilityRole="button"
          accessibilityLabel="Lancer le scan en continu">
          <Text style={styles.startContinuousText}>Scan en continu</Text>
        </Pressable>
      )}

      {showCameraButtons && (
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={onBack}
          testID="scan-back"
          accessibilityRole="button"
          accessibilityLabel="Annuler">
          <Feather name="x" size={22} color="#FFFFFF" />
        </Pressable>
      )}

      {showCameraButtons && (
        <Pressable
          style={({ pressed }) => [styles.torchButton, pressed && styles.buttonPressed]}
          onPress={onToggleTorch}
          testID="scan-torch"
          accessibilityRole="button"
          accessibilityLabel={torchOn ? 'Désactiver la torche' : 'Activer la torche'}>
          <Feather name={torchOn ? 'zap' : 'zap-off'} size={20} color="#FFFFFF" />
        </Pressable>
      )}

      {state.status === 'invalid' && (
        <View style={styles.invalidActions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={onRetry}
            testID="invalid-retry"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Scanner à nouveau</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
