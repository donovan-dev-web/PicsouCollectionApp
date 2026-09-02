import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';

type ScanState =
  { status: 'idle' } | { status: 'searching' } | { status: 'invalid'; reason: string };

export default function BarcodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ status: 'idle' });
  const [scanning, setScanning] = useState(true);
  const lastCode = useRef<string | null>(null);

  const handleScan = async ({ data }: { data: string; type: string }) => {
    if (!scanning || state.status === 'searching') {
      return;
    }
    const normalized = data.trim();
    if (normalized === lastCode.current) {
      return;
    }
    lastCode.current = normalized;
    setScanning(false);
    setState({ status: 'searching' });

    const { identificationService } = getDeps();
    const result = await identificationService.identifyByBarcode(normalized);

    if (result.status === 'found') {
      router.replace({
        pathname: '/scan/result',
        params: {
          id: result.magazine.id,
          publication: result.magazine.publication,
          issueNumber:
            result.magazine.issueNumber != null ? String(result.magazine.issueNumber) : '',
          barcode: normalized,
        },
      });
    } else if (result.status === 'unknown') {
      router.replace({ pathname: '/scan/result', params: { barcode: normalized } });
    } else {
      setState({ status: 'invalid', reason: result.reason });
      setScanning(true);
    }
  };

  const reset = () => {
    lastCode.current = null;
    setScanning(true);
    setState({ status: 'idle' });
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.message}>Demande d&apos;accès à la caméra…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès à la caméra requis</Text>
        <Text style={styles.message}>
          Le scan de code-barres a besoin de la caméra pour identifier vos magazines.
        </Text>
        {permission.canAskAgain ? (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={requestPermission}
            testID="permission-request"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Autoriser la caméra</Text>
          </Pressable>
        ) : (
          <Text style={styles.errorText} testID="permission-denied">
            Permission refusée. Autorisez la caméra dans les réglages.
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
          testID="permission-cancel"
          accessibilityRole="button">
          <Text style={styles.cancelButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['ean13', 'code128', 'itf14', 'upc_a'] }}
        onBarcodeScanned={handleScan}
        testID="camera-view"
      />

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.reticle} />
        <Text style={styles.scanHint}>
          {state.status === 'searching' ? 'Recherche…' : 'Alignez le code-barres dans le cadre'}
        </Text>
        {state.status === 'invalid' && (
          <Text style={styles.invalidText} testID="invalid-reason">
            {state.reason}
          </Text>
        )}
      </View>

      {state.status === 'idle' && (
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
          testID="scan-back"
          accessibilityRole="button"
          accessibilityLabel="Annuler">
          <Text style={styles.backButtonText}>✕</Text>
        </Pressable>
      )}

      {state.status === 'invalid' && (
        <View style={styles.invalidActions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={reset}
            testID="invalid-retry"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Scanner à nouveau</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function makeStyles(colors: ThemeColors) {
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
    reticle: {
      width: 220,
      height: 220,
      borderWidth: 3,
      borderColor: colors.accent,
      borderRadius: 16,
      backgroundColor: 'transparent',
    },
    scanHint: {
      marginTop: Spacing.three,
      fontSize: 14,
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
      color: '#FFD5D2',
      textAlign: 'center',
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      overflow: 'hidden',
    },
    invalidActions: {
      position: 'absolute',
      left: Spacing.four,
      right: Spacing.four,
      bottom: 60,
    },
    primaryButton: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      textAlign: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
    },
    cancelButton: {
      marginTop: Spacing.three,
      alignSelf: 'center',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    cancelButtonText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    backButton: {
      position: 'absolute',
      top: 48,
      left: Spacing.three,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: 'rgba(0,0,0,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    backButtonText: {
      fontSize: 20,
      color: '#FFFFFF',
    },
  });
}
