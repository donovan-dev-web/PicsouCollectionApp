import {
  AUTO_PROPOSE_THRESHOLD,
  buildOcrProposals,
  canAutoSearch,
  CONFIDENCE_EQUALITY_MARGIN,
  hasAnyProposal,
} from '@/identification/ocr/ocrProposals';
import type { OcrAnalysis } from '@/identification/ocr/ocrCandidateAnalyzer';

function analysis(partial: Partial<OcrAnalysis['candidates']>): OcrAnalysis {
  return {
    rawText: '',
    candidates: {
      title: [],
      issueNumber: [],
      year: [],
      ...partial,
    },
  };
}

describe('buildOcrProposals (M-12, US-OCR-04)', () => {
  it('propose automatiquement un candidat au-dessus du seuil', () => {
    const proposals = buildOcrProposals(
      analysis({
        title: [{ value: 'Picsou Magazine', confidence: 0.92, zoneIds: ['b0-l0'] }],
        issueNumber: [{ value: '547', confidence: 0.92, zoneIds: ['b0-l1'] }],
      }),
    );

    expect(proposals.title).toEqual({
      kind: 'auto',
      value: 'Picsou Magazine',
      confidence: 0.92,
      zoneIds: ['b0-l0'],
    });
    expect(proposals.issueNumber.kind).toBe('auto');
    expect(canAutoSearch(proposals)).toBe(true);
  });

  it('passe en « select » quand la confiance est sous le seuil', () => {
    const proposals = buildOcrProposals(
      analysis({
        title: [{ value: 'La Gazette', confidence: 0.4, zoneIds: ['b0-l0'] }],
      }),
    );

    expect(proposals.title).toEqual({ kind: 'select' });
  });

  it('passe en « select » quand le 2ᵉ candidat est quasi équivalent (marge d’égalité)', () => {
    const proposals = buildOcrProposals(
      analysis({
        title: [
          { value: 'Picsou Magazine', confidence: 0.95, zoneIds: ['b0-l0'] },
          { value: 'Picsou Mag', confidence: 0.85, zoneIds: ['b0-l1'] },
        ],
      }),
    );

    // 0.95 - 0.85 = 0.10 < CONFIDENCE_EQUALITY_MARGIN → on demande de trancher.
    expect(proposals.title.kind).toBe('select');
  });

  it('reste « auto » si le 2ᵉ candidat est nettement en dessous de la marge', () => {
    const proposals = buildOcrProposals(
      analysis({
        title: [
          { value: 'Picsou Magazine', confidence: 0.95, zoneIds: ['b0-l0'] },
          { value: 'Picsou Mag', confidence: 0.6, zoneIds: ['b0-l1'] },
        ],
      }),
    );

    expect(proposals.title.kind).toBe('auto');
  });

  it('retourne « none » sans candidat', () => {
    const proposals = buildOcrProposals(analysis({}));
    expect(proposals).toEqual({
      title: { kind: 'none' },
      issueNumber: { kind: 'none' },
      year: { kind: 'none' },
    });
    expect(canAutoSearch(proposals)).toBe(false);
    expect(hasAnyProposal(proposals)).toBe(false);
  });

  it('tolère un candidat manquant (clé absente → none)', () => {
    const proposals = buildOcrProposals({ rawText: '', candidates: {} });
    expect(proposals.title.kind).toBe('none');
    expect(proposals.issueNumber.kind).toBe('none');
    expect(proposals.year.kind).toBe('none');
  });

  it('n’est pas « auto » si le titre ou le numéro manque', () => {
    const proposals = buildOcrProposals(
      analysis({
        title: [{ value: 'Picsou Magazine', confidence: 0.92, zoneIds: ['b0-l0'] }],
      }),
    );
    expect(canAutoSearch(proposals)).toBe(false);
    expect(hasAnyProposal(proposals)).toBe(true);
  });

  it('théorème du seuil : 0.7 seul est auto, 0.69 est select', () => {
    const make = (confidence: number) =>
      buildOcrProposals(analysis({ title: [{ value: 'X', confidence, zoneIds: ['z'] }] })).title;
    expect(make(AUTO_PROPOSE_THRESHOLD).kind).toBe('auto');
    expect(make(AUTO_PROPOSE_THRESHOLD - 0.01).kind).toBe('select');
    expect(CONFIDENCE_EQUALITY_MARGIN).toBeGreaterThan(0);
  });
});
