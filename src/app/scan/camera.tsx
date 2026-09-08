import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';
import { useThemeColors } from '@/hooks/use-theme';
import { OcrAnalyzingOverlay } from '@/components/scan/ocr-analyzing-overlay';
import { OcrConfirmOverlay } from '@/components/scan/ocr-confirm-overlay';
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
    draft,
    torchOn,
    weakCycles,
    setTorchOn,
    setDraft,
    stopAndRetry,
    openConfirm,
    goManual,
    goBarcode,
    searchFromDraft,
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
  const isConfirming = state.status === 'confirm';
  const detected =
    state.status === 'analyzing' || state.status === 'confirm' ? state.detected : null;

  const hint =
    detected?.publication && detected?.issueNumber === null
      ? 'Pointez maintenant le numéro du magazine'
      : detected?.publication || detected?.issueNumber
        ? 'Identification en cours…'
        : 'Pointez la couverture du magazine dans le cadre';

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
          torchOn={torchOn}
          onOpenConfirm={openConfirm}
          onGoBarcode={goBarcode}
          onGoManual={goManual}
          onBack={() => router.back()}
          onToggleTorch={() => setTorchOn((t) => !t)}
        />
      )}

      {isConfirming && (
        <OcrConfirmOverlay
          styles={styles}
          draft={draft}
          onDraftChange={setDraft}
          onSearch={searchFromDraft}
          onGoManual={() => goManual(draft)}
          onBack={stopAndRetry}
        />
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
    </View>
  );
}
