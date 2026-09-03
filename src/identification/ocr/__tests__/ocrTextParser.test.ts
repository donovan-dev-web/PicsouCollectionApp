import { isConfident, MIN_CONFIDENCE, parseOcrText } from '@/identification/ocr/ocrTextParser';

describe('parseOcrText', () => {
  it('retourne no-text pour un texte vide', () => {
    expect(parseOcrText('')).toEqual({ status: 'no-text', confidence: 0 });
  });

  it('retourne no-text pour un texte trop court', () => {
    expect(parseOcrText('ab')).toEqual({ status: 'no-text', confidence: 0 });
  });

  it('extrait publication, numéro et date depuis une couverture type', () => {
    const result = parseOcrText('Picsou Magazine\nN° 547\nMars 2023');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.publication).toBe('Picsou Magazine');
      expect(result.issueNumber).toBe(547);
      expect(result.date).toBe('2023');
      expect(result.confidence).toBe(1);
    }
  });

  it('reconnaît plusieurs numérotations (no, #, numéro)', () => {
    expect(parseOcrText('Picsou Magazine # 12')).toMatchObject({ issueNumber: 12 });
    expect(parseOcrText('Picsou Magazine nº 300')).toMatchObject({ issueNumber: 300 });
    expect(parseOcrText('Picsou Magazine numéro 12')).toMatchObject({ issueNumber: 12 });
    expect(parseOcrText('Picsou Magazine issue 7')).toMatchObject({ issueNumber: 7 });
  });

  it('calcule une confiance partielle (publication sans numéro)', () => {
    const result = parseOcrText('Picsou Magazine');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.confidence).toBeCloseTo(0.4);
      expect(result.issueNumber).toBeNull();
    }
  });

  it('retourne une publication inconnue si le texte est lisible mais non reconnu', () => {
    const result = parseOcrText('La Gazette du Village n° 3');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.publication).toBe('Publication inconnue');
      expect(result.issueNumber).toBe(3);
      expect(result.confidence).toBeCloseTo(0.4);
    }
  });

  it('privilégie l’alias le plus long (Super Picsou Géant vs Picsou)', () => {
    const result = parseOcrText('SUPER PICSOU GEANT n° 45');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.publication).toBe('Super Picsou Géant');
    }
  });
});

describe('isConfident', () => {
  it('est vrai à partir du seuil MIN_CONFIDENCE', () => {
    const weak = parseOcrText('Picsou Magazine');
    const strong = parseOcrText('Picsou Magazine N° 1');

    expect(MIN_CONFIDENCE).toBe(0.5);
    if (weak.status === 'parsed') {
      expect(weak.confidence).toBeLessThan(MIN_CONFIDENCE);
      expect(isConfident(weak)).toBe(false);
    }
    if (strong.status === 'parsed') {
      expect(isConfident(strong)).toBe(true);
    }
  });
});
