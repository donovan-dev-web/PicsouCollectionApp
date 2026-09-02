import type { Database } from '@/database/types';
import type { CollectionItem, CreateCollectionItemInput } from '@/types';
import { generateId } from '@/utils/id';

type CollectionItemRow = {
  id: string;
  magazine_id: string;
  condition: string | null;
  notes: string | null;
  date_added: string;
};

function toCollectionItem(row: CollectionItemRow): CollectionItem {
  return {
    id: row.id,
    magazineId: row.magazine_id,
    condition: row.condition,
    notes: row.notes,
    dateAdded: row.date_added,
  };
}

export class CollectionRepository {
  constructor(private readonly db: Database) {}

  async addCopy(
    magazineId: string,
    input: CreateCollectionItemInput = {},
  ): Promise<CollectionItem> {
    const item: CollectionItem = {
      id: generateId(),
      magazineId,
      condition: input.condition ?? null,
      notes: input.notes ?? null,
      dateAdded: new Date().toISOString(),
    };

    await this.db.runAsync(
      `INSERT INTO collection_items (id, magazine_id, condition, notes, date_added)
       VALUES (?, ?, ?, ?, ?)`,
      item.id,
      item.magazineId,
      item.condition,
      item.notes,
      item.dateAdded,
    );

    return item;
  }

  async countByMagazine(magazineId: string): Promise<number> {
    const row = await this.db.getFirstAsync<{ quantity: number }>(
      'SELECT COUNT(*) AS quantity FROM collection_items WHERE magazine_id = ?',
      magazineId,
    );

    return Number(row?.quantity ?? 0);
  }

  async listByMagazine(magazineId: string): Promise<CollectionItem[]> {
    const rows = await this.db.getAllAsync<CollectionItemRow>(
      `SELECT id, magazine_id, condition, notes, date_added
       FROM collection_items
       WHERE magazine_id = ?
       ORDER BY date_added DESC`,
      magazineId,
    );

    return rows.map(toCollectionItem);
  }

  async deleteCopy(id: string): Promise<void> {
    await this.db.runAsync('DELETE FROM collection_items WHERE id = ?', id);
  }
}
