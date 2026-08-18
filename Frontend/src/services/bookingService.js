import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { BOOKING_STATUS, ENDPOINTS } from '@/utils/constants';
import { getUserInfo } from '@/utils/authStorage';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { isEndpointUnavailable, rethrowCapabilityError } from '@/utils/backendCapability';
import { normalizeResourceId, normalizeResourceIds, sameResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.BOOKINGS;
const pageContent = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const normalizeStatus = (status) => String(status || '').trim().toUpperCase();

const bookingService = {
  async listPage(params = {}) {
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async list(params = {}) {
    const result = await this.listPage({ page: 0, size: 500, ...params });
    return Array.isArray(result) ? result : result?.content || [];
  },

  async getBookingById(bookingId) {
    return unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(bookingId)}`));
  },

  async getBookingByCode(bookingCode) {
    const code = String(bookingCode || '').trim();
    try {
      return unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(code)}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = await this.list({ page: 0, size: 500 });
      return rows.find((item) => String(item.bookingCode || '').toUpperCase() === code.toUpperCase()) || null;
    }
  },

  async createBooking(data = {}) {
    const payload = {
      showtimeId: normalizeResourceId(data.showtimeId),
      seatIds: normalizeResourceIds(data.seatIds || []),
      promotionCode: data.promotionCode ? String(data.promotionCode).trim() : null,
      concessions: Array.isArray(data.concessions) ? data.concessions : undefined,
    };

    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.post(base, payload));
    }

    try {
      // Real checkout is a business transaction. Do not fall back to the
      // entity CRUD POST /bookings because that endpoint currently accepts
      // client-owned totals/status/timestamps and cannot atomically hold seats.
      return unwrapApiData(await apiClient.post(`${base}/checkout`, payload));
    } catch (error) {
      rethrowCapabilityError('tạo booking/checkout an toàn', error);
    }
  },

  async updateBooking(bookingId, data) {
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(bookingId)}`, data));
  },

  async updateBookingStatus(bookingId, status) {
    const id = normalizeResourceId(bookingId);
    const normalizedStatus = normalizeStatus(status);
    try {
      return unwrapApiData(await apiClient.patch(`${base}/${id}/status`, { status: normalizedStatus }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      // Compatibility fallback is retained for admin/cancel UX only. The
      // backend remains authoritative for payment, ticket and seat state.
      const current = await this.getBookingById(id);
      return this.updateBooking(id, { ...current, status: normalizedStatus });
    }
  },

  async deleteBooking(bookingId) {
    return apiClient.delete(`${base}/${normalizeResourceId(bookingId)}`);
  },

  async getMyBookings(params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/my-bookings`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const user = getUserInfo();
      if (!user?.id) return { content: [], totalElements: 0, totalPages: 0, number: 0, size: params.size || 10 };
      const response = await apiClient.get(base, { params: { page: 0, size: 500 } });
      const mine = pageContent(response).filter((item) => sameResourceId(item.userId ?? item.user?.id, user.id));
      const page = Math.max(0, Number(params.page || 0));
      const size = Math.max(1, Number(params.size || 10));
      const start = page * size;
      return {
        content: mine.slice(start, start + size),
        totalElements: mine.length,
        totalPages: Math.ceil(mine.length / size),
        number: page,
        page,
        size,
      };
    }
  },

  async getMyBookingHistory(params = {}) {
    try {
      return unwrapApiArray(await apiClient.get(`${base}/my-bookings/history`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const result = await this.getMyBookings({ ...params, page: 0, size: 500 });
      return result?.content || [];
    }
  },

  async getBookingHistoryByUserId(userId, params = {}) {
    const id = normalizeResourceId(userId);
    try {
      return unwrapApiData(await apiClient.get(`${base}/history/user/${id}`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = await this.list({ page: 0, size: 500 });
      const filtered = rows.filter((item) => sameResourceId(item.userId ?? item.user?.id, id));
      const page = Math.max(0, Number(params.page || 0));
      const size = Math.max(1, Number(params.size || 10));
      const start = page * size;
      return {
        content: filtered.slice(start, start + size),
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        number: page,
        page,
        size,
      };
    }
  },

  async getUserBookings(userId, params = {}) {
    const id = normalizeResourceId(userId);
    try {
      return unwrapApiData(await apiClient.get(`${base}/user/${id}`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return this.getBookingHistoryByUserId(id, params);
    }
  },

  async getBookingStats(params) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/statistics`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = await this.list({ page: 0, size: 500 });
      return {
        totalBookings: rows.length,
        totalAmount: rows.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
      };
    }
  },

  async getBookingCountByStatus() {
    try {
      return unwrapApiData(await apiClient.get(`${base}/count-by-status`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = await this.list({ page: 0, size: 500 });
      return rows.reduce((acc, item) => {
        const status = normalizeStatus(item.status || 'UNKNOWN');
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    }
  },

  async confirmPayment(bookingId, paymentData) {
    try {
      return unwrapApiData(await apiClient.post(`${base}/${normalizeResourceId(bookingId)}/payment/confirm`, paymentData));
    } catch (error) {
      rethrowCapabilityError('xác nhận thanh toán', error);
    }
  },

  async processRefund(bookingId, refundData) {
    try {
      return unwrapApiData(await apiClient.post(`${base}/${normalizeResourceId(bookingId)}/refund`, refundData));
    } catch (error) {
      rethrowCapabilityError('hoàn tiền', error);
    }
  },

  async validateBookingCode(bookingCode) {
    try {
      const direct = await apiClient.get(`${base}/validate/${encodeURIComponent(bookingCode)}`);
      return Boolean(unwrapApiData(direct));
    } catch (error) {
      if (!isEndpointUnavailable(error)) return false;
      return Boolean(await this.getBookingByCode(bookingCode));
    }
  },

  async checkSeatAvailability(showtimeId, seatIds) {
    try {
      return unwrapApiData(await apiClient.post(`${base}/check-availability`, {
        showtimeId: normalizeResourceId(showtimeId),
        seatIds: normalizeResourceIds(seatIds),
      }));
    } catch (error) {
      rethrowCapabilityError('kiểm tra ghế theo thời gian thực', error);
    }
  },

  async exportBookings(params) {
    try {
      return await apiClient.get(`${base}/export`, { params, responseType: 'blob' });
    } catch (error) {
      rethrowCapabilityError('xuất danh sách booking', error);
    }
  },

  async downloadTicket(bookingCode) {
    try {
      return await apiClient.get(`${base}/code/${encodeURIComponent(bookingCode)}/qr`, { responseType: 'blob' });
    } catch (error) {
      rethrowCapabilityError('tải QR booking', error);
    }
  },

  getStatusDisplayName(status) {
    const normalized = normalizeStatus(status);
    const statusNames = {
      [BOOKING_STATUS.PENDING]: 'Chờ xử lý',
      [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
      [BOOKING_STATUS.CANCELLED]: 'Đã hủy',
      [BOOKING_STATUS.COMPLETED]: 'Hoàn thành',
    };
    return statusNames[normalized] || status;
  },

  formatBookingCode(code) {
    if (!code) return '';
    return String(code).toUpperCase().replace(/(.{3})/g, '$1-').replace(/-$/, '');
  },
};

export default bookingService;
