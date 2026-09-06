import { OcrTextStabilizer } from '@/identification/ocr/ocrTextStabilizer';

describe('OcrTextStabilizer', () => {
  it('ne stabilise pas avant le seuil de lectures', () => {
    const stabilizer = new OcrTextStabilizer(2);
    expect(stabilizer.push('Picsou Magazine|547|2023')).toBeNull();
    expect(stabilizer.push('Picsou Magazine|547|2023')).toBe('Picsou Magazine|547|2023');
  });

  it('supporte un seuil paramétrable', () => {
    const stabilizer = new OcrTextStabilizer(3);
    expect(stabilizer.push('Picsou Magazine|547|')).toBeNull();
    expect(stabilizer.push('Picsou Magazine|547|')).toBeNull();
    expect(stabilizer.push('Picsou Magazine|547|')).toBe('Picsou Magazine|547|');
  });

  it('requiert des lectures consécutives identiques', () => {
    const stabilizer = new OcrTextStabilizer(2);
    stabilizer.push('Picsou Magazine|547|2023');
    expect(stabilizer.push('Picsou Magazine|900|2023')).toBeNull();
    expect(stabilizer.push('Picsou Magazine|900|2023')).toBe('Picsou Magazine|900|2023');
  });

  it('ignore les lectures vides', () => {
    const stabilizer = new OcrTextStabilizer(1);
    expect(stabilizer.push('   ')).toBeNull();
    expect(stabilizer.push('')).toBeNull();
    expect(stabilizer.push('Picsou Magazine|547|')).toBe('Picsou Magazine|547|');
  });

  it('reset repart de zéro', () => {
    const stabilizer = new OcrTextStabilizer(2);
    stabilizer.push('Picsou Magazine|547|');
    stabilizer.push('Picsou Magazine|547|');
    stabilizer.reset();
    expect(stabilizer.push('Picsou Magazine|547|')).toBeNull();
  });
});
