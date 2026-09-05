import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { CameraView as CameraViewType } from 'expo-camera';

import { Spacing, type ThemeColors } from '@/constants/theme';
import { getDeps } from '@/dependencies';
import { useThemeColors } from '@/hooks/use-theme';

/** Intervalle d'analyse OCR : quelques frames / seconde max (pas toutes). */
const ANALYSIS_INTERVAL_MS = 500;

/**
 * Informations détectées par l'OCR, affichées en surcouche caméra (US-ID-08)
 * et proposées à la validation / correction (US-ID-09).
 */
type DetectedInfo = {
  publication: string | null;
  issueNumber: number | null;
  date: string | null;
};

const EMPTY_DETECTED: DetectedInfo = { publication: null, issueNumber: null, date: null };

type OcrUiState =
  | { status: 'analyzing'; detected: DetectedInfo }
  | { status: 'confirm'; detected: DetectedInfo }
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

function hasAnyDetected(detected: DetectedInfo): boolean {
  return detected.publication !== null || detected.issueNumber !== null || detected.date !== null;
}

export default function CameraOcrScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const styles = makeStyles(colors);

  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<OcrUiState>({
    status: 'analyzing',
    detected: EMPTY_DETECTED,
  });
  const [draft, setDraft] = useState<DetectedInfo>(EMPTY_DETECTED);
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
          // US-ID-08 : on ne conclut plus en échec dès la première lecture partielle.
          // On met en surcouche les champs détectés et on continue d'analyser
          // (le pointeur guide l'utilisateur vers le champ manquant).
          setState((prev) =>
            prev.status === 'analyzing'
              ? {
                  status: 'analyzing',
                  detected: {
                    publication:
                      result.publication === 'Publication inconnue' ? null : result.publication,
                    issueNumber: result.issueNumber,
                    date: result.date,
                  },
                }
              : prev,
          );
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
    setState({ status: 'analyzing', detected: EMPTY_DETECTED });
  };

  const openConfirm = () => {
    const detected =
      state.status === 'analyzing' || state.status === 'confirm' ? state.detected : EMPTY_DETECTED;
    setDraft(detected);
    setState({ status: 'confirm', detected });
  };

  const buildManualParams = (detected: Partial<DetectedInfo>): Record<string, string> => {
    const params: Record<string, string> = {};
    if (detected.publication) {
      params.publication = detected.publication;
    }
    if (detected.issueNumber != null) {
      params.issueNumber = String(detected.issueNumber);
    }
    if (detected.date) {
      params.year = detected.date;
    }
    return params;
  };

  const goManual = (detected: Partial<DetectedInfo>) => {
    router.replace({ pathname: '/scan/manual', params: buildManualParams(detected) });
  };

  const goBarcode = () => {
    router.replace('/scan/barcode');
  };

  /** US-ID-09 : recherche en outrepassant la confiance (champs validés/corrigés). */
  const searchFromDraft = async () => {
    const publication = draft.publication?.trim() ?? '';
    const rawNumber = draft.issueNumber?.toString().trim() ?? '';
    const issueNumber = rawNumber ? Number(rawNumber) : null;
    const date = draft.date?.trim() || null;

    if (!publication || issueNumber === null || !Number.isFinite(issueNumber)) {
      // Impossible de rechercher : on oriente vers la saisie manuelle pré-remplie.
      goManual({ publication: publication || undefined, issueNumber, date });
      return;
    }

    const { identificationService } = getDeps();
    const result = await identificationService.searchByOcrFields(publication, issueNumber, date);

    if (result.status === 'weak' || result.status === 'no-text') {
      goManual({ publication, issueNumber, date });
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
      <CameraView ref={cameraRef} style={styles.camera} facing="back" testID="ocr-camera-view" />

      {isAnalyzing && (
        <>
          <View style={styles.overlay}>
            <View style={styles.reticle} />
            <Text style={styles.scanHint} testID="ocr-hint">
              {hint}
            </Text>
            <View style={styles.processingPill}>
              <ActivityIndicator color={colors.accent} />
              <Text style={styles.processingText}>Lecture…</Text>
            </View>

            {/* Surcouche US-ID-08 : champs détectés en direct. */}
            <View style={styles.detectedBoard} testID="ocr-detected-board">
              <View style={styles.detectedRow}>
                <Text style={styles.detectedLabel}>Nom</Text>
                <Text
                  style={[
                    styles.detectedValue,
                    state.detected.publication === null && styles.detectedValueEmpty,
                  ]}
                  testID="ocr-field-publication">
                  {state.detected.publication ?? '…'}
                </Text>
              </View>
              <View style={styles.detectedRow}>
                <Text style={styles.detectedLabel}>Numéro</Text>
                <Text
                  style={[
                    styles.detectedValue,
                    state.detected.issueNumber === null && styles.detectedValueEmpty,
                  ]}
                  testID="ocr-field-issue">
                  {state.detected.issueNumber?.toString() ?? '…'}
                </Text>
              </View>
              <View style={styles.detectedRow}>
                <Text style={styles.detectedLabel}>Édition / date</Text>
                <Text
                  style={[
                    styles.detectedValue,
                    state.detected.date === null && styles.detectedValueEmpty,
                  ]}
                  testID="ocr-field-date">
                  {state.detected.date ?? '…'}
                </Text>
              </View>
            </View>

            {hasAnyDetected(state.detected) && (
              <Pressable
                style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
                onPress={openConfirm}
                testID="ocr-confirm-detected"
                accessibilityRole="button">
                <Text style={styles.primaryButtonText}>Valider ces informations détectées</Text>
              </Pressable>
            )}
          </View>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
            onPress={goBarcode}
            testID="ocr-barcode"
            accessibilityRole="button">
            <Text style={styles.secondaryButtonText}>Scanner le code-barres</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.backButton, pressed && styles.buttonPressed]}
            onPress={() => router.back()}
            testID="ocr-back"
            accessibilityRole="button"
            accessibilityLabel="Annuler">
            <Text style={styles.backButtonText}>✕</Text>
          </Pressable>
        </>
      )}

      {isConfirming && (
        <View style={styles.overlay}>
          <View style={styles.resultCard} testID="ocr-override-panel">
            <Text style={styles.mutedTitle}>Vérifier les informations</Text>
            <Text style={styles.message}>
              Corrigez les informations détectées puis validez la recherche, même si la confiance
              était insuffisante.
            </Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Nom</Text>
              <TextInput
                style={styles.input}
                value={draft.publication ?? ''}
                onChangeText={(t) => setDraft((d) => ({ ...d, publication: t }))}
                placeholder="Publication du magazine"
                placeholderTextColor={colors.textSecondary}
                testID="ocr-override-publication"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Numéro</Text>
              <TextInput
                style={styles.input}
                value={draft.issueNumber?.toString() ?? ''}
                onChangeText={(t) => setDraft((d) => ({ ...d, issueNumber: t ? Number(t) : null }))}
                placeholder="N° du magazine"
                keyboardType="number-pad"
                placeholderTextColor={colors.textSecondary}
                testID="ocr-override-issue"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.fieldLabel}>Année</Text>
              <TextInput
                style={styles.input}
                value={draft.date ?? ''}
                onChangeText={(t) => setDraft((d) => ({ ...d, date: t }))}
                placeholder="Année / date (optionnel)"
                keyboardType="default"
                placeholderTextColor={colors.textSecondary}
                testID="ocr-override-date"
              />
            </View>

            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={searchFromDraft}
              testID="ocr-override-search"
              accessibilityRole="button">
              <Text style={styles.primaryButtonText}>Rechercher</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}
              onPress={() => goManual(draft)}
              testID="ocr-override-manual"
              accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Saisir manuellement</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
              onPress={stopAndRetry}
              testID="ocr-override-back"
              accessibilityRole="button">
              <Text style={styles.cancelButtonText}>Retour à la caméra</Text>
            </Pressable>
          </View>
        </View>
      )}

      {state.status === 'found' && (
        <View style={styles.overlay}>
          <View style={styles.resultCard} testID="ocr-found">
            <Text style={styles.mutedTitle}>Couverture reconnue</Text>
            <Text style={styles.magazine} testID="ocr-publication">
              {state.publication}
            </Text>
            {state.issueNumber != null && <Text style={styles.issue}>N° {state.issueNumber}</Text>}
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
              onPress={() =>
                goManual({
                  publication: state.publication,
                  issueNumber: state.issueNumber,
                  date: state.date,
                })
              }
              testID="ocr-manual"
              accessibilityRole="button">
              <Text style={styles.secondaryButtonText}>Saisie manuelle</Text>
            </Pressable>
          </View>
        </View>
      )}

      {state.status === 'unknown' && (
        <View style={styles.overlay}>
          <View style={styles.resultCard} testID="ocr-unknown">
            <Text style={styles.mutedTitle}>Non trouvé en collection</Text>
            <Text style={styles.magazine}>{state.publication}</Text>
            {state.issueNumber != null && <Text style={styles.issue}>N° {state.issueNumber}</Text>}
            <Text style={styles.message}>
              {state.publication} n&apos;est pas encore référencé. Vous pouvez le saisir
              manuellement pour le créer.
            </Text>
            <Pressable
              style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
              onPress={() =>
                goManual({
                  publication: state.publication,
                  issueNumber: state.issueNumber,
                  date: state.date,
                })
              }
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
        </View>
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
      paddingHorizontal: Spacing.four,
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
      marginTop: Spacing.two,
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
    detectedBoard: {
      alignSelf: 'stretch',
      marginTop: Spacing.three,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderRadius: 12,
      paddingVertical: Spacing.two,
      paddingHorizontal: Spacing.three,
      gap: 6,
    },
    detectedRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: Spacing.two,
    },
    detectedLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detectedValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    detectedValueEmpty: {
      color: 'rgba(255,255,255,0.45)',
      fontWeight: '400',
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
    fieldWrap: {
      alignSelf: 'stretch',
      gap: 6,
    },
    fieldLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      alignSelf: 'stretch',
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingVertical: Spacing.three,
      paddingHorizontal: Spacing.three,
      fontSize: 16,
      color: colors.text,
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
      marginHorizontal: Spacing.four,
      marginTop: Spacing.two,
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
