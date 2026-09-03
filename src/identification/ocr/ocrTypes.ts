/**
 * Types du flux OCR (M-05, US-ID-03 / US-ID-05).
 *
 * Le pipeline logique (analyse, parsing, confiance) est testable et dépend d'une
 * interface `OcrEngine`. L'implémentation native (`MlKitOcrEngine`) s'appuie sur
 * le module Expo `expo-mlkit-ocr` (Google ML Kit on-device), **image-based** : on
 * capture une photo via `expo-camera` (`takePictureAsync`) puis on reconnaît le
 * texte à partir de son URI. Le module natif n'est disponible que sur un
 * Development Build (valider sur téléphone physique) — il ne bloque pas la CI.
 */

/**
 * Entrée d'une frame analysée. `native` transporte l'URI de l'image capturée
 * (sortie de `takePictureAsync`) ; opaque pour le pipeline logique.
 */
export type OcrFrame = {
  native: string | null;
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
