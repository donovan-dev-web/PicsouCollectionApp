import type { OcrEngine, OcrFrame, OcrFrameResult } from './ocrTypes';

/**
 * Moteur OCR natif basé sur **Google ML Kit Text Recognition** (M-05, US-ID-03).
 *
 * ⚠️ PARTIE À TESTER PHYSIQUEMENT — non couverte par la CI.
 *
 * ML Kit Text Recognition est un module natif HTML de React Native ; il n'est
 * disponible que dans un **Development Build** (pas en métro JS seul) et doit
 * être validé sur téléphone physique. Ce fichier est donc **isolé** : il n'est
 * importé nulle part par le circuit de test automatique, et son chargement est
 * **paresseux** (via `require` dynamique dans un `try/catch`) pour que la CI
 * reste verte même si la dépendance native n'est pas installée.
 *
 * ### Branchement (Development Build)
 * 1. Vérifier quel paquet ML Kit est compatible avec Expo SDK 57.
 *    Piste documentée dans `docs/03-TECHNICAL-SPEC.md §5` :
 *    `@react-native-ml-kit/text-recognition` (ou implémentation native dédiée).
 * 2. Installer le module natif (`expo run:android` régénère le Dev Build).
 * 3. Fournir les frames caméra à `recognize(frame.native)` (image bitmap / width /
 *    height). Le parsing/confiance est ensuite géré par le pipeline testable.
 *
 * Le pipeline (throttling, parsing, confiance, rapprochement base) ne dépend pas
 * de ce fichier : il est injectable via l'interface `OcrEngine`.
 */
export class MlKitOcrEngine implements OcrEngine {
  private recognizer: {
    recognize: (image: unknown, opts?: unknown) => Promise<{ text: string }>;
  } | null = null;

  private async getRecognizer(): Promise<{
    recognize: (image: unknown, opts?: unknown) => Promise<{ text: string }>;
  }> {
    if (this.recognizer) {
      return this.recognizer;
    }

    // Chargement paresseux : la dépendance native n'existe que sur le Dev Build.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const module = require('@react-native-ml-kit/text-recognition') as {
      createTextRecognizer: () => Promise<{
        recognize: (image: unknown) => Promise<{ text: string }>;
      }>;
    };
    const created = await module.createTextRecognizer();
    this.recognizer = created;
    return created;
  }

  async recognize(frame: OcrFrame): Promise<OcrFrameResult> {
    try {
      const recognizer = await this.getRecognizer();
      if (!recognizer) {
        return null;
      }
      const result = await recognizer.recognize(frame.native);
      const text = (result.text ?? '').trim();
      return text.length > 0 ? { text } : null;
    } catch (error) {
      // Le module natif peut être absent (hors Dev Build) ou échouer sur une frame :
      // on ne crashe pas l'UI, on laisse le pipeline continuer d'analyser.
      console.warn('OCR natif indisponible ou erreur de reconnaissance.', error);
      return null;
    }
  }
}
