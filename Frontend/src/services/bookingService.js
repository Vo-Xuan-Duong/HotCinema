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

const enrichRealBookings = async (bookings = []) => {
  if (MOCK_API_ENABLED || !bookings.length) return bookings;

  const showtimeIds = new Set(bookings.map((booking) => String(booking.showtimeId || '')).filter(Boolean));
  if (!showtimeIds.size) return bookings;

  const [showtimesResponse, moviesResponse, auditoriumsResponse, cinemasResponse] = await Promise.all([
    apiClient.get(ENDPOINTS.SHOWTIMES, { params: { page: 0, size: 2000 } }),
    apiClient.get(ENDPOINTS.MOVIES, { params: { page: 0, size: 500 } }),
    apiClient.get(ENDPOINTS.AUDITORIUMS, { params: { page: 0, size: 500 } }),
    apiClient.get(ENDPOINTS.CINEMAS, { params: { page: 0, size: 500 } }),
  ]);

  const showtimeMap = new Map(pageContent(showtimesResponse)
    .filter((item) => showtimeIds.has(String(item.id)))
    .map((item) => [String(item.id), item]));
  const movieMap = new Map(pageContent(moviesResponse).map((item) => [String(item.id), item]));
  const auditoriumMap = new Map(pageContent(auditoriumsResponse).map((item) => [String(item.id), item]));
  const cinemaMap = new Map(pageContent(cinemasResponse).map((item) => [String(item.id), item]));

  return bookings.map((booking) => {
    const showtime = showtimeMap.get(String(booking.showtimeId)) || null;
    const movie = showtime ? movieMap.get(String(showtime.movieId)) || null : null;
    const auditorium = showtime ? auditoriumMap.get(String(showtime.auditoriumId)) || null : null;
    const cinema = auditorium ? cinemaMap.get(String(auditorium.cinemaId)) || null : null;

    return {
      ...booking,
      bookingStatus: booking.status,
      showtime,
      movie,
      auditorium,
      cinema,
      movieId: movie?.id || showtime?.movieId || null,
      movieTitle: movie?.title || null,
      moviePosterUrl: movie?.posterUrl || null,
      cinemaId: cinema?.id || null,
      cinemaName: cinema?.name || null,
      cinemaAddress: cinema?.address || null,
      cityName: cinema?.city || null,
      roomId: auditorium?.id || showtime?.auditoriumId || null,
      roomName: auditorium?.name || null,
      showtimeDateTime: showtime?.startTime || null,
      showDate: showtime?.startTime ? String(showtime.startTime).slice(0, 10) : null,
      startTime: showtime?.startTime || null,
      endTime: showtime?.endTime || null,
      movieFormat: showtime?.format || null,
      formatType: showtime?.format || null,
      basePrice: Number(showtime?.basePrice || 0),
    };
  });
};

const enrichBookingPage = async (data) => {
  if (MOCK_API_ENABLED) return data;
  if (Array.isArray(data)) return enrichRealBookings(data);
  if (Array.isArray(data?.content)) return { ...data, content: await enrichRealBookings(data.content) };
  return data;
};

const bookingService = {
  // Administrative collection APIs. Customer pages must use getMy* methods.
  async listPage(params = {}) {
    const data = unwrapApiData(await apiClient.get(base, { params }));
    return enrichBookingPage(data);
  },

  async list(params = {}) {
    const result = await this.listPage({ page: 0, size: 500, ...params });
    return Array.isArray(result) ? result : result?.content || [];
  },

  async getBookingById(bookingId) {
    const booking = unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(bookingId)}`));
    if (MOCK_API_ENABLED || !booking) return booking;
    return (await enrichRealBookings([booking]))[0] || booking;
  },

  async getAdminBooking(identifier) {
    const normalized = normalizeResourceId(identifier);
    if (normalized == null) return null;

    if (typeof normalized === 'number' || isUuid(normalized)) {
      return this.getBookingById(normalized);
    }

    const rows = await this.list({ page: 0, size: 500 });
    const code = String(identifier).trim().toUpperCase();
    return rows.find((item) => String(item.bookingCode || item.code || '').trim().toUpperCase() === code) || null;
  },

  async getMyBookingById(bookingId) {
    const id = normalizeResourceId(bookingId);
    if (id == null) return null;

    if (MOCK_API_ENABLED) {
      const result = await this.getMyBookings({ page: 0, size: 500 });
      const rows = Array.isArray(result) ? result : result?.content || [];
      return rows.find((item) => sameResourceId(item.id ?? item.bookingId, id)) || null;
    }

    try {
      const booking = unwrapApiData(await apiClient.get(`${base}/my-bookings/${id}`));
      return booking ? (await enrichRealBookings([booking]))[0] || booking : null;
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      rethrowCapabilityError('chi tiết booking cá nhân có kiểm soát ownership', error);
    }
  },

  async getBookingByCode(bookingCode) {
    const code = String(bookingCode || '').trim();
    try {
      const booking = unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(code)}`));
      if (MOCK_API_ENABLED || !booking) return booking;
      return (await enrichRealBookings([booking]))[0] || booking;
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
      rethrowCapabilityError('đổi trạng thái booking bằng command backend', error);
    }
  },

  async deleteBooking(bookingId) {
    return apiClient.delete(`${base}/${normalizeResourceId(bookingId)}`);
  },

  async getMyBookings(params = {}) {
    try {
      const data = unwrapApiData(await apiClient.get(`${base}/my-bookings`, { params }));
      return enrichBookingPage(data);
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      if (!MOCK_API_ENABLED) {
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
      const data = unwrapApiData(await apiClient.get(`${base}/my-bookings/history`, { params }));
      if (MOCK_API_ENABLED) return Array.isArray(data) ? data : data?.content || [];
      const rows = Array.isArray(data) ? data : data?.content || [];
      return enrichRealBookings(rows);
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
      const data = unwrapApiData(await apiClient.get(`${base}/history/user/${id}`, { params }));
      return enrichBookingPage(data);
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
      const data = unwrapApiData(await apiClient.get(`${base}/user/${id}`, { params }));
      return enrichBookingPage(data);
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

export { enrichRealBookings };
export default bookingService;
