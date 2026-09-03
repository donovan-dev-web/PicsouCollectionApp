import { BarcodeStabilizer } from '@/identification/barcodeStabilizer';

describe('BarcodeStabilizer', () => {
  it('retourne null tant que le code n est pas répété (seuil par défaut 3)', () => {
    const stabilizer = new BarcodeStabilizer();
    expect(stabilizer.push('3271234000011')).toBeNull();
    expect(stabilizer.push('3271234000011')).toBeNull();
    expect(stabilizer.push('3271234000011')).toBe('3271234000011');
  });

  it('retourne le code dès que le seuil configuré est atteint', () => {
    const stabilizer = new BarcodeStabilizer(2);
    expect(stabilizer.push('ABC123')).toBeNull();
    expect(stabilizer.push('ABC123')).toBe('ABC123');
  });

  it('réinitialise le compteur si un code différent apparaît (anti faux positif)', () => {
    const stabilizer = new BarcodeStabilizer(3);
    stabilizer.push('A');
    stabilizer.push('A');
    // un code parasite interrompt la séquence
    expect(stabilizer.push('B')).toBeNull();
    // il faut relire 'A' trois fois de plus pour le stabiliser
    expect(stabilizer.push('A')).toBeNull();
    expect(stabilizer.push('A')).toBeNull();
    expect(stabilizer.push('A')).toBe('A');
  });

  it('ignore les lectures vides', () => {
    const stabilizer = new BarcodeStabilizer(1);
    expect(stabilizer.push('   ')).toBeNull();
    expect(stabilizer.push('')).toBeNull();
  });

  it('normalise la casse/espaces par trim avant comparaison', () => {
    const stabilizer = new BarcodeStabilizer(2);
    expect(stabilizer.push(' 3271234000011 ')).toBeNull();
    expect(stabilizer.push('3271234000011')).toBe('3271234000011');
  });

  it('reset réinitialise l accumulation en cours', () => {
    const stabilizer = new BarcodeStabilizer(2);
    stabilizer.push('X');
    stabilizer.push('X');
    stabilizer.reset();
    expect(stabilizer.push('X')).toBeNull();
  });
});
