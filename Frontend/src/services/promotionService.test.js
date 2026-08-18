import { describe, expect, it } from 'vitest';
import {
  normalizePromotion,
  normalizePromotionCode,
  toPromotionCodePayload,
  toPromotionPayload,
} from './promotionService';

describe('promotionService backend adapters', () => {
  it('maps promotion rule aliases to the exact backend request fields', () => {
    const payload = toPromotionPayload({
      name: ' Summer ',
      description: ' Sale ',
      discountType: 'percentage',
      discountValue: '15',
      maxDiscount: '50000',
      minPurchase: '200000',
      startDate: '2026-08-18T10:00:00+07:00',
      endDate: '2026-08-31T23:59:00+07:00',
      usageLimit: '100',
      usagePerUser: '2',
      status: 'active',
    });

    expect(payload).toMatchObject({
      name: 'Summer',
      description: 'Sale',
      discountType: 'PERCENTAGE',
      discountValue: 15,
      maxDiscountAmount: 50000,
      minimumOrderAmount: 200000,
      usageLimit: 100,
      usagePerUser: 2,
      status: 'ACTIVE',
    });
    expect(payload.startAt).toContain('2026-08-18T03:00:00');
  });

  it('normalizes backend promotion response aliases for UI', () => {
    const result = normalizePromotion({
      id: 'promotion-1',
      discountValue: 10,
      minimumOrderAmount: 150000,
      maxDiscountAmount: 30000,
      startAt: '2026-08-18T00:00:00Z',
      endAt: '2026-08-20T00:00:00Z',
      usageLimit: 50,
      usagePerUser: 1,
      status: 'ACTIVE',
    });
    expect(result.minimumOrderAmount).toBe(150000);
    expect(result.startDate).toBe('2026-08-18T00:00:00Z');
    expect(result.isActive).toBe(true);
  });

  it('builds and normalizes PromotionCode payloads', () => {
    const payload = toPromotionCodePayload('promotion-1', {
      code: ' summer_26 ',
      usageLimit: '25',
      usedCount: '3',
      active: true,
    });
    expect(payload).toEqual({
      promotionId: 'promotion-1',
      code: 'SUMMER_26',
      usageLimit: 25,
      usedCount: 3,
      active: true,
    });

    expect(normalizePromotionCode(payload)).toMatchObject({
      code: 'SUMMER_26',
      usageLimit: 25,
      usedCount: 3,
      active: true,
    });
  });
});
