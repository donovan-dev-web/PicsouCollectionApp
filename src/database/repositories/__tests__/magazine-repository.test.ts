import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { MagazineRepository } from '@/database/repositories/magazine-repository';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'b1a2c3d4-0000-4000-8000-000000000001'),
}));

let testDb: ReturnType<typeof createTestDatabase>;
let repo: MagazineRepository;

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  repo = new MagazineRepository(testDb);
});

afterEach(async () => {
  await testDb.close();
});

describe('magazineRepository.create', () => {
  it('cree une edition complete avec UUID et dates', async () => {
    const magazine = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
      country: 'FR',
      publicationDate: '2023-03',
      barcode: '3271234567890',
      notes: 'Mention bimestriel',
    });

    expect(magazine).toMatchObject({
      id: 'b1a2c3d4-0000-4000-8000-000000000001',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
      country: 'FR',
      publicationDate: '2023-03',
      barcode: '3271234567890',
      notes: 'Mention bimestriel',
      ocrText: null,
    });
    expect(magazine.createdAt).toBeTruthy();
    expect(magazine.updatedAt).toBeTruthy();

    const row = await testDb.getFirstAsync<{ publication: string; issue_number: number }>(
      'SELECT publication, issue_number FROM magazines WHERE id = ?',
      magazine.id,
    );
    expect(row?.publication).toBe('Picsou Magazine');
    expect(row?.issue_number).toBe(547);
  });

  it('autorise un magazine sans numero (hors-serie)', async () => {
    const magazine = await repo.create({ publication: 'Super Picsou Géant Hors-Série' });

    expect(magazine.issueNumber).toBeNull();
    const row = await testDb.getFirstAsync<{ issue_number: number | null }>(
      'SELECT issue_number FROM magazines WHERE id = ?',
      magazine.id,
    );
    expect(row?.issue_number).toBeNull();
  });

  it('refuse une publication vide', async () => {
    await expect(repo.create({ publication: '   ' })).rejects.toThrow(
      'La publication est obligatoire.',
    );
  });

  it('accepte un code-barres null (ancien magazine)', async () => {
    const magazine = await repo.create({ publication: 'Mickey Parade', country: 'FR' });

    expect(magazine.barcode).toBeNull();
  });
});

describe('magazineRepository.findByBarcode', () => {
  it('retrouve ledition depuis un code-barres connu', async () => {
    const created = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      country: 'FR',
      barcode: '3271234567890',
    });

    const found = await repo.findByBarcode('3271234567890');

    expect(found).toEqual(
      expect.objectContaining({
        id: created.id,
        publication: 'Picsou Magazine',
        issueNumber: 547,
        country: 'FR',
        barcode: '3271234567890',
        notes: null,
        ocrText: null,
      }),
    );
  });

  it('renvoie null pour un code-barres inconnu', async () => {
    const found = await repo.findByBarcode('9999999999999');

    expect(found).toBeNull();
  });

  it('ne charge pas les champs lourds notes/ocr_text', async () => {
    await repo.create({
      publication: 'Super Picsou Géant',
      issueNumber: 30,
      notes: 'coffret specifique',
      ocrText: 'Super Picsou Géant n°30',
      barcode: '3271234000011',
    });

    const found = await repo.findByBarcode('3271234000011');

    expect(found?.notes).toBeNull();
    expect(found?.ocrText).toBeNull();
  });
});
