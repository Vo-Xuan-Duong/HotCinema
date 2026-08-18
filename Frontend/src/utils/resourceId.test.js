import { describe, expect, it } from 'vitest';
import { isUuid, normalizeResourceId, normalizeResourceIds, sameResourceId } from './resourceId';

describe('resourceId helpers', () => {
  it('preserves backend UUIDs without numeric coercion', () => {
    const id = '7d6ef681-b437-4dc6-91e2-18ba98f32d13';
    expect(normalizeResourceId(id)).toBe(id);
    expect(isUuid(id)).toBe(true);
  });

  it('keeps numeric mock identifiers compatible', () => {
    expect(normalizeResourceId('42')).toBe(42);
    expect(normalizeResourceId(42)).toBe(42);
    expect(sameResourceId('42', 42)).toBe(true);
  });

  it('deduplicates mixed identifier collections', () => {
    expect(normalizeResourceIds(['5', 5, null, '', '6'])).toEqual([5, 6]);
  });

  it('never truncates non-numeric string identifiers', () => {
    expect(normalizeResourceId('7d6ef681-custom')).toBe('7d6ef681-custom');
  });
});
