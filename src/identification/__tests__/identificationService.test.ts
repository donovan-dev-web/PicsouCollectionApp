import {
  IdentificationService,
  type IdentificationRepository,
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

function makeRepository(
  find: (barcode: string) => Promise<MagazineListItem[]>,
  findByPublicationAndIssue?: IdentificationRepository['findByPublicationAndIssue'],
): IdentificationRepository {
  return {
    findManyByBarcode: find,
    findByPublicationAndIssue:
      findByPublicationAndIssue ?? jest.fn(async () => null as unknown as Promise<Magazine | null>),
  };
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

describe('IdentificationService.identifyByOCR', () => {
  it('retourne no-text pour un texte vide ou illisible', async () => {
    const service = new IdentificationService(makeRepository(jest.fn(async () => [])));

    expect(await service.identifyByOCR('')).toEqual({ status: 'no-text' });
    expect(await service.identifyByOCR('  x  ')).toEqual({ status: 'no-text' });
  });

  it('retourne weak si seuls publication est détectée (règle nom + numéro)', async () => {
    const findByPublicationAndIssue = jest.fn(async () => null as unknown as Magazine | null);
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        findByPublicationAndIssue,
      ),
    );

    const result = await service.identifyByOCR('Picsou Magazine');

    expect(result.status).toBe('weak');
    expect(findByPublicationAndIssue).not.toHaveBeenCalled();
    if (result.status === 'weak') {
      expect(result.confidence).toBe(0.5);
      expect(result.publication).toBe('Picsou Magazine');
      expect(result.issueNumber).toBeNull();
    }
  });

  it('retourne found avec le magazine quand publication+numéro correspondent', async () => {
    const magazine = makeMagazine({ id: 'mag-547', issueNumber: 547 });
    const findByPublicationAndIssue = jest.fn(async () => magazine);
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        findByPublicationAndIssue,
      ),
    );

    const result = await service.identifyByOCR('Picsou Magazine\nN° 547\n2023');

    expect(result.status).toBe('found');
    if (result.status === 'found') {
      expect(result.magazine).toEqual(magazine);
      expect(result.publication).toBe('Picsou Magazine');
      expect(result.issueNumber).toBe(547);
      expect(result.date).toBe('2023');
      expect(result.confidence).toBe(1);
    }
    expect(findByPublicationAndIssue).toHaveBeenCalledWith('Picsou Magazine', 547);
  });

  it('retourne unknown si confiance suffisante mais aucune édition en base', async () => {
    const findByPublicationAndIssue = jest.fn(async () => null as unknown as Magazine | null);
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        findByPublicationAndIssue,
      ),
    );

    const result = await service.identifyByOCR('Picsou Magazine\nN° 547');

    expect(result.status).toBe('unknown');
    if (result.status === 'unknown') {
      expect(result.publication).toBe('Picsou Magazine');
      expect(result.issueNumber).toBe(547);
    }
  });

  it('accepte un résultat déjà parsé (confort de test)', async () => {
    const magazine = makeMagazine({ id: 'mag-547', issueNumber: 547 });
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        jest.fn(async () => magazine),
      ),
    );

    const result = await service.identifyByOCR({
      status: 'parsed',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      date: '2023',
      confidence: 1,
    });

    expect(result.status).toBe('found');
  });

  it('ne recherche pas si le numéro seul est détecté (règle nom + numéro)', async () => {
    const findByPublicationAndIssue = jest.fn(async () => null as unknown as Magazine | null);
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        findByPublicationAndIssue,
      ),
    );

    const result = await service.identifyByOCR('547');

    expect(result.status).toBe('weak');
    expect(findByPublicationAndIssue).not.toHaveBeenCalled();
  });
});

describe('IdentificationService.searchByOcrFields (US-ID-09 — outrepasser la confiance)', () => {
  it('retourne found quand nom + numéro corresponden à une édition', async () => {
    const magazine = makeMagazine({ id: 'mag-547', issueNumber: 547 });
    const findByPublicationAndIssue = jest.fn(async () => magazine);
    const service = new IdentificationService(
      makeRepository(jest.fn(async () => []), findByPublicationAndIssue),
    );

    const result = await service.searchByOcrFields('Picsou Magazine', 547, '2023');

    expect(result.status).toBe('found');
    if (result.status === 'found') {
      expect(result.magazine).toEqual(magazine);
      expect(result.confidence).toBe(1);
    }
    expect(findByPublicationAndIssue).toHaveBeenCalledWith('Picsou Magazine', 547);
  });

  it('retourne unknown quand aucune édition ne correspond', async () => {
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        jest.fn(async () => null as unknown as Magazine | null),
      ),
    );

    const result = await service.searchByOcrFields('Picsou Magazine', 900, null);

    expect(result.status).toBe('unknown');
  });

  it('retourne weak si nom ou numéro manquent (complétion manuelle nécessaire)', async () => {
    const findByPublicationAndIssue = jest.fn(async () => null as unknown as Magazine | null);
    const service = new IdentificationService(
      makeRepository(
        jest.fn(async () => []),
        findByPublicationAndIssue,
      ),
    );

    const noNumber = await service.searchByOcrFields('Picsou Magazine', null, null);
    const noName = await service.searchByOcrFields('Publication inconnue', 5, null);

    expect(noNumber.status).toBe('weak');
    expect(noName.status).toBe('weak');
    expect(findByPublicationAndIssue).not.toHaveBeenCalled();
  });
});
