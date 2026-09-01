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
import paymentService from './paymentService';

describe('paymentService contracts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('khởi tạo thanh toán member bằng provider viết hoa', async () => {
    apiClient.post.mockResolvedValue({
      data: {
        id: 'payment-1',
        provider: 'MOMO',
        status: 'PENDING',
        paymentUrl: 'https://example.test/pay',
      },
    });

    const result = await paymentService.initiatePayment('booking-1', 'momo');

    expect(apiClient.post).toHaveBeenCalledWith('/payments/initiate', {
      bookingId: 'booking-1',
      provider: 'MOMO',
    });
    expect(result.provider).toBe('MOMO');
  });

  it('đọc trạng thái payment theo provider order bằng endpoint member-safe', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 'payment-2', status: 'SUCCESS' } });

    const result = await paymentService.getPaymentByProviderOrderId('momo', 'HC order/1');

    expect(apiClient.get).toHaveBeenCalledWith('/payments/provider/MOMO/order/HC%20order%2F1');
    expect(result.status).toBe('SUCCESS');
  });

  it('không dùng transaction lookup cho member callback', async () => {
    apiClient.get.mockResolvedValue({ data: { id: 'payment-3' } });

    await paymentService.getPaymentByProviderOrderId('MOMO', 'HC-123');

    expect(apiClient.get).not.toHaveBeenCalledWith('/payments/transaction/HC-123');
  });
});
