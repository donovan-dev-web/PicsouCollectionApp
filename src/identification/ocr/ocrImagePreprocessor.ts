/**
 * Prétraitement de la photo avant reconnaissance OCR (M-12, US-OCR-01 / M12-01).
 *
 * Le module natif `expo-image-manipulator` (chargé paresseusement, comme le moteur
 * ML Kit) normalise la photo capturée avant l'appel `recognizeText` :
 * - **redimensionnement** si la photo dépasse `OCR_MAX_DIMENSION` (ML Kit est
 *   plus fiable à résolution modérée, et l'analyse reste bornée) ;
 * - **ré-encodage JPEG** (qualité `OCR_OUTPUT_QUALITY`) : format normalisé,
 *   éphémère, jamais enregistré (R14.2 du 04-FONCTIONAL-SPEC).
 *
 * Le contraste n'est pas exposé par l'API `expo-image-manipulator` du SDK 57
 * (actions : resize/rotate/flip/crop/extend uniquement) : il est reporté si un
 * wrapper natif le permet, sans changer le contrat d'interface ci-dessous.
 */

/** Dimension maximale (côté le plus long, en pixels) de la photo envoyée à ML Kit. */
export const OCR_MAX_DIMENSION = 2600;

/** Qualité de ré-encodage JPEG du prétraitement (0..1). */
export const OCR_OUTPUT_QUALITY = 0.85;

/** Entrée du prétraitement : URI de la photo + dimensions connues de la frame. */
export type OcrPreprocessInput = {
  uri: string;
  width: number;
  height: number;
};

export interface OcrImagePreprocessor {
  preprocess(input: OcrPreprocessInput): Promise<string | null>;
}

/**
 * Calcule le redimensionnement cible (pur, testable) : redimensionne uniquement
 * si le côté le plus long dépasse `maxDimension` (jamais d'upscale).
 *
 * @returns les nouvelles dimensions, ou `null` si aucun redimensionnement requis.
 */
export function planOcrResize(
  width: number,
  height: number,
  maxDimension: number = OCR_MAX_DIMENSION,
): { width: number; height: number } | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  const scale = Math.min(1, maxDimension / Math.max(width, height));
  if (scale >= 1) {
    return null;
  }
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

/**
 * Implémentation native du prétraitement (expo-image-manipulator), masquée par
 * un import paresseux pour ne pas bloquer la CI. En cas d'échec, retourne `null` :
 * l'appelant utilise alors l'image d'origine (rétrogradation silencieuse).
 */
export class ExpoImagePreprocessor implements OcrImagePreprocessor {
  async preprocess(input: OcrPreprocessInput): Promise<string | null> {
    if (!input.uri) {
      return null;
    }
    try {
      // Import paresseux : le module natif n'existe que sur le Development Build.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { manipulateAsync, SaveFormat } =
        require('expo-image-manipulator') as typeof import('expo-image-manipulator');
      const resize = planOcrResize(input.width, input.height, OCR_MAX_DIMENSION);
      const actions = resize ? [{ resize }] : [];
      const { uri } = await manipulateAsync(input.uri, actions, {
        compress: OCR_OUTPUT_QUALITY,
        format: SaveFormat.JPEG,
      });
      return uri || null;
    } catch (error) {
      // Module natif absent (hors Dev Build) ou échec de manipulation :
      // on retombe sur l'image d'origine sans casser l'analyse.
      console.warn('Prétraitement OCR indisponible, image d’origine conservée.', error);
      return null;
    }
  }
}

/** Prétraitement inerte (repli CI-safe) : renvoie l'image telle quelle. */
export class NoopImagePreprocessor implements OcrImagePreprocessor {
  async preprocess(input: OcrPreprocessInput): Promise<string | null> {
    return input.uri || null;
  }
}
