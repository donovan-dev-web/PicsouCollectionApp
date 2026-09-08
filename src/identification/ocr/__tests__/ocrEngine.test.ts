import { NoopOcrEngine } from '@/identification/ocr/ocrEngine';
import type { OcrFrame } from '@/identification/ocr/ocrTypes';

describe('NoopOcrEngine', () => {
  it('ne reconnaît jamais de texte (moteur par défaut conservateur)', async () => {
    const frame: OcrFrame = { native: null, width: 640, height: 480 };

    await expect(new NoopOcrEngine().recognize(frame)).resolves.toBeNull();
  });
});
