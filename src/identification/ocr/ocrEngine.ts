import type { OcrEngine, OcrFrame, OcrFrameResult } from './ocrTypes';

/**
 * Moteur OCR inerte, utilisé sur les plateformes sans module natif (web).
 *
 * L'OCR réel repose sur un module natif (Google ML Kit Text Recognition) qui n'est
 * disponible que sur un **Development Build** et doit être validé sur téléphone
 * physique. Sur Android/iOS, `dependencies.initialize()` instancie `MlKitOcrEngine` ;
 * sur le web (aucun module natif) ce moteur retourne toujours "pas de texte" :
 * le flux caméra reste pleinement câblé et testable. Voir
 * `docs/05-ARCHITECTURE.md § OCR` et `mlKitOcrEngine.ts`.
 */
export class NoopOcrEngine implements OcrEngine {
  async recognize(_frame: OcrFrame): Promise<OcrFrameResult> {
    return null;
  }
}
