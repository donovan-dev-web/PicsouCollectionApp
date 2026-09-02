import type { Database } from '@/database/types';
import { getDatabase } from '@/database/db';
import { migrate } from '@/database/migrations';
import { CollectionRepository } from '@/database/repositories/collection-repository';
import { MagazineRepository } from '@/database/repositories/magazine-repository';

export interface Dependencies {
  magazineRepository: MagazineRepository;
  collectionRepository: CollectionRepository;
}

let dbPromise: Promise<Database> | null = null;
let deps: Dependencies | null = null;

async function openDb(): Promise<Database> {
  const db = await getDatabase();
  await migrate(db);
  return db;
}

export function getDeps(): Dependencies {
  if (!deps) {
    throw new Error('Dépendances non initialisées : appeler initialize() au démarrage.');
  }
  return deps;
}

export async function initialize(): Promise<Dependencies> {
  if (!dbPromise) {
    dbPromise = openDb();
  }
  const db = await dbPromise;
  if (!deps) {
    deps = {
      magazineRepository: new MagazineRepository(db),
      collectionRepository: new CollectionRepository(db),
    };
  }
  return deps;
}

export function setDepsForTest(overrides: Dependencies): void {
  deps = overrides;
}

export function __resetForTests(): void {
  deps = null;
  dbPromise = null;
}
