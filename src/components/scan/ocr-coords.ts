/**
 * Conversion des coordonnées des zones OCR (référentiel image) vers l'écran
 * (M-12, US-OCR-05 / M12-05) — modulo **pur et testable**.
 *
 * La photo est affichée en mode `contain` : on calcule l'échelle et le décalage
 * (letterbox) à partir des dimensions de l'image (`width`×`height`) et de la
 * zone d'affichage (`viewWidth`×`viewHeight`), puis on projette chaque boîte.
 */

export type Box = { x: number; y: number; width: number; height: number };

export type ContainFit = {
  scale: number;
  offsetX: number;
  offsetY: number;
  renderedWidth: number;
  renderedHeight: number;
};

export function containFit(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): ContainFit | null {
  if (imageWidth <= 0 || imageHeight <= 0 || viewWidth <= 0 || viewHeight <= 0) {
    return null;
  }
  const scale = Math.min(viewWidth / imageWidth, viewHeight / imageHeight);
  const renderedWidth = imageWidth * scale;
  const renderedHeight = imageHeight * scale;
  return {
    scale,
    offsetX: (viewWidth - renderedWidth) / 2,
    offsetY: (viewHeight - renderedHeight) / 2,
    renderedWidth,
    renderedHeight,
  };
}

export function mapBoxToView(box: Box, fit: ContainFit): Box {
  return {
    x: box.x * fit.scale + fit.offsetX,
    y: box.y * fit.scale + fit.offsetY,
    width: box.width * fit.scale,
    height: box.height * fit.scale,
  };
}

/** Projection complète image → vue (contient + échelle + décalage). */
export function mapBoxToViewRect(
  box: Box,
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
): Box | null {
  const fit = containFit(imageWidth, imageHeight, viewWidth, viewHeight);
  return fit ? mapBoxToView(box, fit) : null;
}
