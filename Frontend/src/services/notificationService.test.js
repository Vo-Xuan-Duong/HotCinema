import { describe, expect, it } from 'vitest';
import {
  normalizeNotification,
  toNotificationUpdatePayload,
} from './notificationService';

describe('notificationService dto adapters', () => {
  it('normalizes read aliases without losing backend fields', () => {
    expect(normalizeNotification({
      id: 'notification-1',
      isRead: false,
      type: 'SYSTEM',
    })).toMatchObject({
      id: 'notification-1',
      isRead: false,
      read: false,
      type: 'SYSTEM',
    });
  });

  it('builds the complete NotificationUpdateRequest shape', () => {
    const result = toNotificationUpdatePayload({
      userId: '11111111-1111-4111-8111-111111111111',
      type: 'promotion',
      title: 'Khuyến mãi',
      content: 'Nội dung',
      isRead: false,
      createdAt: '2026-08-18T02:00:00.000Z',
    }, {
      isRead: true,
      readAt: '2026-08-18T03:00:00.000Z',
    });

    expect(result).toEqual({
      userId: '11111111-1111-4111-8111-111111111111',
      type: 'PROMOTION',
      title: 'Khuyến mãi',
      content: 'Nội dung',
      isRead: true,
      readAt: '2026-08-18T03:00:00.000Z',
    });
  });
});
