/**
 * Types du flux OCR (M-05, US-ID-03 / US-ID-05 ; M-12, US-OCR-01..08).
 *
 * Le pipeline logique (analyse, parsing, confiance) est testable et dépend d'une
 * interface `OcrEngine`. L'implémentation native (`MlKitOcrEngine`) s'appuie sur
 * le module Expo `expo-mlkit-ocr` (Google ML Kit on-device), **image-based** : on
 * capture une photo via `expo-camera` (`takePictureAsync`) puis on reconnaît le
 * texte à partir de son URI. Le module natif n'est disponible que sur un
 * Development Build (valider sur téléphone physique) — il ne bloque pas la CI.
 *
 * M-12 (US-OCR-02) : un résultat OCR transporte, en plus du texte complet, les
 * **zones** détectées (bounding boxes) — niveau *ligne* de ML Kit — afin de
 * pouvoir afficher un overlay cliquable sur la photo et laisser l'utilisateur
 * sélectionner l'information (cas ambigus).
 */

/**
 * Entrée d'une frame analysée. `native` transporte l'URI de l'image capturée
 * (sortie de `takePictureAsync`) ; opaque pour le pipeline logique. `width` /
 * `height` sont les dimensions de l'image capturée (utilisées par le
 * prétraitement, M-12).
 */
export type OcrFrame = {
  native: string | null;
  width: number;
  height: number;
};

/** Position et taille d'une zone détectée, en pixels de l'image d'origine. */
export type OcrBoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/** Une zone de texte détectée (un niveau de lecture) + sa position. */
export type OcrTextZone = {
  id: string;
  text: string;
  boundingBox: OcrBoundingBox;
};

/**
 * Résultat brut d'un moteur OCR : le texte détecté sur une frame et les zones
 * (texte + positions) permettant l'analyse des candidats et l'overlay interactif.
 */
export type OcrFrameResult = { text: string; zones: OcrTextZone[] } | null;

/**
 * Interface du moteur OCR réel. Injective dans le pipeline pour être mockée en test
 * et remplaçable par l'implémentation native (`MlKitOcrEngine`) sur le Development Build.
 */
export interface OcrEngine {
  recognize(frame: OcrFrame): Promise<OcrFrameResult>;
}