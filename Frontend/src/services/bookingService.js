import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS, BOOKING_STATUS } from '@/utils/constants';

// Helpers to unwrap backend ResponseData envelope
const unwrap = (res) => res?.data ?? res;

const unwrapArray = (res) => {
  const data = unwrap(res);
  return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
};

const base = ENDPOINTS.BOOKINGS; // '/bookings'

const bookingService = {
  // ==================== List & Pagination ====================

  /**
   * Get paginated list of bookings
   * @param {Object} params - Query parameters (page, size, status, userId, etc.)
   * @returns {Promise} Full page object with pagination info
   */
  async listPage(params) {
    const res = await apiClient.get(base, { params });
    return unwrap(res);
  },

  /**
   * Get bookings as array (no pagination info)
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Array of booking items
   */
  async list(params) {
    const res = await apiClient.get(base, { params });
    return unwrapArray(res);
  },

  // ==================== Single Booking ====================

  /**
   * Get booking by ID
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise} Booking details
   */
  async getBookingById(bookingId) {
    const res = await apiClient.get(`${base}/${bookingId}`);
    return unwrap(res);
  },

  /**
   * Get booking by code
   * @param {string} bookingCode - Booking code (e.g., "XYZ123ABC")
   * @returns {Promise} Booking details
   */
  async getBookingByCode(bookingCode) {
    const res = await apiClient.get(`${base}/code/${bookingCode}`);
    return unwrap(res);
  },

  // ==================== Create & Update ====================

  /**
   * Create new booking
   * @param {Object} data - Booking data
   * @param {number} data.showtimeId - Showtime ID
   * @param {Array<number>} data.seatIds - Array of seat IDs
   * @param {number} data.totalAmount - Total amount
   * @param {string} data.paymentMethod - Payment method
   * @param {string} data.paymentStatus - Payment status
   * @returns {Promise} Created booking
   */
  async createBooking(data) {
    const res = await apiClient.post(base, data);
    return unwrap(res);
  },

  /**
   * Update booking
   * @param {string|number} bookingId - Booking ID
   * @param {Object} data - Updated booking data
   * @returns {Promise} Updated booking
   */
  async updateBooking(bookingId, data) {
    const res = await apiClient.put(`${base}/${bookingId}`, data);
    return unwrap(res);
  },

  /**
   * Update booking status
   * @param {string|number} bookingId - Booking ID
   * @param {string} status - New status (pending, confirmed, cancelled, completed)
   * @returns {Promise} Updated booking
   */
  async updateBookingStatus(bookingId, status) {
    const res = await apiClient.patch(`${base}/${bookingId}/status`, { status });
    return unwrap(res);
  },

  // ==================== Cancel & Delete ====================

  /**
   * Delete booking (hard delete)
   * @param {string|number} bookingId - Booking ID
   * @returns {Promise} Deletion result
   */
  async deleteBooking(bookingId) {
    const res = await apiClient.delete(`${base}/${bookingId}`);
    return unwrap(res);
  },

  // ==================== User-specific ====================

  /**
   * Get bookings for current user
   * @param {Object} params - Query parameters (page, size, status, etc.)
   * @returns {Promise} Paginated user bookings
   */
  async getMyBookings(params) {
    const res = await apiClient.get(`${base}/my-bookings`, { params });
    return unwrap(res);
  },

  /**
   * Get booking history for current user
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Array of booking history
   */
  async getMyBookingHistory(params) {
    const res = await apiClient.get(`${base}/my-bookings/history`, { params });
    return unwrapArray(res);
  },

  /**
   * Get booking history by user ID
   * @param {string|number} userId - User ID
   * @param {Object} params - Query parameters (page, size, etc.)
   * @returns {Promise} Paginated booking history for the user
   */
  async getBookingHistoryByUserId(userId, params = {}) {
    const res = await apiClient.get(`${base}/history/user/${userId}`, { params });
    return unwrap(res);
  },

  /**
   * Get user bookings by user ID (admin/staff)
   * @param {string|number} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Paginated user bookings
   */
  async getUserBookings(userId, params) {
    const res = await apiClient.get(`${base}/user/${userId}`, { params });
    return unwrap(res);
  },

  // ==================== Metrics ====================

  /**
   * Get booking statistics
   * @param {Object} params - Query parameters (startDate, endDate, etc.)
   * @returns {Promise} Booking statistics
   */
  async getBookingStats(params) {
    const res = await apiClient.get(`${base}/statistics`, { params });
    return unwrap(res);
  },

  /**
   * Get booking count by status
   * @returns {Promise} Count by status
   */
  async getBookingCountByStatus() {
    const res = await apiClient.get(`${base}/count-by-status`);
    return unwrap(res);
  },

  // ==================== Payment ====================

  /**
   * Confirm payment for booking
   * @param {string|number} bookingId - Booking ID
   * @param {Object} paymentData - Payment confirmation data
   * @returns {Promise} Payment confirmation result
   */
  async confirmPayment(bookingId, paymentData) {
    const res = await apiClient.post(`${base}/${bookingId}/payment/confirm`, paymentData);
    return unwrap(res);
  },

  /**
   * Process refund for booking
   * @param {string|number} bookingId - Booking ID
   * @param {Object} refundData - Refund data
   * @returns {Promise} Refund result
   */
  async processRefund(bookingId, refundData) {
    const res = await apiClient.post(`${base}/${bookingId}/refund`, refundData);
    return unwrap(res);
  },

  // ==================== Validation ====================

  /**
   * Validate booking code
   * @param {string} bookingCode - Booking code
   * @returns {Promise<boolean>} Validation result
   */
  async validateBookingCode(bookingCode) {
    try {
      const res = await apiClient.get(`${base}/validate/${bookingCode}`);
      return unwrap(res);
    } catch (error) {
      return false;
    }
  },

  /**
   * Check seat availability for booking
   * @param {number} showtimeId - Showtime ID
   * @param {Array<number>} seatIds - Array of seat IDs
   * @returns {Promise} Availability result
   */
  async checkSeatAvailability(showtimeId, seatIds) {
    const res = await apiClient.post(`${base}/check-availability`, {
      showtimeId,
      seatIds
    });
    return unwrap(res);
  },

  // ==================== Export ====================

  /**
   * Export bookings to Excel/CSV
   * @param {Object} params - Export parameters
   * @returns {Promise<Blob>} File blob
   */
  async exportBookings(params) {
    const res = await apiClient.get(`${base}/export`, {
      params,
      responseType: 'blob'
    });
    return res;
  },

  /**
   * Download ticket QR code
   * @param {string} bookingCode - Booking code
   * @returns {Promise<Blob>} QR code image blob
   */
  async downloadTicket(bookingCode) {
    const res = await apiClient.get(`${base}/code/${bookingCode}/qr`, {
      responseType: 'blob'
    });
    return res;
  },

  // ==================== Helper Methods ====================

  /**
   * Get status display name
   * @param {string} status - Status key
   * @returns {string} Display name in Vietnamese
   */
  getStatusDisplayName(status) {
    const statusNames = {
      [BOOKING_STATUS.PENDING]: 'Chờ xử lý',
      [BOOKING_STATUS.CONFIRMED]: 'Đã xác nhận',
      [BOOKING_STATUS.CANCELLED]: 'Đã hủy',
      [BOOKING_STATUS.COMPLETED]: 'Hoàn thành'
    };
    return statusNames[status] || status;
  },

  /**
   * Format booking code for display
   * @param {string} code - Booking code
   * @returns {string} Formatted code
   */
  formatBookingCode(code) {
    if (!code) return '';
    return code.toUpperCase().replace(/(.{3})/g, '$1-').slice(0, -1);
  }
};

export default bookingService;
