import { describe, expect, it } from 'vitest';
import {
  getSeatStatusLabel,
  getSeatTypeLabel,
  getSeatVisualClass,
  normalizeSeatStatus,
  normalizeSeatType,
  toApiSeatStatus,
  toApiSeatType,
} from './seatPresentation';

describe('seatPresentation', () => {
  it('normalizes backend and legacy seat types', () => {
    expect(normalizeSeatType('REGULAR')).toBe('normal');
    expect(normalizeSeatType('regular')).toBe('normal');
    expect(normalizeSeatType('SWEET_BOX')).toBe('sweetbox');
    expect(normalizeSeatType('WHEELCHAIR')).toBe('wheelchair');
    expect(toApiSeatType('normal')).toBe('REGULAR');
  });

  it('normalizes physical and showtime seat statuses for display', () => {
    expect(normalizeSeatStatus('ACTIVE')).toBe('available');
    expect(normalizeSeatStatus('DISABLED')).toBe('blocked');
    expect(normalizeSeatStatus('RESERVED')).toBe('held');
    expect(normalizeSeatStatus('BOOKED')).toBe('booked');
  });

  it('writes only physical seat statuses from the admin helper', () => {
    expect(toApiSeatStatus('available')).toBe('ACTIVE');
    expect(toApiSeatStatus('blocked')).toBe('DISABLED');
    expect(toApiSeatStatus('maintenance')).toBe('MAINTENANCE');
    expect(() => toApiSeatStatus('held')).toThrow(/suất chiếu/i);
    expect(() => toApiSeatStatus('booked')).toThrow(/suất chiếu/i);
  });

  it('uses status before type when choosing visual classes', () => {
    expect(getSeatVisualClass({ type: 'VIP', status: 'BOOKED' })).toBe('seat-booked');
    expect(getSeatVisualClass({ type: 'VIP', status: 'ACTIVE' })).toBe('seat-vip');
    expect(getSeatVisualClass({ type: 'COUPLE', status: 'AVAILABLE' }, { selected: true })).toBe('bg-primary text-primary-foreground');
  });

  it('provides consistent Vietnamese labels', () => {
    expect(getSeatTypeLabel('REGULAR')).toBe('Thường');
    expect(getSeatTypeLabel('WHEELCHAIR')).toBe('Xe lăn');
    expect(getSeatStatusLabel('MAINTENANCE')).toBe('Bảo trì');
  });
});
