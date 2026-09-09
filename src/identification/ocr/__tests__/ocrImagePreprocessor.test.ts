import {
  ExpoImagePreprocessor,
  NoopImagePreprocessor,
  planOcrResize,
  OCR_MAX_DIMENSION,
  OCR_OUTPUT_QUALITY,
} from '@/identification/ocr/ocrImagePreprocessor';

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { manipulateAsync } = require('expo-image-manipulator') as {
  manipulateAsync: jest.Mock;
};

describe('planOcrResize (M-12, US-OCR-01) — paramètres de prétraitement', () => {
  it('expose une dimension max et une qualité d’encodage', () => {
    expect(OCR_MAX_DIMENSION).toBeGreaterThan(0);
    expect(OCR_OUTPUT_QUALITY).toBeGreaterThan(0);
    expect(OCR_OUTPUT_QUALITY).toBeLessThanOrEqual(1);
  });

  it('ne redimensionne pas une image déjà plus petite que la limite', () => {
    expect(planOcrResize(1200, 800)).toBeNull();
  });

  it('redimensionne une grande image en gardant le ratio', () => {
    const plan = planOcrResize(4000, 3000);
    expect(plan).not.toBeNull();
    if (!plan) {
      return;
    }
    expect(plan.width).toBeCloseTo(OCR_MAX_DIMENSION);
    expect(plan.height / plan.width).toBeCloseTo(3000 / 4000);
  });

  it('borne la plus grande dimension à la limite', () => {
    const plan = planOcrResize(2000, 6000);
    expect(plan).not.toBeNull();
    if (!plan) {
      return;
    }
    expect(plan.height).toBeCloseTo(OCR_MAX_DIMENSION);
    expect(plan.width).toBeLessThan(OCR_MAX_DIMENSION);
  });

  it('retourne null pour des dimensions invalides', () => {
    expect(planOcrResize(0, 0)).toBeNull();
    expect(planOcrResize(-5, 100)).toBeNull();
  });
});

describe('ExpoImagePreprocessor — prétraitement natif (M12-01)', () => {
  const processor = new ExpoImagePreprocessor();

  beforeEach(() => {
    manipulateAsync.mockReset();
  });

  it('ré-encode en JPEG via manipulateAsync et renvoie la nouvelle URI', async () => {
    manipulateAsync.mockResolvedValue({ uri: 'file:///tmp/processed.jpg' });

    const result = await processor.preprocess({ uri: 'file:///tmp/raw.jpg', width: 1000, height: 1400 });

    expect(result).toBe('file:///tmp/processed.jpg');
    expect(manipulateAsync).toHaveBeenCalledWith('file:///tmp/raw.jpg', [], {
      compress: OCR_OUTPUT_QUALITY,
      format: 'jpeg',
    });
  });

  it('redimensionne une grande photo avant l’appel', async () => {
    manipulateAsync.mockResolvedValue({ uri: 'file:///tmp/processed.jpg' });

    await processor.preprocess({ uri: 'file:///tmp/raw.jpg', width: 4000, height: 3000 });

    expect(manipulateAsync).toHaveBeenCalledWith(
      'file:///tmp/raw.jpg',
      [{ resize: { width: expect.any(Number), height: expect.any(Number) } }],
      { compress: OCR_OUTPUT_QUALITY, format: 'jpeg' },
    );
  });

  it('retombe sur null si la manipulation échoue (image d’origine)', async () => {
    manipulateAsync.mockRejectedValue(new Error('module natif absent'));

    await expect(processor.preprocess({ uri: 'file:///x.jpg', width: 10, height: 10 })).resolves.toBeNull();
  });

  it('n’appelle rien pour une URI vide', async () => {
    await expect(processor.preprocess({ uri: '', width: 10, height: 10 })).resolves.toBeNull();
    expect(manipulateAsync).not.toHaveBeenCalled();
  });
});

describe('NoopImagePreprocessor — repli CI-safe', () => {
  const processor = new NoopImagePreprocessor();

  it('renvoie l’URI inchangée', async () => {
    await expect(
      processor.preprocess({ uri: 'file:///x.jpg', width: 100, height: 100 }),
    ).resolves.toBe('file:///x.jpg');
  });

  it('renvoie null quand l’URI est vide', async () => {
    await expect(processor.preprocess({ uri: '', width: 100, height: 100 })).resolves.toBeNull();
  });
});