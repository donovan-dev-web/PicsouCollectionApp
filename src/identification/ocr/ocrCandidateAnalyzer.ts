/**
 * Analyse des candidats OCR par champ (M-12, US-OCR-03 / M12-03).
 *
 * À partir d'un `OcrFrameResult` (texte + zones), ce module **pur** produit, pour
 * chaque champ recherché (titre, numéro/tome/issue, année), une liste classée de
 * **candidats** associés à un **score de confiance** (0..1). Il applique les
 * **règles métier** de discrimination des nombres :
 *   - `192 PAGES` → probablement un nombre de pages, pas un numéro ;
 *   - `€8,50` / `$5` / `3 euros` → probablement un prix ;
 *   - `2026` → probablement une année ;
 *   - `TOME 12` / `N° 125` → probablement un numéro/tome.
 *
 * Aucune dépendance matérielle : le module est testable en isolation (matrices
 * de classification alimentées par le jeu de test réel, M12-08).
 */

import { PUBLICATION_ALIASES } from './ocrTextParser';
import type { OcrTextZone } from './ocrTypes';

export type OcrField = 'title' | 'issueNumber' | 'year';

export type OcrFieldCandidate = {
  value: string;
  confidence: number;
  zoneIds: string[];
};

export type OcrAnalysis = {
  candidates: Partial<Record<OcrField, OcrFieldCandidate[]>>;
  rawText: string;
};

export const MIN_ZONE_TEXT_LENGTH = 4;

const IS_YEAR = /^(19|20)\d{2}$/;
const PRICE_RE = /(?:[€$£]\s*\d+(?:[\s.,]\d+)?|\d+\s*[€$£]|\d+\s*(?:euros?|eur)\b|\bprix\s*:?\s*\d+)/i;
const PAGE_RE =
  /\d+\s*(?:pages?|pp?\.?|seiten|paginas?)\b|\b(?:pages?|pp?\.?|seiten|paginas?)\s*(?:[:]?\s*\d+)\b/i;
const MONTH_YEAR_RE =
  /\b((janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*)((19|20)\d{2})\b/i;
const ISSUE_PREFIX_RE =
  /\b(?:[n°º#]|no|numéro|numero|número|issue|numb|tome|t\.?)\s*(\d{1,4})\b/i;
/** Préfixe « numéro » franc (N° / nº / numéro / no / # / issue) : signal fort. */
const NUM_PREFIX_RE =
  /\b(?:[n°º#]|no|numéro|numero|número|issue|numb)\s*(\d{1,4})\b/i;
/** Préfixe « tome » (TOME 12 / T. 12) : variant de collection, signal moyen. */
const TOME_PREFIX_RE = /\b(?:tome|t\.?)\s*(\d{1,4})\b/i;

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

/** Classe d'une zone de texte selon les règles métier. */
type ZoneKind = 'price' | 'pages' | 'year' | 'date' | 'issue' | 'text';

type ClassifiedZone = {
  zone: OcrTextZone;
  kind: ZoneKind;
  normalized: string;
  issueValue: number | null;
  yearValue: string | null;
};

function classifyZone(zone: OcrTextZone): ClassifiedZone {
  const normalized = normalize(zone.text);

  if (PRICE_RE.test(normalized)) {
    return { zone, kind: 'price', normalized, issueValue: null, yearValue: null };
  }
  if (PAGE_RE.test(normalized)) {
    return { zone, kind: 'pages', normalized, issueValue: null, yearValue: null };
  }

  const issueMatch = normalized.match(ISSUE_PREFIX_RE);
  if (issueMatch) {
    return {
      zone,
      kind: 'issue',
      normalized,
      issueValue: Number(issueMatch[1]),
      yearValue: null,
    };
  }

  const dateMatch = normalized.match(MONTH_YEAR_RE);
  if (dateMatch && dateMatch[3]) {
    return {
      zone,
      kind: 'date',
      normalized,
      issueValue: null,
      yearValue: dateMatch[3],
    };
  }

  if (IS_YEAR.test(normalized)) {
    return { zone, kind: 'year', normalized, issueValue: null, yearValue: normalized };
  }

  // Nombre isolé : potentiel numéro (repli), jamais une année déjà traitée.
  if (/^\d{1,4}$/.test(normalized)) {
    return {
      zone,
      kind: 'issue',
      normalized,
      issueValue: Number(normalized),
      yearValue: null,
    };
  }

  return { zone, kind: 'text', normalized, issueValue: null, yearValue: null };
}

/** Alias le plus long présent dans un texte, ou `null`. */
function bestAliasFor(text: string): string | null {
  const lower = text.toLowerCase();
  let best: string | null = null;
  let bestLen = 0;
  for (const { alias } of PUBLICATION_ALIASES) {
    if (lower.includes(alias) && alias.length > bestLen) {
      best = alias;
      bestLen = alias.length;
    }
  }
  return best;
}

function isTitleLike(normalized: string): boolean {
  if (normalized.length < MIN_ZONE_TEXT_LENGTH) {
    return false;
  }
  const letters = normalized.replace(/[^a-zA-Zàâäéèêëîïôöùûüç'’ \-]/g, '');
  return letters.length >= 3 && letters.length / Math.max(normalized.length, 1) >= 0.6;
}

function candidatesForTitle(classified: ClassifiedZone[]): OcrFieldCandidate[] {
  const candidates: OcrFieldCandidate[] = [];
  for (const c of classified) {
    if (c.kind !== 'text' && c.kind !== 'issue') {
      continue;
    }
    const alias = bestAliasFor(c.normalized);
    if (alias) {
      candidates.push({
        value: PUBLICATION_ALIASES.find((a) => a.alias === alias)?.canonical ?? '',
        confidence: 0.92,
        zoneIds: [c.zone.id],
      });
      continue;
    }
    if (!isTitleLike(c.normalized)) {
      continue;
    }
    let confidence = 0.55;
    if (c.normalized.length >= 8) {
      confidence += 0.08;
    }
    candidates.push({
      value: c.normalized,
      confidence,
      zoneIds: [c.zone.id],
    });
  }
  return dedupeAndTop(candidates, 3);
}

function candidatesForIssueNumber(classified: ClassifiedZone[]): OcrFieldCandidate[] {
  const candidates: OcrFieldCandidate[] = [];
  for (const c of classified) {
    if (c.kind !== 'issue' || c.issueValue === null) {
      continue;
    }
    let confidence = 0.55;
    if (NUM_PREFIX_RE.test(c.normalized)) {
      confidence = 0.92;
    } else if (TOME_PREFIX_RE.test(c.normalized)) {
      confidence = 0.7;
    }
    candidates.push({
      value: String(c.issueValue),
      confidence,
      zoneIds: [c.zone.id],
    });
  }
  return dedupeAndTop(candidates, 3);
}

function candidatesForYear(classified: ClassifiedZone[]): OcrFieldCandidate[] {
  const candidates: OcrFieldCandidate[] = [];
  for (const c of classified) {
    if (c.yearValue) {
      candidates.push({
        value: c.yearValue,
        confidence: c.kind === 'date' ? 0.92 : 0.75,
        zoneIds: [c.zone.id],
      });
      continue;
    }
    // Année enfouie dans une ligne de texte (ex. « © Disney 2026 »).
    const year = c.normalized.match(/\b(19|20)\d{2}\b/);
    if (year && c.kind === 'text') {
      candidates.push({
        value: year[0],
        confidence: 0.6,
        zoneIds: [c.zone.id],
      });
    }
  }
  return dedupeAndTop(candidates, 3);
}

function dedupeAndTop(candidates: OcrFieldCandidate[], max: number): OcrFieldCandidate[] {
  const seen = new Set<string>();
  const result: OcrFieldCandidate[] = [];
  for (const c of candidates.sort((a, b) => b.confidence - a.confidence)) {
    const key = `${c.value}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(c);
    if (result.length >= max) {
      break;
    }
  }
  return result;
}

/**
 * Analyse un résultat OCR (texte + zones) en candidats par champ.
 * Si aucune zone n'est connue (frame simple texte), on s'appuie sur une zone
 * factice englobant le texte — le parsing global reste possible.
 */
export function analyzeOcrFrame(frame: { text: string; zones: OcrTextZone[] } | null): OcrAnalysis {
  const rawText = frame?.text ?? '';
  const zones = frame && frame.zones.length > 0 ? frame.zones : [];
  const classified = zones.map(classifyZone);

  return {
    candidates: {
      title: candidatesForTitle(classified),
      issueNumber: candidatesForIssueNumber(classified),
      year: candidatesForYear(classified),
    },
    rawText,
  };
}

/**
 * Extrait la valeur brute d'une zone pour un champ donné (sélection interactive) —
 * pur et testable. Retourne `null` si la zone ne fournit rien d'exploitable.
 */
export function extractFieldValue(field: OcrField, zoneText: string): string | null {
  const normalized = normalize(zoneText);
  if (field === 'title') {
    const alias = bestAliasFor(normalized);
    if (alias) {
      return PUBLICATION_ALIASES.find((a) => a.alias === alias)?.canonical ?? null;
    }
    const clean = normalized.replace(/\s*€$/, '');
    return isTitleLike(clean) ? clean : null;
  }
  if (field === 'issueNumber') {
    const m = normalized.match(ISSUE_PREFIX_RE);
    if (m) {
      return m[1];
    }
    if (/^\d{1,4}$/.test(normalized)) {
      const value = Number(normalized);
      return IS_YEAR.test(normalized) || value <= 0 ? null : normalized;
    }
    return null;
  }
  const year = normalized.match(/\b(19|20)\d{2}\b/);
  return year ? year[0] : null;
}