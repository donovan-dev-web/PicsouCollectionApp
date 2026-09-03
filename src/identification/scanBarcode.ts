/**
 * Parsing et validation des codes-barres de magazines (M-04, US-ID-02).
 *
 * Formats supportés :
 *   - EAN-13 (code principal des magazines Disney récents)
 *   - ISBN-10 et ISBN-13 (magazines pourvus d'un ISBN)
 *
 * Ce module est volontairement pur (sans dépendance au matériel caméra) afin
 * d'être testable en isolation. La détection brute depuis la caméra est fournie
 * par `expo-camera` ; son résultat est normalisé et validé ici.
 */

export type BarcodeType = 'EAN-13' | 'ISBN-10' | 'ISBN-13' | 'GENERIC';

export type BarcodeValidation =
  { valid: true; type: BarcodeType; normalized: string } | { valid: false; reason: string };

const EAN_13_LENGTH = 13;
const ISBN_10_LENGTH = 10;
const ISBN_13_LENGTH = 13;

/** Longueur minimale acceptable pour un code-barres au format non standard. */
const GENERIC_MIN_LENGTH = 6;

/** Retire les caractères non numériques d'un code barres brut (espaces, tirets…). */
export function cleanBarcode(raw: string): string {
  return raw.replace(/\D/g, '');
}

function isValidEan13(digits: string): boolean {
  let sum = 0;
  for (let i = 0; i < digits.length - 1; i++) {
    const digit = Number(digits[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(digits[digits.length - 1]);
}

function isValidIsbn10(isbn: string): boolean {
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    const ch = isbn[i];
    const value = ch === 'X' || ch === 'x' ? 10 : Number(ch);
    if (Number.isNaN(value)) {
      return false;
    }
    sum += value * (10 - i);
  }
  return sum % 11 === 0;
}

function normalizeIsbn13(raw: string): string {
  // ISBN-13 scanné : on enlève le préfixe "978" ou "979" et on garde 10 chiffres
  if (raw.length === ISBN_13_LENGTH && (raw.startsWith('978') || raw.startsWith('979'))) {
    // Retirer le préfixe + le checksum ISBN-13 resérialisé en ISBN-10 est complexe ;
    // on conserve ici la forme ISBN-13 complète, canonique pour la recherche.
    return raw;
  }
  return raw;
}

/**
 * Valide et normalise un code-barres.
 *
 * Le code est conservé **brut** (chaîne) sans conversion numérique, afin de ne jamais
 * perdre de zéros de tête (ex. un code commençant par `0`). Les formats standards
 * (EAN-13 / ISBN) restent vérifiés par checksum ; tout autre code suffisamment long
 * (alphanumérique ou sûr format non standard) est accepté tel quel (`GENERIC`).
 *
 * @param barcode code brut détecté par la caméra ou saisi manuellement
 * @returns le type de code reconnu et sa forme normalisée, ou la raison du rejet
 */
export function validateBarcode(raw: string): BarcodeValidation {
  const s = raw.trim();

  if (s.length === 0) {
    return { valid: false, reason: 'Aucun chiffre détecté.' };
  }

  // ISBN-10 (longueur exacte, peut contenir un 'X' en fin de checksum)
  const trimmedIsbn = s.toUpperCase();
  if (trimmedIsbn.length === ISBN_10_LENGTH && /^[0-9X]{10}$/.test(trimmedIsbn)) {
    if (isValidIsbn10(trimmedIsbn)) {
      return { valid: true, type: 'ISBN-10', normalized: trimmedIsbn };
    }
    return { valid: false, reason: 'ISBN-10 invalide (checksum).' };
  }

  // EAN-13 / ISBN-13 (13 chiffres, éventuellement groupés par séparateurs)
  const digits = cleanBarcode(s);
  if (digits.length === EAN_13_LENGTH) {
    if (isValidEan13(digits)) {
      const isIsbn = digits.startsWith('978') || digits.startsWith('979');
      return {
        valid: true,
        type: isIsbn ? 'ISBN-13' : 'EAN-13',
        normalized: normalizeIsbn13(digits),
      };
    }
    return { valid: false, reason: 'EAN-13 invalide (checksum).' };
  }

  // Format non standard (alphanumérique, symboles, longueurs inhabituelles) :
  // accepté tel quel dès lors qu'il est suffisamment long pour être un vrai code-barres.
  if (s.length >= GENERIC_MIN_LENGTH) {
    return { valid: true, type: 'GENERIC', normalized: s };
  }

  return { valid: false, reason: 'Format de code-barres non supporté.' };
}

export type ScanBarcodeResult =
  { status: 'found'; normalized: string } | { status: 'invalid'; reason: string };

/**
 * Point d'entrée du pipeline de scan : normalise un code brut pour la recherche.
 *
 * Utilisé tant par l'UI (après `onBarcodeScanned`) que par la saisie manuelle.
 */
export function scanBarcode(raw: string): ScanBarcodeResult {
  const validation = validateBarcode(raw);
  if (!validation.valid) {
    return { status: 'invalid', reason: validation.reason };
  }
  return { status: 'found', normalized: validation.normalized };
}
