import {
  clearPendingOcrReview,
  consumePendingOcrReview,
  setPendingOcrReview,
} from '@/lib/ocr-pending';
import type { OcrProposals } from '@/identification/ocr/ocrProposals';
import type { OcrTextZone } from '@/identification/ocr/ocrTypes';

function payload(): Parameters<typeof setPendingOcrReview>[0] {
  const zones: OcrTextZone[] = [
    { id: 'b0-l0', text: 'Picsou Magazine', boundingBox: { x: 0, y: 0, width: 100, height: 20 } },
  ];
  return {
    uri: 'file:///tmp/c.jpg',
    width: 1000,
    height: 1400,
    zones,
    analysis: { rawText: 'Picsou Magazine', candidates: { title: [], issueNumber: [], year: [] } },
    proposals: {
      title: { kind: 'none' },
      issueNumber: { kind: 'none' },
      year: { kind: 'none' },
    } as OcrProposals,
  };
}

describe('ocr-pending — payload de revue photo (M-12, US-OCR-05)', () => {
  it('ne livre rien tant que rien n’est en attente', () => {
    clearPendingOcrReview();
    expect(consumePendingOcrReview()).toBeNull();
  });

  it('livre une seule fois le payload en attente (lecture unique)', () => {
    clearPendingOcrReview();
    const stored = payload();

    setPendingOcrReview(stored);
    expect(consumePendingOcrReview()).toEqual(stored);
    expect(consumePendingOcrReview()).toBeNull();
  });

  it('purge sans consommation', () => {
    clearPendingOcrReview();
    setPendingOcrReview(payload());

    clearPendingOcrReview();
    expect(consumePendingOcrReview()).toBeNull();
  });
});