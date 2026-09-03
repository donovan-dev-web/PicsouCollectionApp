import type { Magazine, MagazineListItem } from '@/types';

import { scanBarcode } from './scanBarcode';

export type BarcodeLookupResult =
  | { status: 'found'; magazine: Magazine }
  | { status: 'ambiguous'; magazines: MagazineListItem[] }
  | { status: 'unknown' }
  | { status: 'invalid'; reason: string };

export interface BarcodeRepository {
  findManyByBarcode(barcode: string): Promise<MagazineListItem[]>;
}

/**
 * Identification d'une édition. Pour M-04, seule la méthode par code-barres est
 * implémentée (la caméra/OCR et la possession relèvent des phases M-05/M-06).
 */
export class IdentificationService {
  constructor(private readonly repository: BarcodeRepository) {}

  /**
   * Identifie une édition à partir d'un code-barres détecté.
   *
   * @returns `found` si une édition unique correspond, `ambiguous` si le même
   *          code-barres correspond à plusieurs éditions (→ l'utilisateur choisit),
   *          `unknown` si le code est valide mais absent (→ méthodes de secours),
   *          `invalid` si le code est mal formé.
   */
  async identifyByBarcode(raw: string): Promise<BarcodeLookupResult> {
    const scan = scanBarcode(raw);

    if (scan.status === 'invalid') {
      return { status: 'invalid', reason: scan.reason };
    }

    const magazines = await this.repository.findManyByBarcode(scan.normalized);
    if (magazines.length === 1) {
      return { status: 'found', magazine: magazines[0] };
    }
    if (magazines.length > 1) {
      return { status: 'ambiguous', magazines };
    }
    return { status: 'unknown' };
  }
}
