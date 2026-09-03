import type { OcrEngine, OcrFrame, OcrFrameResult } from './ocrTypes';

/**
 * Moteur OCR par défaut, volontairement inerte.
 *
 * L'OCR réel repose sur un module natif (Google ML Kit Text Recognition) qui n'est
 * disponible que sur un **Development Build** et doit être validé sur téléphone
 * physique. Pour ne pas bloquer la CI (tests / lint / typecheck), le moteur par
 * défaut retourne toujours "pas de texte" : le flux caméra reste pleinement
 * câblé et testable, seule la reconnaissance brute est à activer sur l'appareil.
 *
 * À brancher physiquement : remplacer `NoopOcrEngine` par l'implémentation natale
 * (`MlKitOcrEngine`) dans `dependencies.initialize()`. Voir
 * `docs/05-ARCHITECTURE.md § OCR` et `mlKitOcrEngine.ts`.
 */
export class NoopOcrEngine implements OcrEngine {
  async recognize(_frame: OcrFrame): Promise<OcrFrameResult> {
    return null;
  }
}
