import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CameraPermissionScreen } from '@/components/camera-permission-screen';
import { Spacing, type ThemeColors } from '@/constants/theme';
import { useThemeColors } from '@/hooks/use-theme';
import { BarcodeStabilizer } from '@/identification/barcodeStabilizer';
import { scanBarcode } from '@/identification/scanBarcode';
import { setPendingBarcode } from '@/lib/pending-barcode';

export default function FormBarcodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(colors, insets);

  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(true);
  const [invalidCount, setInvalidCount] = useState(0);
  const stabilizer = useRef(new BarcodeStabilizer(3));

  const handleScan = ({ data }: { data: string; type: string }) => {
    if (!scanning) {
      return;
    }
    const stabilized = stabilizer.current.push(data);
    if (stabilized === null) {
      return;
    }

    const validation = scanBarcode(stabilized);
    if (validation.status !== 'found') {
      stabilizer.current.reset();
      setInvalidCount((c) => c + 1);
      return;
    }

    setScanning(false);
    setPendingBarcode(validation.normalized);
    router.back();
  };

  if (!permission || !permission.granted) {
    return (
      <CameraPermissionScreen
        loading={!permission}
        canAskAgain={permission?.canAskAgain ?? false}
        onRequestPermission={requestPermission}
        onCancel={() => router.back()}
        description="Le scan de code-barres a besoin de la caméra pour remplir le champ."
      />
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'code93', 'itf14', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleScan}
        testID="camera-view"
      />

      <View style={styles.overlay} pointerEvents="none">
        <Text style={styles.scanHint}>Scannez le code-barres du magazine</Text>
        {invalidCount > 0 ? (
          <Text style={styles.invalidText} testID="form-invalid">
            Code illisible, réalignez-le dans le cadre…
          </Text>
        ) : null}
      </View>

      <Pressable
        style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
        onPress={() => router.back()}
        testID="scan-back"
        accessibilityRole="button"
        accessibilityLabel="Annuler">
        <Feather name="x" size={22} color="#FFFFFF" />
      </Pressable>
    </View>
  );
}

function makeStyles(colors: ThemeColors, insets: { top: number; bottom: number }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },
    camera: {
      flex: 1,
    },
    scanHint: {
      marginTop: Spacing.three,
      fontSize: 14,
      lineHeight: 20,
      color: '#FFFFFF',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      overflow: 'hidden',
    },
    invalidText: {
      marginTop: Spacing.two,
      fontSize: 14,
      lineHeight: 20,
      color: '#FFD5D2',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      overflow: 'hidden',
    },
    backButton: {
      position: 'absolute',
      top: insets.top + 12,
      left: Spacing.three,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
    },
  });
}
