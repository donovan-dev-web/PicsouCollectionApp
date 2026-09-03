import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CameraView as CameraViewType } from 'expo-camera';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';

/** Intervalle d'analyse OCR : quelques frames / seconde max (pas toutes). */
const ANALYSIS_INTERVAL_MS = 500;

type OcrState =
  | { status: 'analyzing' }
  | {
      status: 'weak';
      publication: string;
      issueNumber: number | null;
      date: string | null;
      confidence: number;
      message: string;
    }
  | {
      status: 'found';
      id: string;
      publication: string;
      issueNumber: number | null;
      date: string | null;
      confidence: number;
    }
  | {
      status: 'unknown';
      publication: string;
      issueNumber: number | null;
      date: string | null;
      confidence: number;
    };

export default function CameraOcrScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<OcrState>({ status: 'analyzing' });
  const inFlight = useRef(false);
  const cameraRef = useRef<CameraViewType>(null);

  useEffect(() => {
    if (!permission?.granted) {
      return;
    }
    if (state.status !== 'analyzing') {
      return;
    }

    const { ocrEngine, identificationService } = getDeps();
    const interval = setInterval(async () => {
      if (inFlight.current) {
        return;
      }
      inFlight.current = true;
      try {
        // Capture éphémère d'une photo (aucune image persistée) → URI.
        const photo = await cameraRef.current?.takePictureAsync?.();
        const uri = photo?.uri ?? null;
        const frame = await ocrEngine.recognize({ native: uri, width: 0, height: 0 });
        if (!frame) {
          return;
        }
        const result = await identificationService.identifyByOCR(frame.text);
        if (result.status === 'no-text') {
          return;
        }
        if (result.status === 'weak') {
          setState({
            status: 'weak',
            publication: result.publication,
            issueNumber: result.issueNumber,
            date: result.date,
            confidence: result.confidence,
            message: 'Impossible d’identifier précisément ce magazine.',
          });
          return;
        }
        if (result.status === 'unknown') {
          setState({
            status: 'unknown',
            publication: result.publication,
            issueNumber: result.issueNumber,
            date: result.date,
            confidence: result.confidence,
          });
          return;
        }
        setState({
          status: 'found',
          id: result.magazine.id,
          publication: result.publication,
          issueNumber: result.issueNumber,
          date: result.date,
          confidence: result.confidence,
        });
      } finally {
        inFlight.current = false;
      }
    }, ANALYSIS_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [permission?.granted, state.status]);

  const stopAndRetry = () => {
    setState({ status: 'analyzing' });
  };

  const goManual = () => {
    // Pré-remplissage du formulaire manuel avec les infos extraites par l'OCR
    // (US-ID-05, correctif M-05) : publication, numéro et année.
    const params: Record<string, string> = {};
    if (state.status === 'weak' || state.status === 'unknown' || state.status === 'found') {
      if (state.publication && state.publication !== 'Publication inconnue') {
        params.publication = state.publication;
      }
      if (state.issueNumber != null) {
        params.issueNumber = String(state.issueNumber);
      }
      const year = state.date ?? null;
      if (year) {
        params.year = year;
      }
    }
    router.replace({ pathname: '/scan/manual', params });
  };

  const goBarcode = () => {
    router.replace('/scan/barcode');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.message}>Demande d’accès à la caméra…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Accès à la caméra requis</Text>
        <Text style={styles.message}>La reconnaissance de couverture a besoin de la caméra.</Text>
        {permission.canAskAgain ? (
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
            onPress={requestPermission}
            testID="ocr-permission-request"
            accessibilityRole="button">
            <Text style={styles.primaryButtonText}>Autoriser la caméra</Text>
          </Pressable>
        ) : (
          <Text style={styles.errorText} testID="ocr-permission-denied">
            Permission refusée. Autorisez la caméra dans les réglages.
          </Text>
        )}
        <Pressable
          style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
          testID="ocr-permission-cancel"
          accessibilityRole="button">
          <Text style={styles.cancelButtonText}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const isAnalyzing = state.status === 'analyzing';

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back" testID="ocr-camera-view" />

      {isAnalyzing ? (
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.reticle} />
          <Text style={styles.scanHint}>Pointez la couverture du magazine dans le cadre</Text>
          <View style={styles.processingPill}>
            <ActivityIndicator color={colors.accent} />
            <Text style={styles.processingText}>Lecture…</Text>
          </View>
        </View>
      ) : (
        <View style={styles.overlay}>
          {state.status === 'weak' && (
            <View style={styles.resultCard} testID="ocr-weak">
              <Text style={styles.mutedTitle}>Confiance insuffisante</Text>
              <Text style={styles.message}>{state.message}</Text>
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={stopAndRetry}
                testID="ocr-retry"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Réessayer avec la caméra</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={goBarcode}
                testID="ocr-barcode"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Scanner le code-barres</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={goManual}
                testID="ocr-manual"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
              </Pressable>
            </View>
          )}

          {state.status === 'found' && (
            <View style={styles.resultCard} testID="ocr-found">
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
                onPress={() => router.replace(`/collection/${state.id}`)}
                testID="ocr-confirm"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Confirmer</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={stopAndRetry}
                testID="ocr-retry"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Réessayer</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={goManual}
                testID="ocr-manual"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Saisie manuelle</Text>
              </Pressable>
            </View>
          )}

          {state.status === 'unknown' && (
            <View style={styles.resultCard} testID="ocr-unknown">
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
                onPress={goManual}
                testID="ocr-manual"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Saisir manuellement</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
                onPress={stopAndRetry}
                testID="ocr-retry"
                accessibilityRole="button">
                <Text style={styles.secondaryButtonText}>Réessayer avec la caméra</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {isAnalyzing && (
        <Pressable
          style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
          onPress={() => router.back()}
          testID="ocr-back"
          accessibilityRole="button"
          accessibilityLabel="Annuler">
          <Text style={styles.backButtonText}>✕</Text>
        </Pressable>
      )}
    </View>
  );
}

function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return 'élevée';
  }
  if (confidence >= 0.5) {
    return 'moyenne';
  }
  return 'faible';
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
    processingPill: {
      marginTop: Spacing.three,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.two,
      backgroundColor: 'rgba(0,0,0,0.55)',
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      borderRadius: 20,
    },
    processingText: {
      fontSize: 14,
      color: '#FFFFFF',
    },
    resultCard: {
      alignSelf: 'stretch',
      marginHorizontal: Spacing.four,
      backgroundColor: colors.backgroundElement,
      borderRadius: 16,
      padding: Spacing.four,
      alignItems: 'center',
      gap: Spacing.two,
    },
    mutedTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    magazine: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      textAlign: 'center',
    },
    issue: {
      fontSize: 16,
      color: colors.text,
    },
    date: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    confidence: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    message: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
    },
    primaryButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: Spacing.three,
      borderRadius: 12,
      marginTop: Spacing.two,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accentText,
      textAlign: 'center',
    },
    secondaryButton: {
      alignSelf: 'stretch',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.backgroundElement,
      paddingVertical: Spacing.three,
      borderRadius: 12,
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      textAlign: 'center',
    },
    buttonPressed: {
      opacity: 0.8,
    },
    errorText: {
      fontSize: 14,
      color: colors.danger,
      textAlign: 'center',
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
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
