/**
 * Parsing pur et calcul de confiance OCR (M-05, US-ID-03).
 *
 * Ce module est volontairement **pur** (aucune dépendance matériel / base de
 * données) afin d'être testable en isolation, comme `scanBarcode`. Le moteur
 * OCR natif produit du texte brut ; ce parser en extrait les champs utiles
 * (publication, numéro, date) et calcule un niveau de confiance (0..1).
 */

export type OcrParseResult =
  | { status: 'idle'; confidence: 0 }
  | { status: 'no-text'; confidence: 0 }
  | {
      status: 'parsed';
      publication: string;
      issueNumber: number | null;
      date: string | null;
      confidence: number;
    };

/** Nombre minimum de caractères pour considérer qu'un texte est exploitable. */
const MIN_READABLE_LENGTH = 3;

/** Seuil de confiance sous lequel une identification n'est pas fiable. */
export const MIN_CONFIDENCE = 0.5;

/** Jargon de numérotation reconnu sur les couvertures (français & anglais). */
const ISSUE_PATTERNS: readonly RegExp[] = [
  /\bn[°º#]\s*(\d{1,4})\b/i,
  /\b(?:no|numéro|numero|número|issue|numb)\s*(\d{1,4})\b/i,
  /(?:^|\s)[°º#]\s*(\d{1,4})\b/i,
];

/**
 * Noms connus de publications. Permet de reconnaître le titre de la couverture
 * même quand il est déjà présent dans le texte scanné. Ordre : plus long d'abord
 * pour éviter des correspondances partielles.
 */
const PUBLICATION_ALIASES: readonly { alias: string; canonical: string }[] = [
  { alias: 'picsou magazine', canonical: 'Picsou Magazine' },
  { alias: 'le journal de mickey', canonical: 'Le Journal de Mickey' },
  { alias: 'journal de mickey', canonical: 'Le Journal de Mickey' },
  { alias: 'mickey junior', canonical: 'Mickey Junior' },
  { alias: 'mickey parade', canonical: 'Mickey Parade' },
  { alias: 'super picsou géant', canonical: 'Super Picsou Géant' },
  { alias: 'super picsou', canonical: 'Super Picsou Géant' },
  { alias: 'picsou géant', canonical: 'Super Picsou Géant' },
  { alias: 'ducks tales', canonical: 'Ducks Tales' },
  { alias: 'picso', canonical: 'Picsou Magazine' },
  { alias: 'picsou', canonical: 'Picsou Magazine' },
  { alias: 'mickey', canonical: 'Mickey' },
  { alias: 'spirou', canonical: 'Spirou' },
  { alias: 'donald', canonical: 'Donald' },
  { alias: 'tintin', canonical: 'Tintin' },
];

/** Mois (fr/en) et années typiques de la ligne de date. */
const MONTH_YEAR =
  /\b((janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s*)?(\d{4})\b/i;

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function extractIssueNumber(raw: string): number | null {
  for (const regex of ISSUE_PATTERNS) {
    const m = raw.match(regex);
    if (m) {
      const n = Number(m[1]);
      if (Number.isFinite(n)) {
        return n;
      }
    }
  }
  return null;
}

function closestPublication(raw: string): string | null {
  const lower = raw.toLowerCase();
  let best: string | null = null;
  let bestLen = -1;
  for (const { alias, canonical } of PUBLICATION_ALIASES) {
    if (lower.includes(alias) && alias.length > bestLen) {
      best = canonical;
      bestLen = alias.length;
    }
  }
  return best;
}

function extractDate(raw: string): string | null {
  for (const line of raw.split('\n')) {
    const m = line.match(MONTH_YEAR);
    if (m && m[3]) {
      return m[3];
    }
  }
  return null;
}

/**
 * Extrait publication, numéro et date du texte OCR d'une couverture, puis calcule
 * la confiance (0..1):
 *   - publication trouvée       → +0.4
 *   - numéro trouvé             → +0.4
 *   - date trouvée              → +0.2
 * Le texte doit être lisible (> MIN_READABLE_LENGTH) pour être exploité.
 */
export function parseOcrText(raw: string): OcrParseResult {
  const text = normalize(raw);

  if (text.length === 0) {
    return { status: 'no-text', confidence: 0 };
  }
  if (text.length < MIN_READABLE_LENGTH) {
    return { status: 'no-text', confidence: 0 };
  }

  const publication = closestPublication(text);
  const issueNumber = extractIssueNumber(text);
  const date = extractDate(text);

  let confidence = 0;
  if (publication) {
    confidence += 0.4;
  }
  if (issueNumber !== null) {
    confidence += 0.4;
  }
  if (date) {
    confidence += 0.2;
  }

  return {
    status: 'parsed',
    publication: publication ?? 'Publication inconnue',
    issueNumber,
    date,
    confidence,
  };
}

/**
 * Détermine si un résultat parsé est assez fiable pour être présenté comme
 * une identification potentielle (sans jamais être certain, cf. R8).
 */
export function isConfident(parse: Extract<OcrParseResult, { status: 'parsed' }>): boolean {
  return parse.confidence >= MIN_CONFIDENCE;
}
