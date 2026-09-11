export type Magazine = {
  id: string;
  publication: string;
  issueNumber: number | null;
  edition: string | null;
  language: string | null;
  condition: string | null;
  publicationDate: string | null;
  barcode: string | null;
  notes: string | null;
  ocrText: string | null;
  createdAt: string;
  updatedAt: string;
};

/**
 * Une édition en collection est toujours possédée (les exemplaires ont été
 * supprimés — retours test physique) : l'élément de liste est l'édition.
 */
export type MagazineListItem = Magazine;

export type MagazineDetail = Magazine;

export type CreateMagazineInput = {
  publication: string;
  issueNumber?: number | null;
  edition?: string | null;
  language?: string | null;
  condition?: string | null;
  publicationDate?: string | null;
  barcode?: string | null;
  notes?: string | null;
  ocrText?: string | null;
};
