/**
 * Photo + analyse OCR en attente pour l'écran de revue interactif (M-12, US-OCR-05).
 *
 * Même schéma que `lib/pending-barcode.ts` : singleton de lecture unique.
 * L'écran `/scan/ocr-review` consomme le payload immédiatement après le rendu.
 */

import type { OcrAnalysis } from '@/identification/ocr/ocrCandidateAnalyzer';
import type { OcrProposals } from '@/identification/ocr/ocrProposals';
import type { OcrTextZone } from '@/identification/ocr/ocrTypes';

export type OcrReviewPayload = {
  uri: string;
  width: number;
  height: number;
  zones: OcrTextZone[];
  analysis: OcrAnalysis;
  proposals: OcrProposals;
};

let pending: OcrReviewPayload | null = null;

export function setPendingOcrReview(payload: OcrReviewPayload): void {
  pending = payload;
}

export function consumePendingOcrReview(): OcrReviewPayload | null {
  const payload = pending;
  pending = null;
  return payload;
}

/** Purge (ex. sortie de l'écran sans l'avoir consommé). */
export function clearPendingOcrReview(): void {
  pending = null;
}