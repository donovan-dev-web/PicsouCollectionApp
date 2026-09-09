import type { OcrEngine, OcrFrame, OcrFrameResult } from './ocrTypes';
import type { OcrImagePreprocessor } from './ocrImagePreprocessor';
import { mapRecognitionResult } from './ocrResultMapper';

/**
 * Moteur OCR natif basé sur **Google ML Kit Text Recognition** (M-05, US-ID-03),
 * via le module Expo `expo-mlkit-ocr` (on-device, hors ligne).
 *
 * ⚠️ PARTIE À TESTER PHYSIQUEMENT — non couverte par la CI.
 *
 * `expo-mlkit-ocr` est un **module natif Expo** (Expo Modules API) : il n'est
 * disponible que dans un **Development Build**, pas dans Expo Go. Il est donc
 * testé sur **téléphone physique** après un `eas build` (ou `expo run:android`).
 * La CI ne charge jamais ce fichier de façon native : l'import du module est
 * **paresseux** (dans `recognize`), ce qui garde les tests / lint / typecheck verts.
 *
 * M-12 (US-OCR-01) : un **prétraitement** (`OcrImagePreprocessor`) est appliqué
 * sur la photo avant la reconnaissance (redimensionnement + ré-encodage éphémère).
 * M-12 (US-OCR-02) : le résultat contient le texte **et** les zones (bounding
 * boxes, niveau ligne) via `mapRecognitionResult`.
 *
 * ### Moteur par défaut
 * Dans `dependencies.initialize()`, ce moteur est utilisé comme `OcrEngine`
 * par défaut. S'il échoue (module natif absent, image invalide…), il retourne
 * `null` et le pipeline continue d'analyser sans planter l'UI.
 */
export class MlKitOcrEngine implements OcrEngine {
  constructor(private readonly preprocessor: OcrImagePreprocessor | null = null) {}

  async recognize(frame: OcrFrame): Promise<OcrFrameResult> {
    if (!frame.native) {
      return null;
    }

    try {
      // Import paresseux : le module natif n'existe que sur le Development Build.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { recognizeText } = require('expo-mlkit-ocr') as {
        recognizeText: (uri: string) => Promise<import('expo-mlkit-ocr').RecognitionResult>;
      };

      let uri = frame.native;
      if (this.preprocessor) {
        const preprocessed = await this.preprocessor.preprocess({
          uri: frame.native,
          width: frame.width,
          height: frame.height,
        });
        if (preprocessed) {
          uri = preprocessed;
        }
      }

      const result = await recognizeText(uri);
      return mapRecognitionResult(result);
    } catch (error) {
      // Module natif absent (hors Dev Build) ou échec de reconnaissance :
      // on ne crashe pas l'écran, on laisse l'analyse continuer.
      console.warn('OCR natif indisponible ou erreur de reconnaissance.', error);
      return null;
    }
  }
}
