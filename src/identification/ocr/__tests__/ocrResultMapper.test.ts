import { mapRecognitionResult } from '@/identification/ocr/ocrResultMapper';
import type { RecognitionResult } from 'expo-mlkit-ocr';

function makeResult(
  lines: { text?: string; box?: { x: number; y: number; width: number; height: number } }[],
): RecognitionResult {
  return {
    text: lines.map((l) => l.text ?? '').join('\n'),
    blocks: [
      {
        text: lines.map((l) => l.text ?? '').join('\n'),
        boundingBox: { x: 0, y: 0, width: 1000, height: 1400 },
        lines: lines.map((l) => ({
          text: l.text ?? '',
          boundingBox: l.box ?? { x: 0, y: 0, width: 10, height: 10 },
          elements: [],
        })),
      },
    ],
  };
}

describe('mapRecognitionResult (M-12, US-OCR-02)', () => {
  it('retourne null pour un résultat null ou vide', () => {
    expect(mapRecognitionResult(null)).toBeNull();
    expect(mapRecognitionResult(makeResult([{ text: '   ' }]))).toBeNull();
  });

  it('produit une zone par ligne avec sa bounding box (niveau ligne)', () => {
    const result = mapRecognitionResult(
      makeResult([
        { text: 'Picsou Magazine', box: { x: 40, y: 60, width: 500, height: 40 } },
        { text: 'N° 547', box: { x: 50, y: 110, width: 200, height: 30 } },
      ]),
    );

    expect(result).not.toBeNull();
    if (!result) {
      return;
    }
    expect(result.text).toBe('Picsou Magazine\nN° 547');
    expect(result.zones).toHaveLength(2);
    expect(result.zones[0]).toEqual({
      id: 'b0-l0',
      text: 'Picsou Magazine',
      boundingBox: { x: 40, y: 60, width: 500, height: 40 },
    });
    expect(result.zones[1]).toEqual({
      id: 'b0-l1',
      text: 'N° 547',
      boundingBox: { x: 50, y: 110, width: 200, height: 30 },
    });
  });

  it('ignore les lignes vides ou sans bounding box exploitable', () => {
    const result = mapRecognitionResult(
      makeResult([
        { text: '   ' },
        { text: 'Picsou Magazine', box: { x: 0, y: 0, width: 0, height: 40 } },
        { text: 'N° 547', box: { x: 10, y: 10, width: 100, height: 30 } },
      ]),
    );

    expect(result).not.toBeNull();
    if (!result) {
      return;
    }
    expect(result.zones).toHaveLength(1);
    expect(result.zones[0].text).toBe('N° 547');
  });
});
