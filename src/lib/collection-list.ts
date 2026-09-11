import type { MagazineListItem } from '@/types';

export const PAGE_SIZE = 20;

/** Options de tri de la collection (M10R2-08). */
export const SORT_OPTIONS = ['Numéro ↑', 'Numéro ↓', 'Ajout récent', 'Édition (A → Z)'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** Fenêtre de pagination autour de la page courante (±2). */
export function pageWindow(current: number, total: number): number[] {
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

export function sortMagazines(list: MagazineListItem[], sort: SortOption): MagazineListItem[] {
  const sorted = [...list];
  switch (sort) {
    case 'Numéro ↓':
      return sorted.sort((a, b) => {
        const na = a.issueNumber ?? Number.MIN_SAFE_INTEGER;
        const nb = b.issueNumber ?? Number.MIN_SAFE_INTEGER;
        if (na !== nb) return nb - na;
        return a.publication.localeCompare(b.publication);
      });
    case 'Ajout récent':
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    case 'Édition (A → Z)':
      return sorted.sort((a, b) => {
        const ea = (a.edition?.trim() || '').toLowerCase();
        const eb = (b.edition?.trim() || '').toLowerCase();
        if (ea !== eb) return ea.localeCompare(eb);
        return a.publication.localeCompare(b.publication);
      });
    case 'Numéro ↑':
    default:
      return sorted.sort((a, b) => {
        const na = a.issueNumber ?? Number.MAX_SAFE_INTEGER;
        const nb = b.issueNumber ?? Number.MAX_SAFE_INTEGER;
        if (na !== nb) return na - nb;
        return a.publication.localeCompare(b.publication);
      });
  }
}

/** Éditions distinctes triées (avec « Sans édition » en fin) pour le filtre. */
export function buildEditionOptions(list: MagazineListItem[]): string[] {
  return [
    ...new Set(list.map((m) => (m.edition?.trim() ? m.edition.trim() : 'Sans édition'))),
  ].sort((a, b) => (a === 'Sans édition' ? 1 : b === 'Sans édition' ? -1 : a.localeCompare(b)));
}

/** Applique les filtres (édition + numéro) puis le tri. */
export function filterAndSortMagazines(
  list: MagazineListItem[],
  editionFilter: string | null,
  issueQuery: string,
  sort: SortOption,
): MagazineListItem[] {
  const issue = issueQuery.trim();
  const filtered = list.filter((m) => {
    if (editionFilter) {
      const edition = m.edition?.trim() ? m.edition.trim() : 'Sans édition';
      if (edition !== editionFilter) {
        return false;
      }
    }
    if (issue) {
      const parsed = Number(issue);
      if (Number.isNaN(parsed) || m.issueNumber !== parsed) {
        return false;
      }
    }
    return true;
  });
  return sortMagazines(filtered, sort);
}
