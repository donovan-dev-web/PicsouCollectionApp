import { Colors, Spacing } from '@/constants/theme';

describe('theme tokens', () => {
  it('définit les deux modes de couleur avec les mêmes clés', () => {
    const lightKeys = Object.keys(Colors.light).sort();
    const darkKeys = Object.keys(Colors.dark).sort();
    expect(lightKeys).toEqual(darkKeys);
  });

  it('utilise le jaune Picsou pour le accent dans les deux modes', () => {
    expect(Colors.light.accent).toBe(Colors.dark.accent);
    expect(Colors.light.accent).toBe('#FDD835');
  });

  it('définit des espacements croissants', () => {
    expect(Spacing.two).toBeLessThan(Spacing.three);
    expect(Spacing.three).toBeLessThan(Spacing.four);
  });
});
