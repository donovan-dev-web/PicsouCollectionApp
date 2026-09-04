import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';
import { BarcodeStabilizer } from '@/identification/barcodeStabilizer';
import { useCollectionStore } from '@/store/use-collection-store';
import type { Magazine } from '@/types';

type ScanState =
  { status: 'idle' } | { status: 'searching' } | { status: 'invalid'; reason: string };

type Pending =
  | { kind: 'confirm'; magazine: Magazine; ownedCount: number }
  | { kind: 'success'; publication: string; issueNumber: number | null }
  | { kind: 'unknown'; barcode: string };

export default function BarcodeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);
  const params = useLocalSearchParams<{ continuous?: string }>();

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<ScanState>({ status: 'idle' });
  const [scanning, setScanning] = useState(true);
  const [continuous, setContinuous] = useState(params.continuous === '1');
  const [pending, setPending] = useState<Pending | null>(null);
  const stabilizer = useRef(new BarcodeStabilizer(3));

  const resume = () => {
    stabilizer.current.reset();
    setPending(null);
    setScanning(true);
    setState({ status: 'idle' });
  };

  const handleSingle = async (stabilized: string) => {
    const { identificationService } = getDeps();
    const result = await identificationService.identifyByBarcode(stabilized);

    if (result.status === 'found') {
      router.replace({
        pathname: '/scan/result',
        params: {
          id: result.magazine.id,
          publication: result.magazine.publication,
          issueNumber:
            result.magazine.issueNumber != null ? String(result.magazine.issueNumber) : '',
          barcode: stabilized,
        },
      });
    } else if (result.status === 'ambiguous') {
      router.replace({ pathname: '/scan/multiple', params: { barcode: stabilized } });
    } else if (result.status === 'unknown') {
      router.replace({ pathname: '/scan/result', params: { barcode: stabilized } });
    } else {
      setState({ status: 'invalid', reason: result.reason });
      setScanning(true);
    }
  };

  const handleContinuous = async (stabilized: string) => {
    const { identificationService, collectionRepository } = getDeps();
    const result = await identificationService.identifyByBarcode(stabilized);

    if (result.status === 'found') {
      const ownedCount = await collectionRepository.countByMagazine(result.magazine.id);
      if (ownedCount > 0) {
        setPending({ kind: 'confirm', magazine: result.magazine, ownedCount });
      } else {
        await addExistingCopy(result.magazine.id);
        setPending({
          kind: 'success',
          publication: result.magazine.publication,
          issueNumber: result.magazine.issueNumber,
        });
      }
    } else if (result.status === 'ambiguous') {
      router.replace({ pathname: '/scan/multiple', params: { barcode: stabilized } });
    } else if (result.status === 'unknown') {
      setPending({ kind: 'unknown', barcode: stabilized });
    } else {
      setState({ status: 'invalid', reason: result.reason });
      setScanning(true);
    }
  };

  const handleScan = async ({ data }: { data: string; type: string }) => {
    if (!scanning || state.status === 'searching' || pending) {
      return;
    }
    const stabilized = stabilizer.current.push(data);
    if (stabilized === null) {
      return;
    }
    setScanning(false);
    setState({ status: 'searching' });

    if (continuous) {
      await handleContinuous(stabilized);
    } else {
      await handleSingle(stabilized);
    }
  };

  const reset = () => {
    stabilizer.current.reset();
    setScanning(true);
    setState({ status: 'idle' });
  };

  const confirmAdd = async () => {
    if (pending?.kind !== 'confirm') {
      return;
    }
    await addExistingCopy(pending.magazine.id);
    setPending({
      kind: 'success',
      publication: pending.magazine.publication,
      issueNumber: pending.magazine.issueNumber,
    });
  };

  const confirm = pending?.kind === 'confirm' ? pending : null;
  const success = pending?.kind === 'success' ? pending : null;
  const unknown = pending?.kind === 'unknown' ? pending : null;

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
        barcodeScannerSettings={{
          barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'code93', 'itf14', 'upc_a', 'upc_e'],
        }}
        onBarcodeScanned={handleScan}
        testID="camera-view"
      />

      {continuous && !pending && (
        <View style={styles.continuousBar}>
          <Text style={styles.continuousText}>Scan en continu — ajoute chaque exemplaire</Text>
          <Pressable
            style={({ pressed }) => [styles.continuousStop, pressed && styles.buttonPressed]}
            onPress={() => {
              setContinuous(false);
              resume();
            }}
            testID="continuous-stop"
            accessibilityRole="button"
            accessibilityLabel="Arrêter le scan en continu">
            <Text style={styles.continuousStopText}>Arrêter</Text>
          </Pressable>
        </View>
      )}

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

      {state.status === 'idle' && !pending && !continuous && (
        <Pressable
          style={({ pressed }) => [styles.startContinuousButton, pressed && styles.buttonPressed]}
          onPress={() => setContinuous(true)}
          testID="continuous-start"
          accessibilityRole="button"
          accessibilityLabel="Lancer le scan en continu">
          <Text style={styles.startContinuousText}>Scan en continu</Text>
        </Pressable>
      )}

      {state.status === 'idle' && !pending && (
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

      {confirm && (
        <View style={styles.pendingCard} testID="pending-confirm">
          <Text style={styles.pendingTitle}>Vous possédez déjà ce magazine</Text>
          <Text style={styles.pendingMagazine}>
            {confirm.magazine.publication}
            {confirm.magazine.issueNumber != null ? ` n° ${confirm.magazine.issueNumber}` : ''}
          </Text>
          <Text style={styles.pendingMessage}>
            Exemplaires actuels : {confirm.ownedCount}. Ajouter un exemplaire ?
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={confirmAdd}
            testID="pending-confirm-add"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Ajouter un exemplaire</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.pendingCancel, pressed && styles.buttonPressed]}
            onPress={resume}
            testID="pending-confirm-cancel"
            accessibilityRole="button">
            <Text style={styles.pendingCancelText}>Annuler</Text>
          </Pressable>
        </View>
      )}

      {success && (
        <View style={styles.pendingCard} testID="pending-success">
          <Text style={styles.pendingTitle}>Ajouté à la collection</Text>
          <Text style={styles.pendingMagazine}>
            {success.publication}
            {success.issueNumber != null ? ` n° ${success.issueNumber}` : ''}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={resume}
            testID="pending-success-ok"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Scanner le suivant</Text>
          </Pressable>
        </View>
      )}

      {unknown && (
        <View style={styles.pendingCard} testID="pending-unknown">
          <Text style={styles.pendingTitle}>Code-barres inconnu</Text>
          <Text style={styles.pendingMessage}>{unknown.barcode}</Text>
          <Text style={styles.pendingMessage}>
            Le scan seul ne crée pas l&apos;édition. Saisissez-la manuellement.
          </Text>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={() =>
              router.replace({ pathname: '/scan/manual', params: { barcode: unknown.barcode } })
            }
            testID="pending-unknown-manual"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.pendingCancel, pressed && styles.buttonPressed]}
            onPress={resume}
            testID="pending-unknown-continue"
            accessibilityRole="button">
            <Text style={styles.pendingCancelText}>Continuer le scan</Text>
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
    continuousBar: {
      position: 'absolute',
      top: Spacing.three,
      left: Spacing.three,
      right: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.7)',
      borderRadius: 10,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    continuousText: {
      flex: 1,
      fontSize: 13,
      color: '#FFFFFF',
    },
    continuousStop: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 8,
      backgroundColor: colors.danger,
    },
    continuousStopText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.onDanger,
    },
    startContinuousButton: {
      position: 'absolute',
      left: Spacing.four,
      right: Spacing.four,
      bottom: 110,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.65)',
      paddingVertical: Spacing.two,
      borderRadius: 10,
    },
    startContinuousText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    pendingCard: {
      position: 'absolute',
      left: Spacing.four,
      right: Spacing.four,
      top: '30%',
      backgroundColor: colors.backgroundElement,
      borderRadius: 14,
      padding: Spacing.four,
      gap: Spacing.two,
      alignItems: 'center',
    },
    pendingTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    pendingMagazine: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.accent,
      textAlign: 'center',
    },
    pendingMessage: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    pendingCancel: {
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
    },
    pendingCancelText: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
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
