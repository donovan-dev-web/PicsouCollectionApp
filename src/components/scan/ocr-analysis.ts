import { MIN_CONFIDENCE } from '@/identification/ocr/ocrTextParser';

/**
 * Intervalle d'analyse OCR : quelques frames / seconde max (pas toutes).
 */
export const ANALYSIS_INTERVAL_MS = 500;

/**
 * Lectures OCR identiques requises avant de conclure une identification
 * (M10R2-09 — vote multi-frames conservateur, une lecture isolée pouvant être
 * erronée sur des textes stylisés / à encres faibles).
 */
export const OCR_STABLE_READS = 2;

/**
 * Informations détectées par l'OCR, affichées en surcouche caméra (US-ID-08)
 * et proposées à la validation / correction (US-ID-09).
 */
export type DetectedInfo = {
  publication: string | null;
  issueNumber: number | null;
  date: string | null;
};

export const EMPTY_DETECTED: DetectedInfo = { publication: null, issueNumber: null, date: null };

export type OcrUiState =
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

export function hasAnyDetected(detected: DetectedInfo): boolean {
  return detected.publication !== null || detected.issueNumber !== null || detected.date !== null;
}

/** Construit les paramètres de navigation vers la saisie manuelle pré-remplie. */
export function buildManualParams(detected: Partial<DetectedInfo>): Record<string, string> {
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
}

export function confidenceLabel(confidence: number): string {
  if (confidence >= 0.8) {
    return 'élevée';
  }
  if (confidence >= MIN_CONFIDENCE) {
    return 'moyenne';
  }
  return 'faible';
}
