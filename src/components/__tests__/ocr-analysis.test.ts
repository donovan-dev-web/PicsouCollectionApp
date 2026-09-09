import { buildManualParams, confidenceLabel, hasAnyDetected } from '@/components/scan/ocr-analysis';

describe('ocr-analysis (logique pure extraite de camera.tsx)', () => {
  describe('buildManualParams', () => {
    it('remplit publication, numéro et année', () => {
      expect(
        buildManualParams({ publication: 'Picsou Magazine', issueNumber: 547, date: '2023' }),
      ).toEqual({ publication: 'Picsou Magazine', issueNumber: '547', year: '2023' });
    });

    it('ignore les champs absents', () => {
      expect(buildManualParams({})).toEqual({});
      expect(buildManualParams({ publication: null })).toEqual({});
    });

    it('n’ajoute pas issueNumber à 0 ou null', () => {
      expect(buildManualParams({ issueNumber: 0 })).toEqual({ issueNumber: '0' });
      expect(buildManualParams({ issueNumber: null })).toEqual({});
    });
  });

  describe('confidenceLabel', () => {
    it('qualifie les seuils de confiance', () => {
      expect(confidenceLabel(0.9)).toBe('élevée');
      expect(confidenceLabel(0.8)).toBe('élevée');
      expect(confidenceLabel(0.7)).toBe('moyenne');
      expect(confidenceLabel(0.5)).toBe('moyenne');
      expect(confidenceLabel(0.4)).toBe('faible');
    });
  });

  describe('hasAnyDetected', () => {
    it('détecte la présence d’au moins un champ', () => {
      expect(hasAnyDetected({ publication: 'Picsou', issueNumber: null, date: null })).toBe(true);
      expect(hasAnyDetected({ publication: null, issueNumber: 5, date: null })).toBe(true);
      expect(hasAnyDetected({ publication: null, issueNumber: null, date: '2023' })).toBe(true);
      expect(hasAnyDetected({ publication: null, issueNumber: null, date: null })).toBe(false);
    });
  });
});
