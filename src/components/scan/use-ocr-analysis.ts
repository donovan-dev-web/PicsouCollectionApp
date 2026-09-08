import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import type { CameraView as CameraViewType } from 'expo-camera';

import { getDeps } from '@/dependencies';
import { OcrTextStabilizer } from '@/identification/ocr/ocrTextStabilizer';
import {
  ANALYSIS_INTERVAL_MS,
  buildManualParams,
  EMPTY_DETECTED,
  OCR_STABLE_READS,
  type DetectedInfo,
  type OcrUiState,
} from './ocr-analysis';

/**
 * Logique d'analyse OCR d'une couverture (détection périodique, vote multi-frames,
 * surcouche de validation / correction, recherche hors confiance).
 *
 * Expose l'état d'interface OCR et les actions associées de façon découplée de
 * la vue, afin de la rendre testable.
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
  const inFlight = useRef(false);
  const cameraRef = useRef<CameraViewType>(null);
  const ocrStabilizer = useRef(new OcrTextStabilizer(OCR_STABLE_READS));

  useEffect(() => {
    if (!permission?.granted || state.status !== 'analyzing') {
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
        // Haute résolution (M10R2-09) : préserve les petites encres des textes stylisés.
        const photo = await cameraRef.current?.takePictureAsync?.({
          quality: 1,
          skipProcessing: false,
        });
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

        // Vote multi-frames (M10R2-09) : on ne conclut pas sur une lecture
        // isolée, une frame suivante identique est requise (textes stylisés).
        const key = [
          result.publication ?? '',
          result.issueNumber != null ? String(result.issueNumber) : '',
          result.date ?? '',
        ].join('|');
        if (!ocrStabilizer.current.push(key)) {
          return;
        }
        ocrStabilizer.current.reset();

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
    ocrStabilizer.current.reset();
    setWeakCycles(0);
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
    setTorchOn,
    setDraft,
    stopAndRetry,
    openConfirm,
    goManual,
    goBarcode,
    searchFromDraft,
  };
}
