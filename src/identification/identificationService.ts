import type { Magazine, MagazineListItem } from '@/types';

import { isConfident, parseOcrText, type OcrParseResult } from './ocr/ocrTextParser';
import { scanBarcode } from './scanBarcode';

export type BarcodeLookupResult =
  | { status: 'found'; magazine: Magazine }
  | { status: 'ambiguous'; magazines: MagazineListItem[] }
  | { status: 'unknown' }
  | { status: 'invalid'; reason: string };

/**
 * Résultat de l'identification OCR (M-05, US-ID-03).
 *
 * `found` : un texte exploitable a été lu et l'édition correspond en base.
 * `weak`  : un texte a été lu mais la confiance est insuffisante → réessayer/manuel.
 * `unknown` : texte lisible, confiance correcte, mais aucune édition ne correspond.
 * `no-text` : le moteur n'a rien détecté d'exploitable (on continue d'analyser).
 */
export type OcrLookupResult =
  | {
      status: 'found';
      magazine: Magazine;
      publication: string;
      issueNumber: number | null;
      date: string | null;
      confidence: number;
    }
  | {
      status: 'weak';
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
    }
  | { status: 'no-text' };

export interface IdentificationRepository {
  findManyByBarcode(barcode: string): Promise<MagazineListItem[]>;
  findByPublicationAndIssue(
    publication: string,
    issueNumber: number | null,
  ): Promise<Magazine | null>;
}

/**
 * Identification d'une édition. La caméra/OCR relève des phases M-05 (`identifyByOCR`) ;
 * la possession du statut d'exemplaire est gérée ailleurs (M-06).
 */
export class IdentificationService {
  constructor(private readonly repository: IdentificationRepository) {}

  /**
   * Identifie une édition à partir d'un code-barres détecté.
   *
   * @returns `found` si une édition unique correspond, `ambiguous` si le même
   *          code-barres correspond à plusieurs éditions (→ l'utilisateur choisit),
   *          `unknown` si le code est valide mais absent (→ méthodes de secours),
   *          `invalid` si le code est mal formé.
   */
  async identifyByBarcode(raw: string): Promise<BarcodeLookupResult> {
    const scan = scanBarcode(raw);

    if (scan.status === 'invalid') {
      return { status: 'invalid', reason: scan.reason };
    }

    const magazines = await this.repository.findManyByBarcode(scan.normalized);
    if (magazines.length === 1) {
      return { status: 'found', magazine: magazines[0] };
    }
    if (magazines.length > 1) {
      return { status: 'ambiguous', magazines };
    }
    return { status: 'unknown' };
  }

  /**
   * Identifie une édition à partir du texte OCR lu sur une couverture.
   *
   * Le texte est parsé (publication, numéro, date) et un niveau de confiance
   * calculé. Si la confiance est suffisante, l'édition correspondante est
   * recherchée en base. L'application ne présente jamais une identification OCR
   * comme certaine (R8) : le flux UI propose systématiquement de confirmer,
   * réessayer ou saisir manuellement.
   *
   * @param raw texte brut détecté par un `OcrEngine` natif sur une frame.
   */
  async identifyByOCR(raw: OcrParseResult | string): Promise<OcrLookupResult> {
    const parse = typeof raw === 'string' ? parseOcrText(raw) : raw;

    if (parse.status !== 'parsed') {
      return { status: 'no-text' };
    }

    const { publication, issueNumber, date, confidence } = parse;

    if (!isConfident(parse)) {
      return { status: 'weak', publication, issueNumber, date, confidence };
    }

    const magazine = await this.repository.findByPublicationAndIssue(publication, issueNumber);

    if (magazine) {
      return {
        status: 'found',
        magazine,
        publication,
        issueNumber,
        date,
        confidence,
      };
    }

    return { status: 'unknown', publication, issueNumber, date, confidence };
  }

  /**
   * Recherche une édition à partir de champs fournis par l'utilisateur (US-ID-09),
   * en **outrepassant la règle de confiance** : l'utilisateur a vu les informations
   * détectées et les a confirmées ou corrigées.
   *
   * La recherche n'est effectuée que si **nom + numéro** sont présents ; sinon le
   * résultat est `weak` (l'UI propose alors la saisie manuelle pré-remplie).
   */
  async searchByOcrFields(
    publication: string,
    issueNumber: number | null,
    date: string | null,
  ): Promise<OcrLookupResult> {
    if (!publication || publication === 'Publication inconnue' || issueNumber === null) {
      return { status: 'weak', publication, issueNumber, date, confidence: 0 };
    }

    const magazine = await this.repository.findByPublicationAndIssue(publication, issueNumber);

    if (magazine) {
      return {
        status: 'found',
        magazine,
        publication,
        issueNumber,
        date,
        confidence: 1,
      };
    }

    return { status: 'unknown', publication, issueNumber, date, confidence: 1 };
  }
}
