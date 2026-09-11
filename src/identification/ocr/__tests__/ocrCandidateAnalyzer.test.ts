import { analyzeOcrFrame, extractFieldValue } from '@/identification/ocr/ocrCandidateAnalyzer';
import { AUTO_PROPOSE_THRESHOLD, buildOcrProposals } from '@/identification/ocr/ocrProposals';
import type { OcrTextZone } from '@/identification/ocr/ocrTypes';

function zone(id: string, text: string, y = 10): OcrTextZone {
  return { id, text, boundingBox: { x: 10, y, width: 200, height: 30 } };
}

function frame(zones: OcrTextZone[], text?: string) {
  return {
    text: text ?? zones.map((z) => z.text).join('\n'),
    zones,
  };
}

describe('analyzeOcrFrame — candidats titre (M-12, US-OCR-03)', () => {
  it('reconnaît un titre de la liste des publications (canonique)', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'PICSOU MAGAZINE N° 547')]));
    const candidates = analysis.candidates.title ?? [];
    expect(candidates[0].value).toBe('Picsou Magazine');
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(0.9);
  });

  it('privilégie l’alias le plus long (Super Picsou Géant vs Picsou)', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'SUPER PICSOU GEANT')]));
    const best = analysis.candidates.title?.[0];
    expect(best?.value).toBe('Super Picsou Géant');
  });

  it('propose un texte lisible non reconnu avec une confiance faible', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'La Gazette du Quartier')]));
    const best = analysis.candidates.title?.[0];
    expect(best?.value).toBe('La Gazette du Quartier');
    expect(best?.confidence).toBeLessThan(AUTO_PROPOSE_THRESHOLD);
  });
});

describe('analyzeOcrFrame — règles de discrimination des nombres (M12-08)', () => {
  it('ne retient jamais un nombre de pages comme numéro', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('t', 'Picsou Magazine'), zone('p', '52 pages'), zone('n', 'N° 547')]),
    );
    const candidates = analysis.candidates.issueNumber ?? [];
    expect(candidates.map((c) => c.value)).toEqual(['547']);
  });

  it('ne retient jamais un prix comme numéro', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('t', 'Picsou Magazine'), zone('eur', '3,50 €'), zone('n', 'N° 547')]),
    );
    const candidates = analysis.candidates.issueNumber ?? [];
    expect(candidates.map((c) => c.value)).toEqual(['547']);
  });

  it('ne retient jamais une année comme numéro', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('t', 'Picsou Magazine'), zone('a', '2024'), zone('n', 'N° 547')]),
    );
    const candidates = analysis.candidates.issueNumber ?? [];
    expect(candidates.map((c) => c.value)).toEqual(['547']);
  });

  it('extrait l’année d’une date mois-année et la garde comme candidat année', () => {
    const analysis = analyzeOcrFrame(frame([zone('t', 'Picsou Magazine'), zone('d', 'Mars 2023')]));
    const years = analysis.candidates.year ?? [];
    expect(years[0]?.value).toBe('2023');
    expect(years[0]?.confidence).toBeGreaterThanOrEqual(0.9);
    expect(analysis.candidates.issueNumber ?? []).toHaveLength(0);
  });

  it('retient le préfixe N°/TOME 12 comme numéro', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('t', 'Picsou Magazine'), zone('tome', 'TOME 12'), zone('n', 'N° 125')]),
    );
    const candidates = analysis.candidates.issueNumber ?? [];
    expect(candidates[0].value).toBe('125');
    expect(candidates[0].confidence).toBeGreaterThanOrEqual(0.9);
  });
});

describe('analyzeOcrFrame — matrices M12-08 (jeu de test réel)', () => {
  const cases: {
    name: string;
    zones: OcrTextZone[];
    expectPublication?: string;
    expectIssue?: string;
  }[] = [
    {
      name: 'lecture propre',
      zones: [zone('t', 'Picsou Magazine', 20), zone('n', 'N° 547', 60)],
      expectPublication: 'Picsou Magazine',
      expectIssue: '547',
    },
    {
      name: 'pages et prix parasites',
      zones: [
        zone('t', 'Picsou Magazine', 20),
        zone('p', '52 pages', 90),
        zone('eur', '3,50 €', 120),
        zone('n', 'N° 547', 60),
      ],
      expectPublication: 'Picsou Magazine',
      expectIssue: '547',
    },
    {
      name: 'année seule lue, pas de numéro',
      zones: [zone('t', 'Picsou Magazine', 20), zone('a', '2024', 140)],
      expectPublication: 'Picsou Magazine',
    },
  ];

  for (const c of cases) {
    it(c.name, () => {
      const analysis = analyzeOcrFrame(frame(c.zones));
      expect(analysis.candidates.title?.[0]?.value).toBe(c.expectPublication);
      const issues = analysis.candidates.issueNumber ?? [];
      if (c.expectIssue !== undefined) {
        expect(issues[0]).toBeDefined();
        expect(issues[0].value).toBe(c.expectIssue);
      } else {
        expect(issues.length).toBe(0);
      }
    });
  }

  it('conserve le texte brut intégral', () => {
    const analysis = analyzeOcrFrame(frame([zone('t', 'Picsou Magazine')]));
    expect(analysis.rawText).toBe('Picsou Magazine');
  });

  it('ne plante pas quand la frame est nulle ou vide', () => {
    expect(analyzeOcrFrame(null).candidates).toEqual({
      title: [],
      issueNumber: [],
      year: [],
    });
    expect(analyzeOcrFrame({ text: '', zones: [] }).candidates.title).toEqual([]);
  });

  it('classe un nombre isolé comme numéro sous le seuil (repli bare)', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'Picsou Magazine'), zone('b', '547')]));
    const best = analysis.candidates.issueNumber?.[0];
    expect(best?.value).toBe('547');
    expect(best?.confidence).toBe(0.55);
    expect(buildOcrProposals(analysis).issueNumber.kind).toBe('select');
  });

  it('ignore les zones trop courtes pour le titre', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'Picsou Magazine'), zone('b', 'OK')]));
    expect(analysis.candidates.title?.map((c) => c.value)).toEqual(['Picsou Magazine']);
  });

  it('extrait l’année enfouie dans une ligne de texte (© Disney 2026)', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('a', 'Picsou Magazine'), zone('b', '© Disney 2026')]),
    );
    const years = analysis.candidates.year ?? [];
    expect(years[0]?.value).toBe('2026');
    expect(years[0]?.confidence).toBe(0.6);
  });

  it('dédoublonne les valeurs identiques (deux lectures du même numéro)', () => {
    const analysis = analyzeOcrFrame(frame([zone('a', 'N° 547'), zone('b', 'N° 547')]));
    expect(analysis.candidates.issueNumber?.map((c) => c.value)).toEqual(['547']);
  });

  it('borne le nombre de candidats à 3 (top)', () => {
    const analysis = analyzeOcrFrame(
      frame([
        zone('a', 'Publication Alpha'),
        zone('b', 'Publication Beta'),
        zone('c', 'Publication Gamma'),
        zone('d', 'Publication Delta'),
      ]),
    );
    expect(analysis.candidates.title?.length).toBeLessThanOrEqual(3);
  });

  it('préfère la date mois-année (confiance 0.92) sur l’année isolée (0.75)', () => {
    const analysis = analyzeOcrFrame(
      frame([zone('a', 'Picsou Magazine'), zone('d', 'Mars 2023'), zone('y', '2023')]),
    );
    const years = analysis.candidates.year ?? [];
    expect(years[0]?.value).toBe('2023');
    expect(years[0]?.confidence).toBe(0.92);
  });
});

describe('extractFieldValue — sélection zone→champ (M-12, US-OCR-06)', () => {
  it('extrait un numéro préfixé', () => {
    expect(extractFieldValue('issueNumber', 'N° 547')).toBe('547');
    expect(extractFieldValue('issueNumber', 'TOME 12')).toBe('12');
  });

  it('refuse une année comme numéro isolé', () => {
    expect(extractFieldValue('issueNumber', '2024')).toBeNull();
  });

  it('extrait le titre canonique ou le texte lisible', () => {
    expect(extractFieldValue('title', 'PICSOU MAGAZINE')).toBe('Picsou Magazine');
    expect(extractFieldValue('title', 'La Gazette du Quartier')).toBe('La Gazette du Quartier');
  });

  it('extrait l’année enfouie dans une ligne', () => {
    expect(extractFieldValue('year', '© Disney 2026')).toBe('2026');
    expect(extractFieldValue('year', 'Mars 2023')).toBe('2023');
  });

  it('retourne null pour un contenu exploitable pour le numéro (aucun chiffre)', () => {
    expect(extractFieldValue('issueNumber', 'Couverture seulement')).toBeNull();
  });

  it('refuse un numéro nul ou vide', () => {
    expect(extractFieldValue('issueNumber', '0')).toBeNull();
    expect(extractFieldValue('title', 'OK')).toBeNull();
  });
});
