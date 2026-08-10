import { describe, expect, it } from 'vitest';
import { unwrapApiArray, unwrapApiData, unwrapApiPage } from './apiResponse';

describe('apiResponse', () => {
  it('returns direct payload unchanged', () => {
    const payload = { id: 1, name: 'HotCinema' };
    expect(unwrapApiData(payload)).toBe(payload);
  });

  it('unwraps data envelopes including nested ResponseData shapes', () => {
    const payload = { id: 1 };
    expect(unwrapApiData({ data: payload })).toBe(payload);
    expect(unwrapApiData({ statusCode: 200, message: 'OK', data: { data: payload } })).toBe(payload);
  });

  it('does not unwrap a domain object just because it has a data field', () => {
    const payload = { id: 1, data: { seats: 100 }, name: 'Room A' };
    expect(unwrapApiData(payload)).toBe(payload);
  });

  it('normalizes arrays from direct, enveloped and paged responses', () => {
    expect(unwrapApiArray([1, 2])).toEqual([1, 2]);
    expect(unwrapApiArray({ data: [1, 2] })).toEqual([1, 2]);
    expect(unwrapApiArray({ statusCode: 200, data: { content: [1, 2] } })).toEqual([1, 2]);
  });

  it('returns safe defaults for invalid array/page shapes', () => {
    expect(unwrapApiArray(null)).toEqual([]);
    expect(unwrapApiPage(null)).toEqual({});
  });
});
