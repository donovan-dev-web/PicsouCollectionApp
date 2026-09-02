export type Magazine = {
  id: string;
  publication: string;
  issueNumber: number | null;
  edition: string | null;
  country: string | null;
  publicationDate: string | null;
  barcode: string | null;
  notes: string | null;
  ocrText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MagazineListItem = Magazine & {
  quantity: number;
};

export type MagazineDetail = Magazine & {
  copies: CollectionItem[];
};

export type CollectionItem = {
  id: string;
  magazineId: string;
  condition: string | null;
  notes: string | null;
  dateAdded: string;
};

export type CreateMagazineInput = {
  publication: string;
  issueNumber?: number | null;
  edition?: string | null;
  country?: string | null;
  publicationDate?: string | null;
  barcode?: string | null;
  notes?: string | null;
  ocrText?: string | null;
};

export type CreateCollectionItemInput = {
  condition?: string | null;
  notes?: string | null;
};

export type RecentCopy = {
  copy: CollectionItem;
  magazine: Pick<Magazine, 'id' | 'publication' | 'issueNumber'>;
};
