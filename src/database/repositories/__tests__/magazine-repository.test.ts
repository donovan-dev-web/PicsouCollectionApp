import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { MagazineRepository } from '@/database/repositories/magazine-repository';

jest.mock('expo-crypto', () => {
  let n = 0;
  return {
    randomUUID: jest.fn(() => {
      n += 1;
      return `b1a2c3d4-0000-4000-8000-${String(n).padStart(12, '0')}`;
    }),
  };
});

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
      language: 'FR',
      publicationDate: '2023-03',
      barcode: '3271234567890',
      notes: 'Mention bimestriel',
    });

    expect(magazine).toMatchObject({
      id: 'b1a2c3d4-0000-4000-8000-000000000001',
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
      language: 'FR',
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
    const magazine = await repo.create({ publication: 'Mickey Parade', language: 'FR' });

    expect(magazine.barcode).toBeNull();
  });

  it('autorise le meme code-barres pour des numeros differents (index non unique)', async () => {
    const first = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      barcode: '3271232567890',
    });
    const second = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 548,
      barcode: '3271232567890',
    });

    expect(first.issueNumber).toBe(547);
    expect(second.issueNumber).toBe(548);
    const rows = await testDb.getAllAsync<{ id: string; issue_number: number }>(
      'SELECT id, issue_number FROM magazines WHERE barcode = ? ORDER BY issue_number',
      '3271232567890',
    );
    expect(rows.map((r) => r.issue_number)).toEqual([547, 548]);
  });
});

describe('magazineRepository.findByBarcode', () => {
  it('retrouve ledition depuis un code-barres connu', async () => {
    const created = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      language: 'FR',
      barcode: '3271234567890',
    });

    const found = await repo.findByBarcode('3271234567890');

    expect(found).toEqual(
      expect.objectContaining({
        id: created.id,
        publication: 'Picsou Magazine',
        issueNumber: 547,
        language: 'FR',
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

describe('magazineRepository.findManyByBarcode', () => {
  it('retourne toutes les editions partageant le meme code-barres', async () => {
    const first = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      barcode: '3271232567890',
    });
    const second = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 548,
      barcode: '3271232567890',
    });

    const result = await repo.findManyByBarcode('3271232567890');

    expect(result.map((m) => m.issueNumber)).toEqual([547, 548]);
    expect(result.map((m) => m.id)).toEqual([first.id, second.id]);
  });

  it('compte les exemplaires possedes pour chaque edition', async () => {
    const mag = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      barcode: '3271232567890',
    });
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c1',
      mag.id,
      '2026-09-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c2',
      mag.id,
      '2026-09-01T10:00:00Z',
    );

    const result = await repo.findManyByBarcode('3271232567890');

    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe(2);
  });

  it('retourne une liste vide pour un code-barres inconnu', async () => {
    const result = await repo.findManyByBarcode('9999999999999');

    expect(result).toEqual([]);
  });
});

describe('magazineRepository.findByPublicationAndIssue', () => {
  it('retrouve une édition par publication + numéro', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 548 });

    const result = await repo.findByPublicationAndIssue('Picsou Magazine', 547);

    expect(result).not.toBeNull();
    expect(result?.issueNumber).toBe(547);
    expect(result?.publication).toBe('Picsou Magazine');
  });

  it('est insensible à la casse sur la publication', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 300 });

    const result = await repo.findByPublicationAndIssue('picsou magazine', 300);

    expect(result?.issueNumber).toBe(300);
  });

  it('renvoie null si le numéro ne correspond pas', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });

    const result = await repo.findByPublicationAndIssue('Picsou Magazine', 999);

    expect(result).toBeNull();
  });

  it('renvoie null si le numéro est absent ou la publication vide', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });

    expect(await repo.findByPublicationAndIssue('Picsou Magazine', null)).toBeNull();
    expect(await repo.findByPublicationAndIssue('  ', 547)).toBeNull();
  });
});

describe('magazineRepository.list', () => {
  it('trie par publication puis numero', async () => {
    await repo.create({ publication: 'Mickey Parade', issueNumber: 2 });
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 100 });
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 20 });
    await repo.create({ publication: 'Mickey Parade', issueNumber: 10 });

    const list = await repo.list();

    expect(list.map((m) => `${m.publication}/${m.issueNumber}`)).toEqual([
      'Mickey Parade/2',
      'Mickey Parade/10',
      'Picsou Magazine/20',
      'Picsou Magazine/100',
    ]);
  });

  it('compte le nombre dexemplaires possedes', async () => {
    const single = await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    const double = await repo.create({ publication: 'Super Picsou Géant', issueNumber: 30 });

    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c1',
      single.id,
      '2026-09-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c2',
      double.id,
      '2026-09-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c3',
      double.id,
      '2026-09-01T10:00:00Z',
    );

    const list = await repo.list();

    const byPublication = new Map(list.map((m) => [m.publication, m]));
    expect(byPublication.get('Picsou Magazine')?.quantity).toBe(1);
    expect(byPublication.get('Super Picsou Géant')?.quantity).toBe(2);
  });

  it('renvoie 0 exemplaire pour une edition non possedee', async () => {
    await repo.create({ publication: 'Mickey Parade', issueNumber: 1 });

    const list = await repo.list();

    expect(list).toHaveLength(1);
    expect(list[0].quantity).toBe(0);
  });

  it('reste leger : ne charge ni notes ni ocr_text', async () => {
    await repo.create({
      publication: 'Mickey Parade',
      issueNumber: 7,
      notes: 'secret',
      ocrText: 'raw',
    });

    const list = await repo.list();

    expect(list[0].notes).toBeNull();
    expect(list[0].ocrText).toBeNull();
  });
});

describe('magazineRepository.search', () => {
  it('filtre par publication (insensible a la casse)', async () => {
    await repo.create({ publication: 'Mickey Parade', issueNumber: 2 });
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 20 });
    await repo.create({ publication: 'Super Picsou Géant', issueNumber: 30 });

    const results = await repo.search('picsou');

    expect(results.map((m) => m.publication)).toEqual(['Picsou Magazine', 'Super Picsou Géant']);
  });

  it('filtre par numero exact', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    await repo.create({ publication: 'Mickey Parade', issueNumber: 547 });
    await repo.create({ publication: 'Super Picsou Géant', issueNumber: 30 });

    const results = await repo.search('547');

    expect(results).toHaveLength(2);
    expect(results.map((m) => m.issueNumber)).toEqual([547, 547]);
  });

  it('retourne la liste complete pour une recherche vide', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    await repo.create({ publication: 'Mickey Parade', issueNumber: 2 });

    const results = await repo.search('  ');

    expect(results).toHaveLength(2);
  });

  it('retourne une liste vide sans correspondance', async () => {
    await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });

    const results = await repo.search('Rienici');

    expect(results).toEqual([]);
  });

  it('calcule la quantite pour chaque resultat', async () => {
    const mag = await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c1',
      mag.id,
      '2026-09-01T10:00:00Z',
    );

    const results = await repo.search('Picsou');

    expect(results[0].quantity).toBe(1);
  });
});

describe('magazineRepository.findById', () => {
  it('charge une edition complete avec ses copies', async () => {
    const mag = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
      language: 'FR',
      condition: 'neuf',
      publicationDate: '2023-03',
      barcode: '3271234567890',
      notes: 'Mention bimestriel',
    });

    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c1',
      mag.id,
      '2026-09-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c2',
      mag.id,
      '2026-09-02T10:00:00Z',
    );

    const detail = await repo.findById(mag.id);

    expect(detail).toMatchObject({
      id: mag.id,
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
      language: 'FR',
      condition: 'neuf',
      barcode: '3271234567890',
      notes: 'Mention bimestriel',
      ocrText: null,
    });
    expect(detail?.copies).toHaveLength(2);
    expect(detail?.copies[0]).toEqual({
      id: 'c2',
      magazineId: mag.id,
      notes: null,
      dateAdded: '2026-09-02T10:00:00Z',
    });
    expect(detail?.copies[1]).toMatchObject({ id: 'c1', notes: null });
  });

  it('renvoie une liste de copies vide pour une edition non possedee', async () => {
    const mag = await repo.create({ publication: 'Mickey Parade', issueNumber: 2 });

    const detail = await repo.findById(mag.id);

    expect(detail).not.toBeNull();
    expect(detail?.copies).toEqual([]);
  });

  it('renvoie null pour un id inconnu', async () => {
    const detail = await repo.findById('nimporte');

    expect(detail).toBeNull();
  });
});

describe('magazineRepository.update', () => {
  it('met a jour les champs modifiables et rafraichit updated_at', async () => {
    const created = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      language: 'FR',
      barcode: '3271234567890',
    });
    const originalUpdatedAt = created.updatedAt;

    await new Promise((resolve) => setTimeout(resolve, 10));

    const updated = await repo.update(created.id, {
      publication: 'Picsou Magazine (Édition Deluxe)',
      issueNumber: 548,
      edition: 'deluxe',
      language: 'FR',
      publicationDate: '2024-01',
      barcode: '3271234567891',
    });

    expect(updated).toMatchObject({
      id: created.id,
      publication: 'Picsou Magazine (Édition Deluxe)',
      issueNumber: 548,
      edition: 'deluxe',
      language: 'FR',
      publicationDate: '2024-01',
      barcode: '3271234567891',
    });
    expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    expect(updated?.createdAt).toBe(created.createdAt);
  });

  it('preserve notes et ocr_text lors de la modification', async () => {
    const created = await repo.create({
      publication: 'Mickey Parade',
      issueNumber: 2,
      notes: 'annotation',
      ocrText: 'raw',
    });

    const updated = await repo.update(created.id, { publication: 'Mickey Parade' });

    expect(updated?.notes).toBe('annotation');
    expect(updated?.ocrText).toBe('raw');
    const row = await testDb.getFirstAsync<{ notes: string; ocr_text: string }>(
      'SELECT notes, ocr_text FROM magazines WHERE id = ?',
      created.id,
    );
    expect(row?.notes).toBe('annotation');
    expect(row?.ocr_text).toBe('raw');
  });

  it('peut remettre un champ a null', async () => {
    const created = await repo.create({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'standard',
    });

    const updated = await repo.update(created.id, { publication: 'Picsou Magazine' });

    expect(updated?.issueNumber).toBeNull();
    expect(updated?.edition).toBeNull();
  });

  it('refuse une publication vide', async () => {
    const created = await repo.create({ publication: 'Mickey Parade', issueNumber: 2 });

    await expect(repo.update(created.id, { publication: '   ' })).rejects.toThrow(
      'La publication est obligatoire.',
    );
  });

  it('renvoie null pour un id inconnu', async () => {
    const updated = await repo.update('nimporte', { publication: 'Picsou' });

    expect(updated).toBeNull();
  });
});

describe('magazineRepository.delete', () => {
  it('supprime l edition et ses exemplaires en cascade', async () => {
    const mag = await repo.create({ publication: 'Picsou Magazine', issueNumber: 547 });
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'c1',
      mag.id,
      '2026-09-01T10:00:00Z',
    );
    const countBefore = await testDb.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM collection_items WHERE magazine_id = ?',
      mag.id,
    );
    expect(countBefore?.n).toBe(1);

    await repo.delete(mag.id);

    const magazine = await repo.findById(mag.id);
    expect(magazine).toBeNull();
    const countAfter = await testDb.getFirstAsync<{ n: number }>(
      'SELECT COUNT(*) AS n FROM collection_items WHERE magazine_id = ?',
      mag.id,
    );
    expect(countAfter?.n).toBe(0);
  });
});
