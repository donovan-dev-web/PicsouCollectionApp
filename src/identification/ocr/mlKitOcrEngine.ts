import type { OcrEngine, OcrFrame, OcrFrameResult } from './ocrTypes';

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
 * ### Moteur par défaut
 * Dans `dependencies.initialize()`, ce moteur est utilisé comme `OcrEngine`
 * par défaut. S'il échoue (module natif absent, image invalide…), il retourne
 * `null` et le pipeline continue d'analyser sans planter l'UI.
 */
export class MlKitOcrEngine implements OcrEngine {
  async recognize(frame: OcrFrame): Promise<OcrFrameResult> {
    if (!frame.native) {
      return null;
    }

    try {
      // Import paresseux : le module natif n'existe que sur le Development Build.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { recognizeText } = require('expo-mlkit-ocr') as {
        recognizeText: (uri: string) => Promise<{ text: string }>;
      };
      const result = await recognizeText(frame.native);
      const text = (result?.text ?? '').trim();
      return text.length > 0 ? { text } : null;
    } catch (error) {
      // Module natif absent (hors Dev Build) ou échec de reconnaissance :
      // on ne crashe pas l'écran, on laisse l'analyse continuer.
      console.warn('OCR natif indisponible ou erreur de reconnaissance.', error);
      return null;
    }
  }
}
