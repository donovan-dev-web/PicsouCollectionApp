import { createTestDatabase } from '@/test-utils/test-db';
import { migrate } from '@/database/migrations';
import { CollectionRepository } from '@/database/repositories/collection-repository';
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
let repo: CollectionRepository;
let magazineRepo: MagazineRepository;
let magazineId: string;

beforeEach(async () => {
  testDb = createTestDatabase();
  await migrate(testDb);
  repo = new CollectionRepository(testDb);
  magazineRepo = new MagazineRepository(testDb);
  magazineId = (await magazineRepo.create({ publication: 'Picsou Magazine', issueNumber: 547 })).id;
});

afterEach(async () => {
  await testDb.close();
});

describe('collectionRepository.addCopy', () => {
  it('ajoute un exemplaire avec notes et date', async () => {
    const copy = await repo.addCopy(magazineId, {
      notes: 'emballage intact',
    });

    expect(copy).toMatchObject({
      magazineId,
      notes: 'emballage intact',
    });
    expect(copy.id).toMatch(/^b1a2c3d4-0000-4000-8000-/);
    expect(copy.dateAdded).toBeDefined();

    const reloaded = await repo.listByMagazine(magazineId);
    expect(reloaded).toHaveLength(1);
    expect(reloaded[0]).toEqual(copy);
  });

  it('refuse un exemplaire pour une edition inexistante', async () => {
    await expect(repo.addCopy('edition-inconnue')).rejects.toMatchObject({
      code: 'SQLITE_CONSTRAINT_FOREIGNKEY',
    });
  });
});

describe('collectionRepository.countByMagazine', () => {
  it('compte uniquement les exemplaires de la publication', async () => {
    const otherMagazine = await magazineRepo.create({
      publication: 'Mickey Parade',
      issueNumber: 2,
    });

    await repo.addCopy(magazineId);
    await repo.addCopy(magazineId);
    await repo.addCopy(otherMagazine.id);

    expect(await repo.countByMagazine(magazineId)).toBe(2);
    expect(await repo.countByMagazine(otherMagazine.id)).toBe(1);
    expect(await repo.countByMagazine('edition-inconnue')).toBe(0);
  });
});

describe('collectionRepository.listByMagazine', () => {
  it('liste du plus recent au plus ancien', async () => {
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'copy-1',
      magazineId,
      '2026-01-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'copy-2',
      magazineId,
      '2026-09-01T10:00:00Z',
    );

    const copies = await repo.listByMagazine(magazineId);

    expect(copies.map((c) => c.id)).toEqual(['copy-2', 'copy-1']);
  });
});

describe('collectionRepository.deleteCopy', () => {
  it('supprime un exemplaire', async () => {
    const copy = await repo.addCopy(magazineId);

    await repo.deleteCopy(copy.id);

    expect(await repo.countByMagazine(magazineId)).toBe(0);
  });
});

describe('suppression en cascade', () => {
  it('supprimer une edition supprime ses exemplaires', async () => {
    await repo.addCopy(magazineId);
    await repo.addCopy(magazineId);

    await magazineRepo.delete(magazineId);

    expect(await repo.countByMagazine(magazineId)).toBe(0);
  });
});

describe('collectionRepository.listRecentCopies', () => {
  it('liste les derniers exemplaires avec les infos du magazine, du plus recent au plus ancien', async () => {
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'copy-old',
      magazineId,
      '2026-01-01T10:00:00Z',
    );
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, NULL, ?)`,
      'copy-new',
      magazineId,
      '2026-09-01T10:00:00Z',
    );
    const otherMagazine = await magazineRepo.create({
      publication: 'Super Picsou Géant',
      issueNumber: 30,
    });
    await testDb.runAsync(
      `INSERT INTO collection_items (id, magazine_id, notes, date_added)
       VALUES (?, ?, 'coffret', ?)`,
      'copy-mid',
      otherMagazine.id,
      '2026-05-01T10:00:00Z',
    );

    const recent = await repo.listRecentCopies(2);

    expect(recent).toHaveLength(2);
    expect(recent[0].copy.id).toBe('copy-new');
    expect(recent[0].magazine.publication).toBe('Picsou Magazine');
    expect(recent[0].magazine.issueNumber).toBe(547);
    expect(recent[1].copy.id).toBe('copy-mid');
    expect(recent[1].copy.notes).toBe('coffret');
    expect(recent[1].magazine.publication).toBe('Super Picsou Géant');
  });

  it('respecte la limite et retourne une liste vide si aucun exemplaire', async () => {
    expect(await repo.listRecentCopies(5)).toEqual([]);
  });
});
