import { CameraView } from 'expo-camera';
import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';
import { useThemeColors } from '@/hooks/use-theme';
import { BarcodeOverlayControls } from '@/components/scan/barcode-overlay-controls';
import {
  BarcodeContinuousBar,
  BarcodePendingSheets,
} from '@/components/scan/barcode-pending-sheets';
import { makeBarcodeStyles } from '@/components/scan/barcode-styles';
import { useBarcodeScanning } from '@/components/scan/use-barcode-scanning';

export default function BarcodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = makeBarcodeStyles(colors, insets);

  const {
    permission,
    requestPermission,
    state,
    continuous,
    torchOn,
    pending,
    setContinuous,
    setTorchOn,
    handleScan,
    resume,
    reset,
  } = useBarcodeScanning();

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionScreen
        loading={!permission}
        canAskAgain={permission?.canAskAgain ?? false}
        onRequestPermission={requestPermission}
        onCancel={() => router.back()}
        description="Le scan de code-barres a besoin de la caméra pour identifier vos magazines."
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torchOn}
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'code93', 'itf14', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleScan}
        testID="camera-view"
      />

      {continuous && !pending && (
        <BarcodeContinuousBar
          styles={styles}
          onStop={() => {
            setContinuous(false);
            resume();
          }}
        />
      )}

      <BarcodeOverlayControls
        styles={styles}
        state={state}
        showContinuousStart={state.status === 'idle' && !pending && !continuous}
        showCameraButtons={state.status === 'idle' && !pending}
        torchOn={torchOn}
        onStartContinuous={() => setContinuous(true)}
        onBack={() => router.back()}
        onToggleTorch={() => setTorchOn((t) => !t)}
        onRetry={reset}
      />

      {pending && (
        <BarcodePendingSheets
          styles={styles}
          pending={pending}
          onResume={resume}
          onManual={(barcode) => router.replace({ pathname: '/scan/manual', params: { barcode } })}
        />
      )}
    </View>
  );
}
