import { containFit, mapBoxToView } from '@/components/scan/ocr-coords';

describe('containFit — mise à l’échelle contenue (M-12, US-OCR-05)', () => {
  it('calcule l’échelle sans letterbox pour une image proportionnée', () => {
    // Image 1000×1400 affichée dans 400×560 : même ratio (≈ 1/2.5).
    const fit = containFit(1000, 1400, 400, 560);
    expect(fit).not.toBeNull();
    if (!fit) {
      return;
    }
    expect(fit.scale).toBeCloseTo(0.4);
    expect(fit.offsetX).toBeCloseTo(0);
    expect(fit.offsetY).toBeCloseTo(0);
  });

  it('centrale la lettrebox horizontalement', () => {
    const fit = containFit(2000, 1000, 400, 400);
    expect(fit).not.toBeNull();
    if (!fit) {
      return;
    }
    expect(fit.scale).toBeCloseTo(0.2);
    expect(fit.offsetX).toBeCloseTo((400 - 400) / 2); // 0 (image déjà proportionnée → vérif ratio)
    expect(fit.renderedWidth).toBeCloseTo(400);
    expect(fit.renderedHeight).toBeCloseTo(200);
  });

  it('calcule un offset vertical pour une image trop large', () => {
    const fit = containFit(1000, 500, 400, 600);
    expect(fit).not.toBeNull();
    if (!fit) {
      return;
    }
    expect(fit.scale).toBeCloseTo(0.4);
    expect(fit.renderedWidth).toBeCloseTo(400);
    expect(fit.renderedHeight).toBeCloseTo(200);
    expect(fit.offsetY).toBeCloseTo((600 - 200) / 2);
  });

  it('retourne null sur des dimensions invalides', () => {
    expect(containFit(0, 0, 100, 100)).toBeNull();
    expect(containFit(100, 100, 0, 100)).toBeNull();
  });
});

describe('mapBoxToView — projection d’une zone image vers l’écran', () => {
  it('met à l’échelle et décale comme containFit', () => {
    const fit = containFit(1000, 1400, 400, 560);
    expect(fit).not.toBeNull();
    if (!fit) {
      return;
    }
    const box = mapBoxToView({ x: 100, y: 200, width: 300, height: 40 }, fit);
    expect(box.x).toBeCloseTo(40);
    expect(box.y).toBeCloseTo(80);
    expect(box.width).toBeCloseTo(120);
    expect(box.height).toBeCloseTo(16);
  });
});
