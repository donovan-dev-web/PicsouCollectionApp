/**
 * Stabilisation de la lecture d'un code-barres (M-04R, US-ID-07).
 *
 * Lors d'un scan caméra, une seule lecture peut être erronée (lecture trop rapide,
 * orientation, reflets…). Ce stabilisateur exige qu'un même code soit observé
 * plusieurs fois de suite avant d'être considéré comme fiable, afin d'éviter les
 * faux positifs avant le lancement de la recherche.
 *
 * Module pur et testable en isolation (sans dépendance au matériel caméra).
 */

export class BarcodeStabilizer {
  private current: { code: string; count: number } | null = null;

  /**
   * @param threshold nombre de lectures consécutives identiques requises
   *                  avant qu'un code ne soit considéré comme stable.
   */
  constructor(private readonly threshold = 3) {}

  /**
   * Enregistre une lecture brute.
   *
   * @param raw code brut détecté par la caméra
   * @returns le code considéré comme stable (apparu `threshold` fois de suite),
   *          ou `null` tant que la lecture n'est pas stabilisée.
   */
  push(raw: string): string | null {
    const code = raw.trim();
    if (code.length === 0) {
      return null;
    }

    if (this.current && this.current.code === code) {
      this.current.count += 1;
    } else {
      this.current = { code, count: 1 };
    }

    if (this.current.count >= this.threshold) {
      return this.current.code;
    }
    return null;
  }

  /** Réinitialise l'accumulation en cours (ex. après un scan traité). */
  reset(): void {
    this.current = null;
  }
}
