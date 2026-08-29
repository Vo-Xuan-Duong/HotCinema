import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/utils/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from '@/utils/apiClient';
import concessionService from './concessionService';

describe('concessionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lấy đúng danh sách combo đang bán theo rạp', async () => {
    apiClient.get.mockResolvedValue({
      data: [
        { id: 'cp-1', productName: 'Combo bắp nước', price: 89000 },
      ],
    });

    const result = await concessionService.listAvailableByCinema('cinema-1');

    expect(apiClient.get).toHaveBeenCalledWith('/cinemaproducts/cinema/cinema-1/available');
    expect(result).toEqual([
      { id: 'cp-1', productName: 'Combo bắp nước', price: 89000 },
    ]);
  });

  it('không gọi API khi chưa có cinemaId', async () => {
    const result = await concessionService.listAvailableByCinema(null);

    expect(result).toEqual([]);
    expect(apiClient.get).not.toHaveBeenCalled();
  });
});
