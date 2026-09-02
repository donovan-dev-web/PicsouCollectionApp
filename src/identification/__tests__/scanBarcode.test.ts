import { scanBarcode, validateBarcode, cleanBarcode } from '@/identification/scanBarcode';

describe('cleanBarcode', () => {
  it('retire les caractères non numériques', () => {
    expect(cleanBarcode('5901-2341-2345-7')).toBe('5901234123457');
    expect(cleanBarcode('590 123 412 345 7')).toBe('5901234123457');
  });
});

describe('validateBarcode', () => {
  it('reconnaît un EAN-13 valide', () => {
    expect(validateBarcode('5901234123457')).toEqual({
      valid: true,
      type: 'EAN-13',
      normalized: '5901234123457',
    });
  });

  it('reconnaît un ISBN-10 valide', () => {
    expect(validateBarcode('0306406152')).toEqual({
      valid: true,
      type: 'ISBN-10',
      normalized: '0306406152',
    });
  });

  it('reconnaît un ISBN-13 valide (préfixe 978)', () => {
    expect(validateBarcode('9780306406157')).toEqual({
      valid: true,
      type: 'ISBN-13',
      normalized: '9780306406157',
    });
  });

  it('accepte un ISBN-10 se terminant par X', () => {
    // 0-8044-2957-X est un ISBN-10 valide se terminant par X
    const result = validateBarcode('080442957X');
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.type).toBe('ISBN-10');
    }
  });

  it('rejette un EAN-13 au checksum invalide', () => {
    expect(validateBarcode('5901234123458')).toEqual({
      valid: false,
      reason: 'EAN-13 invalide (checksum).',
    });
  });

  it('rejette un code vide', () => {
    expect(validateBarcode('')).toEqual({
      valid: false,
      reason: 'Aucun chiffre détecté.',
    });
  });

  it('rejette un code sans chiffres', () => {
    expect(validateBarcode('abc')).toEqual({
      valid: false,
      reason: 'Aucun chiffre détecté.',
    });
  });

  it('rejette un code de longueur inappropriée', () => {
    expect(validateBarcode('123')).toEqual({
      valid: false,
      reason: 'Format de code-barres non supporté.',
    });
  });
});

describe('scanBarcode', () => {
  it('retourne un code valide normalisé', () => {
    expect(scanBarcode('5901-2341-2345-7')).toEqual({
      status: 'found',
      normalized: '5901234123457',
    });
  });

  it('retourne une erreur pour un code invalide', () => {
    expect(scanBarcode('1234567890123')).toEqual({
      status: 'invalid',
      reason: 'EAN-13 invalide (checksum).',
    });
  });
});
