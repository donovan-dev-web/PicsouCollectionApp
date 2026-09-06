/** Slugifie un libellé FR pour un testID stable (minuscules, sans accents, espaces → '-'). */
export function slug(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
