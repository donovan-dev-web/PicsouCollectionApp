/**
 * Propositions automatiques et seuil de confiance (M-12, US-OCR-04 / M12-04).
 *
 * À partir des candidats produits par `analyzeOcrFrame`, on décide le niveau
 * d'intervention utilisateur :
 *   - `auto`  : le meilleur candidat dépasse `AUTO_PROPOSE_THRESHOLD` et n'est
 *               pas contesté par un candidat quasi équivalent
 *               (écart < `CONFIDENCE_EQUALITY_MARGIN`) → proposition automatique ;
 *   - `select`: un candidat existe mais doit être validé / choisi sur la photo ;
 *   - `none`  : aucun candidat exploitable.
 *
 * Toute proposition automatique reste **modifiable** (cf. US-OCR-05/06).
 */

import type { OcrAnalysis, OcrFieldCandidate, OcrField } from './ocrCandidateAnalyzer';

/** Seuil au-delà duquel une valeur est proposée automatiquement. */
export const AUTO_PROPOSE_THRESHOLD = 0.7;

/** Marge minimale entre le 1er et le 2ᵉ candidat pour trancher sans validation. */
export const CONFIDENCE_EQUALITY_MARGIN = 0.15;

export type OcrProposal =
  | { kind: 'auto'; value: string; confidence: number; zoneIds: string[] }
  | { kind: 'select' }
  | { kind: 'none' };

export type OcrProposals = Record<OcrField, OcrProposal>;

export function buildOcrProposals(analysis: OcrAnalysis): OcrProposals {
  return {
    title: propose('title', analysis.candidates.title ?? []),
    issueNumber: propose('issueNumber', analysis.candidates.issueNumber ?? []),
    year: propose('year', analysis.candidates.year ?? []),
  };
}

function propose(field: OcrField, candidates: OcrFieldCandidate[]): OcrProposal {
  if (candidates.length === 0) {
    return { kind: 'none' };
  }
  const best = candidates[0];
  const second = candidates[1];
  const contested =
    second !== undefined && second.confidence >= best.confidence - CONFIDENCE_EQUALITY_MARGIN;
  if (best.confidence >= AUTO_PROPOSE_THRESHOLD && !contested) {
    return {
      kind: 'auto',
      value: best.value,
      confidence: best.confidence,
      zoneIds: best.zoneIds,
    };
  }
  return { kind: 'select' };
}

/**
 * Titre + numéro proposés automatiquement ⇒ le flux peut se conclure sans
 * écran intermédiaire (US-OCR-04). Sinon, une revue photo (US-OCR-05) est utile.
 */
export function canAutoSearch(proposals: OcrProposals): boolean {
  return proposals.title.kind === 'auto' && proposals.issueNumber.kind === 'auto';
}

/**
 * Les champs "saisissables" dont l'utilisateur dispose déjà : au moins un champ
 * résolu (auto) exploitable pour pré-remplir une recherche / saisie manuelle.
 */
export function hasAnyProposal(proposals: OcrProposals): boolean {
  return (
    proposals.title.kind === 'auto' ||
    proposals.issueNumber.kind === 'auto' ||
    proposals.year.kind === 'auto'
  );
}
