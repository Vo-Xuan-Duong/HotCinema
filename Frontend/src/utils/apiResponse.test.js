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
    expect(unwrapApiArray({ data: { items: [1, 2], pagination: { page: 0, pageSize: 2 } } })).toEqual([1, 2]);
  });

  it('normalizes the backend PageResponse shape to frontend page aliases', () => {
    const page = unwrapApiPage({
      data: {
        items: [{ id: 1 }, { id: 2 }],
        pagination: {
          page: 1,
          pageSize: 2,
          totalItems: 7,
          totalPages: 4,
          hasNext: true,
          hasPrevious: true,
        },
      },
    });

    expect(page.content).toEqual([{ id: 1 }, { id: 2 }]);
    expect(page.number).toBe(1);
    expect(page.size).toBe(2);
    expect(page.totalElements).toBe(7);
    expect(page.total).toBe(7);
    expect(page.totalPages).toBe(4);
    expect(page.first).toBe(false);
    expect(page.last).toBe(false);
  });

  it('preserves an already conventional page response', () => {
    const page = { content: [1], number: 0, totalElements: 1, totalPages: 1 };
    expect(unwrapApiPage(page)).toBe(page);
  });

  it('returns safe defaults for invalid array/page shapes', () => {
    expect(unwrapApiArray(null)).toEqual([]);
    expect(unwrapApiPage(null)).toEqual({});
  });
});
