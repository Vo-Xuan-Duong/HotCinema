import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/utils/apiClient';
import bookingService from './bookingService';

describe('bookingService member contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gửi ghế, combo và mã giảm giá đúng checkout contract', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 'booking-1', totalAmount: 250000 } });

    const result = await bookingService.createBooking({
      seatIds: ['seat-1', 'seat-2'],
      items: [{ cinemaProductId: 'combo-1', quantity: 2 }],
      promotionCode: 'HOT20',
    });

    expect(apiClient.post).toHaveBeenCalledWith('/bookings/checkout', {
      seatIds: ['seat-1', 'seat-2'],
      items: [{ cinemaProductId: 'combo-1', quantity: 2 }],
      promotionCode: 'HOT20',
    });
    expect(result).toEqual({ id: 'booking-1', totalAmount: 250000 });
  });

  it('mặc định items là mảng rỗng để tương thích booking chỉ ghế', async () => {
    apiClient.post.mockResolvedValue({ data: { id: 'booking-2' } });

    await bookingService.createBooking({ seatIds: ['seat-1'] });

    expect(apiClient.post).toHaveBeenCalledWith('/bookings/checkout', {
      seatIds: ['seat-1'],
      items: [],
      promotionCode: null,
    });
  });

  it('đọc lịch sử của chính member thay vì endpoint admin', async () => {
    apiClient.get.mockResolvedValue({ data: [{ id: 'booking-3' }] });

    const result = await bookingService.getMyBookingHistory();

    expect(apiClient.get).toHaveBeenCalledWith('/bookings/my-bookings/history', { params: undefined });
    expect(result).toEqual([{ id: 'booking-3' }]);
  });

  it('dùng endpoint member riêng cho cancel và refund', async () => {
    apiClient.post
      .mockResolvedValueOnce({ data: { id: 'booking-4', status: 'CANCELLED' } })
      .mockResolvedValueOnce({ data: { id: 'booking-5', status: 'REFUNDED' } });

    await bookingService.cancelMyBooking('booking-4');
    await bookingService.refundMyBooking('booking-5');

    expect(apiClient.post).toHaveBeenNthCalledWith(1, '/bookings/booking-4/cancel');
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/bookings/booking-5/refund');
  });
});
