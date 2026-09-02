import type { Database } from '@/database/types';
import type { CollectionItem, CreateCollectionItemInput, RecentCopy } from '@/types';
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

  async listRecentCopies(limit = 5): Promise<RecentCopy[]> {
    const rows = await this.db.getAllAsync<{
      copy_id: string;
      copy_magazine_id: string;
      copy_condition: string | null;
      copy_notes: string | null;
      copy_date_added: string;
      magazine_publication: string;
      magazine_issue_number: number | null;
    }>(
      `SELECT c.id AS copy_id,
              c.magazine_id AS copy_magazine_id,
              c.condition AS copy_condition,
              c.notes AS copy_notes,
              c.date_added AS copy_date_added,
              m.publication AS magazine_publication,
              m.issue_number AS magazine_issue_number
       FROM collection_items c
       JOIN magazines m ON m.id = c.magazine_id
       ORDER BY c.date_added DESC
       LIMIT ?`,
      limit,
    );

    return rows.map((row) => ({
      copy: {
        id: row.copy_id,
        magazineId: row.copy_magazine_id,
        condition: row.copy_condition,
        notes: row.copy_notes,
        dateAdded: row.copy_date_added,
      },
      magazine: {
        id: row.copy_magazine_id,
        publication: row.magazine_publication,
        issueNumber: row.magazine_issue_number,
      },
    }));
  }
}
