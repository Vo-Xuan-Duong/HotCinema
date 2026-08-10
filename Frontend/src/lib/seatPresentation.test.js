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
    expect(toApiSeatType('normal')).toBe('REGULAR');
  });

  it('normalizes backend and websocket seat statuses', () => {
    expect(normalizeSeatStatus('RESERVED')).toBe('held');
    expect(normalizeSeatStatus('blocked')).toBe('blocked');
    expect(toApiSeatStatus('held')).toBe('HELD');
  });

  it('uses status before type when choosing visual classes', () => {
    expect(getSeatVisualClass({ type: 'VIP', status: 'BOOKED' })).toBe('seat-booked');
    expect(getSeatVisualClass({ type: 'VIP', status: 'AVAILABLE' })).toBe('seat-vip');
    expect(getSeatVisualClass({ type: 'COUPLE', status: 'AVAILABLE' }, { selected: true })).toBe('bg-primary text-primary-foreground');
  });

  it('provides consistent Vietnamese labels', () => {
    expect(getSeatTypeLabel('REGULAR')).toBe('Thường');
    expect(getSeatStatusLabel('MAINTENANCE')).toBe('Bảo trì');
  });
});
