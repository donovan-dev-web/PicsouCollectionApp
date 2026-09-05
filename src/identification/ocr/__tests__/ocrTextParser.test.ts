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

  it('reconnaît un numéro lu seul sur une ligne (bug #127)', () => {
    expect(parseOcrText('Picsou Magazine\n547')).toMatchObject({ issueNumber: 547 });
    expect(parseOcrText('Picsou Magazine\n12')).toMatchObject({ issueNumber: 12 });
  });

  it('ne confond pas une année avec un numéro (bug #127)', () => {
    const result = parseOcrText('Picsou Magazine\n2023');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.issueNumber).toBeNull();
      expect(result.date).toBe('2023');
    }
  });

  it('ne retient pas un code-barres en clair comme numéro (bug #127)', () => {
    const result = parseOcrText('Picsou Magazine\n3271234567890');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.issueNumber).toBeNull();
    }
  });

  it('calcule une confiance avec les nouveaux poids M-07R (publication seule = 0.5)', () => {
    const result = parseOcrText('Picsou Magazine');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.confidence).toBeCloseTo(0.5);
      expect(result.issueNumber).toBeNull();
    }
  });

  it('retourne une confiance élevée quand publication + numéro sont lus', () => {
    const result = parseOcrText('Picsou Magazine\n547');

    expect(result.status).toBe('parsed');
    if (result.status === 'parsed') {
      expect(result.confidence).toBeCloseTo(0.9);
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
  it('exige nom + numéro pour déclencher la recherche (US-ID-08)', () => {
    const publicationOnly = parseOcrText('Picsou Magazine');
    const numberOnly = parseOcrText('547');
    const complete = parseOcrText('Picsou Magazine\nN° 547');
    const unknown = parseOcrText('La Gazette n° 3');

    if (publicationOnly.status === 'parsed') {
      expect(isConfident(publicationOnly)).toBe(false);
    }
    if (numberOnly.status === 'parsed') {
      expect(isConfident(numberOnly)).toBe(false);
    }
    if (unknown.status === 'parsed') {
      expect(isConfident(unknown)).toBe(false);
    }
    if (complete.status === 'parsed') {
      expect(isConfident(complete)).toBe(true);
    }
  });

  it('le seuil MIN_CONFIDENCE reste disponible pour l’étiquette', () => {
    expect(MIN_CONFIDENCE).toBe(0.5);
  });
});
