import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { BOOKING_STATUS, ENDPOINTS } from '@/utils/constants';

const base = ENDPOINTS.BOOKINGS;

const bookingService = {
  async listPage(params) {
    return unwrapApiData(await apiClient.get(`${base}/page`, { params }));
  },

  async list(params) {
    return unwrapApiArray(await apiClient.get(base, { params }));
  },

  async getBookingById(bookingId) {
    return unwrapApiData(await apiClient.get(`${base}/${bookingId}`));
  },

  async getBookingByCode(bookingCode) {
    return unwrapApiData(await apiClient.get(`${base}/code/${bookingCode}`));
  },

  async createBooking(data) {
    const payload = {
      seatIds: data?.seatIds || [],
      items: Array.isArray(data?.items) ? data.items : [],
      promotionCode: data?.promotionCode || null,
    };
    return unwrapApiData(await apiClient.post(`${base}/checkout`, payload));
  },

  async updateBooking(bookingId, data) {
    return unwrapApiData(await apiClient.put(`${base}/${bookingId}`, data));
  },

  async updateBookingStatus(bookingId, status) {
    return unwrapApiData(await apiClient.patch(`${base}/${bookingId}/status`, { status }));
  },

  async cancelMyBooking(bookingId) {
    return unwrapApiData(await apiClient.post(`${base}/${bookingId}/cancel`));
  },

  async deleteBooking(bookingId) {
    return unwrapApiData(await apiClient.delete(`${base}/${bookingId}`));
  },

  async getMyBookings(params) {
    return unwrapApiData(await apiClient.get(`${base}/my-bookings`, { params }));
  },

  async getMyBookingHistory(params) {
    return unwrapApiArray(await apiClient.get(`${base}/my-bookings/history`, { params }));
  },

  async getBookingHistoryByUserId(userId, params = {}) {
    return unwrapApiData(await apiClient.get(`${base}/history/user/${userId}`, { params }));
  },

  async getUserBookings(userId, params) {
    return unwrapApiData(await apiClient.get(`${base}/user/${userId}`, { params }));
  },

  async getBookingStats(params) {
    return unwrapApiData(await apiClient.get(`${base}/statistics`, { params }));
  },

  async getBookingCountByStatus() {
    return unwrapApiData(await apiClient.get(`${base}/count-by-status`));
  },

  async confirmPayment(bookingId, paymentData) {
    return unwrapApiData(await apiClient.post(`${base}/${bookingId}/payment/confirm`, paymentData));
  },

  async processRefund(bookingId, refundData) {
    return unwrapApiData(await apiClient.post(`${base}/${bookingId}/refund`, refundData));
  },

  async validateBookingCode(bookingCode) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/validate/${bookingCode}`));
    } catch {
      return false;
    }
  },

  async checkSeatAvailability(showtimeId, seatIds) {
    return unwrapApiData(await apiClient.post(`${base}/check-availability`, { showtimeId, seatIds }));
  },

  async exportBookings(params) {
    return apiClient.get(`${base}/export`, { params, responseType: 'blob' });
  },

  async downloadTicket(bookingCode) {
    return apiClient.get(`${base}/code/${bookingCode}/qr`, { responseType: 'blob' });
  },

  getStatusDisplayName(status) {
    const statusNames = {
      [BOOKING_STATUS.PENDING]: 'Chờ xử lý',
      [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
      [BOOKING_STATUS.CANCELLED]: 'Đã hủy',
      [BOOKING_STATUS.COMPLETED]: 'Hoàn thành',
    };
    return statusNames[status] || status;
  },

  formatBookingCode(code) {
    if (!code) return '';
    return code.toUpperCase().replace(/(.{3})/g, '$1-').slice(0, -1);
  },
};

export default bookingService;
