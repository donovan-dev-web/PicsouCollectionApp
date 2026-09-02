import {
  IdentificationService,
  type BarcodeRepository,
} from '@/identification/identificationService';
import type { Magazine } from '@/types';

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'mag-1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    country: 'FR',
    publicationDate: '2023-03',
    barcode: '5901234123457',
    notes: null,
    ocrText: null,
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    ...overrides,
  };
}

function makeRepository(find: (barcode: string) => Promise<Magazine | null>): BarcodeRepository {
  return { findByBarcode: find };
}

describe('IdentificationService.identifyByBarcode', () => {
  it('retourne found avec une édition pour un code connu', async () => {
    const magazine = makeMagazine();
    const service = new IdentificationService(makeRepository(async () => magazine));

    const result = await service.identifyByBarcode('5901234123457');

    expect(result).toEqual({ status: 'found', magazine });
  });

  it('retourne unknown pour un code valide mais absent de la base', async () => {
    const service = new IdentificationService(makeRepository(async () => null));

    const result = await service.identifyByBarcode('9780306406157');

    expect(result).toEqual({ status: 'unknown' });
  });

  it('retourne invalid pour un code mal formé sans interroger la base', async () => {
    const find = jest.fn(async () => null);
    const service = new IdentificationService(makeRepository(find));

    const result = await service.identifyByBarcode('123');

    expect(result.status).toBe('invalid');
    expect(find).not.toHaveBeenCalled();
  });

  it('normalise le code avant la recherche (espaces/tirets)', async () => {
    const find = jest.fn(async () => makeMagazine());
    const service = new IdentificationService(makeRepository(find));

    await service.identifyByBarcode('5901-2341-2345-7');

    expect(find).toHaveBeenCalledWith('5901234123457');
  });
});
