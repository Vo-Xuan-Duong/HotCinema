import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { BOOKING_STATUS, ENDPOINTS } from '@/utils/constants';
import { getUserInfo } from '@/utils/authStorage';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { isEndpointUnavailable, rethrowCapabilityError } from '@/utils/backendCapability';
import { isUuid, normalizeResourceId, normalizeResourceIds, sameResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.BOOKINGS;

const pageContent = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const normalizeStatus = (status) => String(status || '').trim().toUpperCase();

const paginate = (rows, params = {}) => {
  const page = Math.max(0, Number(params.page || 0));
  const size = Math.max(1, Number(params.size || 10));
  const start = page * size;
  return {
    content: rows.slice(start, start + size),
    totalElements: rows.length,
    totalPages: Math.ceil(rows.length / size),
    number: page,
    page,
    size,
  };
};

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

  async getAdminBooking(identifier) {
    const normalized = normalizeResourceId(identifier);
    if (normalized == null) return null;

    // Real backend booking ids are UUIDs; mock ids are numeric. Prefer the
    // direct entity endpoint whenever the route already contains such an id.
    if (typeof normalized === 'number' || isUuid(normalized)) {
      return this.getBookingById(normalized);
    }

    // Admin screens are allowed to use the administrative collection to map a
    // human booking code to its entity. Customer screens must never use this
    // fallback; they use getMyBookings/getBookingByCode ownership commands.
    const rows = await this.list({ page: 0, size: 500 });
    const code = String(identifier).trim().toUpperCase();
    return rows.find((item) => String(item.bookingCode || item.code || '').trim().toUpperCase() === code) || null;
  },

  async getBookingByCode(bookingCode) {
    const code = String(bookingCode || '').trim();
    try {
      return unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(code)}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      if (!MOCK_API_ENABLED) rethrowCapabilityError('tra cứu booking theo mã có kiểm soát ownership', error);
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
      // entity CRUD POST /bookings because it accepts client-owned totals,
      // statuses and timestamps and cannot atomically hold seats.
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
      if (MOCK_API_ENABLED) {
        const current = await this.getBookingById(id);
        return this.updateBooking(id, { ...current, status: normalizedStatus });
      }
      // BookingUpdateRequest contains monetary totals and lifecycle timestamps.
      // Replaying that DTO from the browser just to change status would make
      // client data authoritative for booking state.
      rethrowCapabilityError('đổi trạng thái booking bằng command backend', error);
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
      if (!MOCK_API_ENABLED) {
        // Never GET the entire booking collection in a customer session and
        // filter by userId in the browser. Ownership must be server-enforced.
        rethrowCapabilityError('danh sách booking của người dùng có kiểm soát ownership', error);
      }
      const user = getUserInfo();
      if (!user?.id) return paginate([], params);
      const response = await apiClient.get(base, { params: { page: 0, size: 500 } });
      const mine = pageContent(response).filter((item) => sameResourceId(item.userId ?? item.user?.id, user.id));
      return paginate(mine, params);
    }
  },

  async getMyBookingHistory(params = {}) {
    try {
      return unwrapApiArray(await apiClient.get(`${base}/my-bookings/history`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      if (!MOCK_API_ENABLED) rethrowCapabilityError('lịch sử booking của người dùng có kiểm soát ownership', error);
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
      if (!MOCK_API_ENABLED) rethrowCapabilityError('lịch sử booking theo user có authorization backend', error);
      const rows = await this.list({ page: 0, size: 500 });
      return paginate(rows.filter((item) => sameResourceId(item.userId ?? item.user?.id, id)), params);
    }
  },

  async getUserBookings(userId, params = {}) {
    const id = normalizeResourceId(userId);
    try {
      return unwrapApiData(await apiClient.get(`${base}/user/${id}`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      if (!MOCK_API_ENABLED) rethrowCapabilityError('booking theo user có authorization backend', error);
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
      if (!MOCK_API_ENABLED) rethrowCapabilityError('xác thực booking code', error);
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

  isBookingStatusCommandSupported() {
    return MOCK_API_ENABLED;
  },

  isBookingDeleteRecommended() {
    return MOCK_API_ENABLED;
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
