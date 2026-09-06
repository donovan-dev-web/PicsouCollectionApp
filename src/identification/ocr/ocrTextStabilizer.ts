/**
 * Stabilisation de la lecture OCR d'une couverture (M10R2-09, US-ID-03).
 *
 * Face aux textes stylisés / dessinés et aux reflets, une lecture isolée peut
 * être partielle ou erronée. Ce stabilisateur exige qu'un même résultat obtenu
 * (`publication|numéro|date`) soit observé plusieurs frames de suite avant de
 * conclure l'identification, à l'image du `BarcodeStabilizer` (M-04R).
 *
 * Module pur et testable en isolation (sans dépendance au matériel caméra).
 */

export class OcrTextStabilizer {
  private current: { key: string; count: number } | null = null;

  /**
   * @param threshold nombre de lectures consécutives identiques requises
   *                  avant qu'un résultat ne soit considéré comme stable.
   */
  constructor(private readonly threshold = 2) {}

  /**
   * Enregistre une lecture brute.
   *
   * @param raw résultat OCR normalisé (`publication|numéro|date`)
   * @returns la clé considérée comme stable (apparue `threshold` fois de suite),
   *          ou `null` tant que la lecture n'est pas stabilisée.
   */
  push(raw: string): string | null {
    const key = raw.trim();
    if (key.length === 0) {
      return null;
    }

    if (this.current && this.current.key === key) {
      this.current.count += 1;
    } else {
      this.current = { key, count: 1 };
    }

    if (this.current.count >= this.threshold) {
      return this.current.key;
    }
    return null;
  }

  /** Réinitialise l'accumulation en cours (ex. après un scan traité). */
  reset(): void {
    this.current = null;
  }
}
