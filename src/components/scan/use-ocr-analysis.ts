import { useCameraPermissions } from 'expo-camera';
import type { CameraView as CameraViewType } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';

import { getDeps } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';
import {
  buildManualParams,
  EMPTY_DETECTED,
  type DetectedInfo,
  type OcrDebugFrame,
  type OcrUiState,
} from './ocr-analysis';

/**
 * Logique d'analyse OCR d'une couverture. Retours test physique : la capture
 * est désormais manuelle (1 appui → 1 photo → 1 lecture, sans son
 * d'obturateur) au lieu d'une capture périodique. Le debug OCR (paramètres
 * avancés) expose le texte brut, les champs parsés, la confiance et le nombre
 * de lectures identiques consécutives.
 */
export function useOcrAnalysis() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [state, setState] = useState<OcrUiState>({
    status: 'analyzing',
    detected: EMPTY_DETECTED,
  });
  const [draft, setDraft] = useState<DetectedInfo>(EMPTY_DETECTED);
  const [torchOn, setTorchOn] = useState(false);
  const [weakCycles, setWeakCycles] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const [debugFrame, setDebugFrame] = useState<OcrDebugFrame | null>(null);
  const inFlight = useRef(false);
  const lastKeyRef = useRef<string | null>(null);
  const voteCountRef = useRef(0);
  const cameraRef = useRef<CameraViewType>(null);
  const ocrDebug = useSettingsStore((s) => s.ocrDebug);

  const rememberFrame = (rawText: string, confidence: number | null) => {
    setDebugFrame({ rawText, confidence, voteCount: voteCountRef.current });
  };

  const capture = async () => {
    if (inFlight.current || state.status !== 'analyzing') {
      return;
    }
    inFlight.current = true;
    setCapturing(true);
    try {
      const { ocrEngine, identificationService } = getDeps();
      // Capture manuelle éphémère (aucune image persistée) → URI.
      // `shutterSound: false` (expo-camera ≤ 57) : pas de son d'obturateur.
      const photo = await cameraRef.current?.takePictureAsync?.({
        quality: 1,
        skipProcessing: false,
        shutterSound: false,
      });
      const uri = photo?.uri ?? null;
      const frame = await ocrEngine.recognize({ native: uri, width: 0, height: 0 });
      const text = frame?.text ?? '';
      if (!frame) {
        voteCountRef.current = 0;
        rememberFrame(text, null);
        setState((prev) =>
          prev.status === 'analyzing'
            ? { status: 'analyzing', detected: EMPTY_DETECTED, noText: true }
            : prev,
        );
        return;
      }
      const result = await identificationService.identifyByOCR(frame.text);

      const key = [
        result.status === 'no-text' ? '' : result.publication,
        result.status === 'no-text'
          ? ''
          : result.issueNumber != null
            ? String(result.issueNumber)
            : '',
        result.status === 'no-text' ? '' : (result.date ?? ''),
      ].join('|');
      voteCountRef.current = key === lastKeyRef.current ? voteCountRef.current + 1 : 1;
      lastKeyRef.current = key;
      const confidence = result.status === 'no-text' ? null : result.confidence;
      rememberFrame(frame.text, confidence);

      if (result.status === 'no-text') {
        setState((prev) =>
          prev.status === 'analyzing'
            ? { status: 'analyzing', detected: EMPTY_DETECTED, noText: true }
            : prev,
        );
        return;
      }

      if (result.status === 'weak') {
        // Confiance partielle : on met en surcouche les champs détectés et on
        // laisse l'utilisateur reprendre une photo ou valider (US-ID-08).
        setWeakCycles((c) => c + 1);
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
      setCapturing(false);
    }
  };

  const stopAndRetry = () => {
    lastKeyRef.current = null;
    voteCountRef.current = 0;
    setWeakCycles(0);
    setDebugFrame(null);
    setState({ status: 'analyzing', detected: EMPTY_DETECTED });
  };

  const openConfirm = () => {
    const detected =
      state.status === 'analyzing' || state.status === 'confirm' ? state.detected : EMPTY_DETECTED;
    setDraft(detected);
    setState({ status: 'confirm', detected });
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

  return {
    cameraRef,
    permission,
    requestPermission,
    state,
    draft,
    torchOn,
    weakCycles,
    capturing,
    debugFrame,
    ocrDebug,
    setTorchOn,
    setDraft,
    capture,
    stopAndRetry,
    openConfirm,
    goManual,
    goBarcode,
    searchFromDraft,
  };
}
