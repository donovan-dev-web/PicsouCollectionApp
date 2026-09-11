import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';
import { useThemeColors } from '@/hooks/use-theme';
import { OcrAnalyzingOverlay } from '@/components/scan/ocr-analyzing-overlay';
import { OcrDebugPanel } from '@/components/scan/ocr-debug-panel';
import { OcrResultOverlay } from '@/components/scan/ocr-result-overlay';
import { makeCameraOcrStyles } from '@/components/scan/camera-ocr-styles';
import { useOcrAnalysis } from '@/components/scan/use-ocr-analysis';

export default function CameraOcrScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = makeCameraOcrStyles(colors, insets);
  const {
    cameraRef,
    permission,
    requestPermission,
    state,
    torchOn,
    weakCycles,
    capturing,
    debugFrame,
    ocrDebug,
    setTorchOn,
    capture,
    stopAndRetry,
    goManual,
    goBarcode,
  } = useOcrAnalysis();

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionScreen
        loading={!permission}
        canAskAgain={permission?.canAskAgain ?? false}
        onRequestPermission={requestPermission}
        onCancel={() => router.back()}
        description="La reconnaissance de couverture a besoin de la caméra."
      />
    );
  }

  const isAnalyzing = state.status === 'analyzing';
  const detected = state.status === 'analyzing' ? state.detected : null;

  const hint =
    state.status === 'analyzing'
      ? detected?.publication && detected?.issueNumber === null
        ? 'Reprenez une photo pour lire le numéro'
        : detected?.publication || detected?.issueNumber
          ? 'Pointez la couverture puis appuyez sur le déclencheur'
          : 'Pointez la couverture du magazine, puis appuyez sur le déclencheur'
      : '';

  const debugFields = {
    publication:
      state.status === 'analyzing'
        ? state.detected.publication
        : state.status === 'found' || state.status === 'unknown'
          ? state.publication
          : null,
    issueNumber:
      state.status === 'analyzing'
        ? state.detected.issueNumber
        : state.status === 'found' || state.status === 'unknown'
          ? state.issueNumber
          : null,
    date:
      state.status === 'analyzing'
        ? state.detected.date
        : state.status === 'found' || state.status === 'unknown'
          ? state.date
          : null,
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
        enableTorch={torchOn}
        testID="ocr-camera-view"
      />

      {isAnalyzing && (
        <OcrAnalyzingOverlay
          styles={styles}
          detected={state.detected}
          hint={hint}
          weakCycles={weakCycles}
          capturing={capturing}
          torchOn={torchOn}
          onGoBarcode={goBarcode}
          onGoManual={goManual}
          onBack={() => router.back()}
          onToggleTorch={() => setTorchOn((t) => !t)}
        />
      )}

      {isAnalyzing && (
        <Pressable
          style={({ pressed }) => [
            styles.shutterButton,
            capturing && styles.shutterButtonDisabled,
            pressed && styles.buttonPressed,
          ]}
          onPress={capture}
          disabled={capturing}
          testID="ocr-shutter"
          accessibilityRole="button"
          accessibilityLabel={capturing ? 'Lecture en cours' : 'Prendre la photo pour la lecture'}>
          <View style={styles.shutterButtonInner}>
            <Feather name="camera" size={26} color={colors.accentText} />
          </View>
        </Pressable>
      )}

      {state.status === 'found' && (
        <OcrResultOverlay
          styles={styles}
          state={state}
          onConfirm={() => router.replace(`/collection/${state.id}`)}
          onRetry={stopAndRetry}
          onGoManual={() =>
            goManual({
              publication: state.publication,
              issueNumber: state.issueNumber,
              date: state.date,
            })
          }
        />
      )}

      {state.status === 'unknown' && (
        <OcrResultOverlay
          styles={styles}
          state={state}
          onRetry={stopAndRetry}
          onGoManual={() =>
            goManual({
              publication: state.publication,
              issueNumber: state.issueNumber,
              date: state.date,
            })
          }
        />
      )}

      {ocrDebug && <OcrDebugPanel styles={styles} frame={debugFrame} fields={debugFields} />}
    </View>
  );
}
