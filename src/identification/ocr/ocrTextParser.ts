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

/**
 * Seuil de confiance sous lequel une identification n'est pas présentable comme
 * fiable. Au-delà des M-07R (retour test v0.7.0), la « recherche déclenchable »
 * ne dépend plus de ce seuil mais de la règle `nom + numéro détectés`
 * (US-ID-08) : le seuil sert uniquement à l'étiquette (faible / moyenne / élevée).
 */
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

  // Repli M-07R (bug #127) : sur une vraie couverture, le numéro est souvent lu
  // seul (sans préfixe « n° »). Une ligne composée uniquement de 1 à 4 chiffres
  // est alors retenue comme numéro. Les années (19xx/20xx) et les textes longs
  // (codes-barres en clair) sont exclus pour éviter les faux positifs.
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!/^\d{1,4}$/.test(trimmed)) {
      continue;
    }
    if (/^(19|20)\d{2}$/.test(trimmed)) {
      continue;
    }
    const n = Number(trimmed);
    if (Number.isFinite(n)) {
      return n;
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
 *   - publication reconnue      → +0.5
 *   - numéro trouvé             → +0.4
 *   - date trouvée              → +0.1
 * Poids ajustés en M-07R (retour test physique v0.7.0) : publication seule est
 * « moyenne » (0.5) et la lecture du numéro bascule la confiance vers « élevée »,
 * réduisant les faux messages de confiance insuffisante.
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
  const issueNumber = extractIssueNumber(raw);
  const date = extractDate(text);

  let confidence = 0;
  if (publication) {
    confidence += 0.5;
  }
  if (issueNumber !== null) {
    confidence += 0.4;
  }
  if (date) {
    confidence += 0.1;
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
 * Détermine si un résultat parsé déclenche la recherche (US-ID-08 / bug #127).
 *
 * Règle M-07R : la recherche n'est lancée que lorsque **nom + numéro** minimum
 * sont détectés. Le niveau de confiance affiché reste un indicateur (l'application
 * ne présente jamais une identification OCR comme certaine, cf. R8) mais n'est
 * plus le seul arbitre du message « confiance insuffisante ».
 */
export function isConfident(parse: Extract<OcrParseResult, { status: 'parsed' }>): boolean {
  return parse.publication !== 'Publication inconnue' && parse.issueNumber !== null;
}
