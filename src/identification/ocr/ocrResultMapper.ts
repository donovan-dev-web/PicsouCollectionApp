import type { RecognitionResult } from 'expo-mlkit-ocr';

import type { OcrFrameResult, OcrTextZone } from './ocrTypes';

/**
 * Mapping pur des données ML Kit (`RecognitionResult`) vers le résultat de
 * l'application (M-12, US-OCR-02).
 *
 * Granularité retenue : le **niveau ligne** (`TextLine`) — assez précis pour
 * pointer une information sur la photo sans produire des centaines de zones.
 * Chaque ligne devient une `OcrTextZone` avec sa `boundingBox` (exprimée en
 * pixels de l'image d'origine). Ce module est volontairement **pur** (types seuls
 * importés du module natif) pour être testable en isolation.
 */
export function mapRecognitionResult(result: RecognitionResult | null): OcrFrameResult {
  if (!result) {
    return null;
  }
  const text = (result.text ?? '').trim();
  if (text.length === 0) {
    return null;
  }

  const zones: OcrTextZone[] = [];
  for (let b = 0; b < result.blocks.length; b += 1) {
    const block = result.blocks[b];
    for (let l = 0; l < block.lines.length; l += 1) {
      const line = block.lines[l];
      const lineText = (line.text ?? '').trim();
      if (!lineText || !line.boundingBox) {
        continue;
      }
      const { x, y, width, height } = line.boundingBox;
      if (Number.isFinite(x) && Number.isFinite(y) && width > 0 && height > 0) {
        zones.push({
          id: `b${b}-l${l}`,
          text: lineText,
          boundingBox: { x, y, width, height },
        });
      }
    }
  }

  return { text, zones };
}