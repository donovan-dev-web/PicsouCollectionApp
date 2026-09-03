import {
  IdentificationService,
  type BarcodeRepository,
} from '@/identification/identificationService';
import type { Magazine, MagazineListItem } from '@/types';

function makeMagazine(overrides: Partial<Magazine> = {}): Magazine {
  return {
    id: 'mag-1',
    publication: 'Picsou Magazine',
    issueNumber: 547,
    edition: 'standard',
    language: 'FR',
    condition: null,
    publicationDate: '2023-03',
    barcode: '5901234123457',
    notes: null,
    ocrText: null,
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
    ...overrides,
  };
}

function asListItem(magazine: Magazine, quantity = 0): MagazineListItem {
  return { ...magazine, quantity };
}

function makeRepository(find: (barcode: string) => Promise<MagazineListItem[]>): BarcodeRepository {
  return { findManyByBarcode: find };
}

describe('IdentificationService.identifyByBarcode', () => {
  it('retourne found avec une édition pour un code correspondant à une unique édition', async () => {
    const magazine = asListItem(makeMagazine());
    const service = new IdentificationService(makeRepository(async () => [magazine]));

    const result = await service.identifyByBarcode('5901234123457');

    expect(result).toEqual({ status: 'found', magazine });
  });

  it('retourne ambiguous pour un code correspondant à plusieurs éditions', async () => {
    const first = asListItem(makeMagazine({ id: 'mag-1', issueNumber: 547 }));
    const second = asListItem(makeMagazine({ id: 'mag-2', issueNumber: 548 }));
    const service = new IdentificationService(makeRepository(async () => [first, second]));

    const result = await service.identifyByBarcode('5901234123457');

    expect(result).toEqual({
      status: 'ambiguous',
      magazines: [first, second],
    });
  });

  it('retourne unknown pour un code valide mais absent de la base', async () => {
    const service = new IdentificationService(makeRepository(async () => []));

    const result = await service.identifyByBarcode('9780306406157');

    expect(result).toEqual({ status: 'unknown' });
  });

  it('retourne invalid pour un code mal formé sans interroger la base', async () => {
    const find = jest.fn(async (): Promise<MagazineListItem[]> => []);
    const service = new IdentificationService(makeRepository(find));

    const result = await service.identifyByBarcode('123');

    expect(result.status).toBe('invalid');
    expect(find).not.toHaveBeenCalled();
  });

  it('normalise le code avant la recherche (espaces/tirets)', async () => {
    const find = jest.fn(async () => [asListItem(makeMagazine())]);
    const service = new IdentificationService(makeRepository(find));

    await service.identifyByBarcode('5901-2341-2345-7');

    expect(find).toHaveBeenCalledWith('5901234123457');
  });
});
