import type { MagazineListItem } from '@/types';
import {
  buildEditionOptions,
  filterAndSortMagazines,
  pageWindow,
  sortMagazines,
} from '@/lib/collection-list';

const m = (
  over: Partial<MagazineListItem> & { id: string; publication: string },
): MagazineListItem => ({
  id: over.id,
  publication: over.publication,
  issueNumber: over.issueNumber ?? null,
  edition: over.edition ?? null,
  language: null,
  condition: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: over.createdAt ?? '',
  updatedAt: '',
});

describe('sortMagazines', () => {
  const list = [
    m({ id: 'a', publication: 'B', issueNumber: 2 }),
    m({ id: 'b', publication: 'A', issueNumber: 10 }),
    m({ id: 'c', publication: 'C', issueNumber: null }),
  ];

  it('trie par numéro croissant puis publication (null en fin)', () => {
    const sorted = sortMagazines(list, 'Numéro ↑');
    expect(sorted.map((x) => x.id)).toEqual(['a', 'b', 'c']);
  });

  it('trie par numéro décroissant', () => {
    const sorted = sortMagazines(list, 'Numéro ↓');
    expect(sorted.map((x) => x.id)).toEqual(['b', 'a', 'c']);
  });

  it('trie par édition (A → Z) puis publication (sans édition en tête)', () => {
    const editionList = [
      m({ id: 'a', publication: 'X', edition: 'FR' }),
      m({ id: 'b', publication: 'Y', edition: 'EN' }),
      m({ id: 'c', publication: 'Z', edition: null }),
    ];
    const sorted = sortMagazines(editionList, 'Édition (A → Z)');
    expect(sorted.map((x) => x.id)).toEqual(['c', 'b', 'a']);
  });

  it('trie par ajout récent', () => {
    const recentList = [
      m({ id: 'a', publication: 'X', createdAt: '2020-01-01' }),
      m({ id: 'b', publication: 'Y', createdAt: '2023-01-01' }),
    ];
    const sorted = sortMagazines(recentList, 'Ajout récent');
    expect(sorted.map((x) => x.id)).toEqual(['b', 'a']);
  });

  it('ne mute pas la liste source', () => {
    const original = [...list];
    sortMagazines(list, 'Numéro ↑');
    expect(list.map((x) => x.id)).toEqual(original.map((x) => x.id));
  });
});

describe('pageWindow', () => {
  it('renvoie la fenêtre autour de la page courante', () => {
    expect(pageWindow(5, 10)).toEqual([3, 4, 5, 6, 7]);
  });
  it('borne au début', () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3]);
  });
  it('borne à la fin', () => {
    expect(pageWindow(10, 10)).toEqual([8, 9, 10]);
  });
});

describe('buildEditionOptions', () => {
  it('liste les éditions distinctes avec « Sans édition » en fin', () => {
    const list = [
      m({ id: 'a', publication: 'X', edition: 'FR' }),
      m({ id: 'b', publication: 'Y', edition: 'FR' }),
      m({ id: 'c', publication: 'Z', edition: null }),
      m({ id: 'd', publication: 'W', edition: '  EN  ' }),
    ];
    expect(buildEditionOptions(list)).toEqual(['EN', 'FR', 'Sans édition']);
  });
});

describe('filterAndSortMagazines', () => {
  const list = [
    m({ id: 'a', publication: 'X', issueNumber: 5, edition: 'FR' }),
    m({ id: 'b', publication: 'Y', issueNumber: 10, edition: 'EN' }),
    m({ id: 'c', publication: 'Z', issueNumber: 5, edition: null }),
  ];

  it('filtre par édition', () => {
    const out = filterAndSortMagazines(list, 'FR', '', 'Numéro ↑');
    expect(out.map((x) => x.id)).toEqual(['a']);
  });

  it('filtre par numéro', () => {
    const out = filterAndSortMagazines(list, null, '5', 'Numéro ↑');
    expect(out.map((x) => x.id)).toEqual(['a', 'c']);
  });

  it('retourne tout sans filtre', () => {
    const out = filterAndSortMagazines(list, null, '', 'Numéro ↑');
    expect(out).toHaveLength(3);
  });
});
