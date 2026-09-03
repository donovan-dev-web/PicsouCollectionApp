/**
 * Types du flux OCR (M-05, US-ID-03 / US-ID-05).
 *
 * La partie "moteur OCR" (reconnaissance brute sur des images caméra) est un
 * module **natif** (Google ML Kit Text Recognition) qui ne peut être validé que
 * sur un Development Build. Pour ne pas bloquer la CI, le pipeline logique
 * (analyse, parsing, confiance) est testable et dépend d'une interface `OcrEngine`,
 * dont l'implémentation native est isolée (`mlKitOcrEngine.ts`).
 */

/** Une frame caméra analysée. Seul le texte reconnu par le moteur nous intéresse. */
export type OcrFrame = {
  /** Pointeur natif / image ; opaque pour le pipeline logique. */
  native: unknown;
  width: number;
  height: number;
};

/** Résultat brut d'un moteur OCR : le texte détecté sur une frame. */
export type OcrFrameResult = { text: string } | null;

/**
 * Interface du moteur OCR réel. Injective dans le pipeline pour être mockée en test
 * et remplaçable par l'implémentation native (`MlKitOcrEngine`) sur le Development Build.
 */
export interface OcrEngine {
  recognize(frame: OcrFrame): Promise<OcrFrameResult>;
}
