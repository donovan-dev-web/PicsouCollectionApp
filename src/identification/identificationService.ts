import type { Magazine } from '@/types';

import { scanBarcode } from './scanBarcode';

export type BarcodeLookupResult =
  | { status: 'found'; magazine: Magazine }
  | { status: 'unknown' }
  | { status: 'invalid'; reason: string };

export interface BarcodeRepository {
  findByBarcode(barcode: string): Promise<Magazine | null>;
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
   * @returns `found` si l'édition est en base, `unknown` si le code est valide
   *          mais absent (→ méthodes de secours), `invalid` si le code est mal formé.
   */
  async identifyByBarcode(raw: string): Promise<BarcodeLookupResult> {
    const scan = scanBarcode(raw);

    if (scan.status === 'invalid') {
      return { status: 'invalid', reason: scan.reason };
    }

    const magazine = await this.repository.findByBarcode(scan.normalized);
    if (magazine) {
      return { status: 'found', magazine };
    }
    return { status: 'unknown' };
  }
}
