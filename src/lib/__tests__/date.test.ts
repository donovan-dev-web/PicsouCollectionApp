import { formatDateLong, formatDateShort } from '@/lib/date';

describe('formatDateLong', () => {
  it('formate une date ISO valide en mois abrégé', () => {
    const result = formatDateLong('2026-09-01T10:00:00Z');
    expect(result).toMatch(/1\s.*2026/);
  });

  it('retourne la tranche brute si la date est invalide', () => {
    expect(formatDateLong('not-a-date')).toBe('not-a-date');
  });

  it('retourne Inconnue si nul', () => {
    expect(formatDateLong(null)).toBe('Inconnue');
  });
});

describe('formatDateShort', () => {
  it('formate une date ISO valide en format court', () => {
    const result = formatDateShort('2026-09-01T10:00:00Z');
    expect(result).toMatch(/1\/09\/2026/);
  });

  it('retourne Inconnue si la date est invalide', () => {
    expect(formatDateShort('not-a-date')).toBe('Inconnue');
  });

  it('retourne Inconnue si nul', () => {
    expect(formatDateShort(null)).toBe('Inconnue');
  });
});
