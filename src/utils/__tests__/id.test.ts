import { generateId } from '@/utils/id';

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => '5f4f8c1a-0000-4000-8000-000000000001'),
}));

describe('generateId', () => {
  it('retourne un UUID via expo-crypto', () => {
    expect(generateId()).toBe('5f4f8c1a-0000-4000-8000-000000000001');
  });
});
