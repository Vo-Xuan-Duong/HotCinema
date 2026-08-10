import { describe, expect, it } from 'vitest';
import { unwrapApiArray, unwrapApiData, unwrapApiPage } from './apiResponse';

describe('apiResponse', () => {
  it('returns direct payload unchanged', () => {
    const payload = { id: 1, name: 'HotCinema' };
    expect(unwrapApiData(payload)).toBe(payload);
  });

  it('unwraps a data envelope once', () => {
    const payload = { id: 1 };
    expect(unwrapApiData({ data: payload })).toBe(payload);
  });

  it('normalizes arrays from direct, enveloped and paged responses', () => {
    expect(unwrapApiArray([1, 2])).toEqual([1, 2]);
    expect(unwrapApiArray({ data: [1, 2] })).toEqual([1, 2]);
    expect(unwrapApiArray({ data: { content: [1, 2] } })).toEqual([1, 2]);
  });

  it('returns safe defaults for invalid array/page shapes', () => {
    expect(unwrapApiArray(null)).toEqual([]);
    expect(unwrapApiPage(null)).toEqual({});
  });
});
