import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import bookingService from '@/services/bookingService';
import paymentService, { PAYMENT_STATUS } from '@/services/paymentService';

const datePart = (value) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
};

const inRange = (value, params = {}) => {
  const date = datePart(value);
  if (!date) return true;
  if (params.startDate && date < String(params.startDate)) return false;
  if (params.endDate && date > String(params.endDate)) return false;
  return true;
};

const successful = (payment) => String(payment.paymentStatus || payment.status || '').toUpperCase() === PAYMENT_STATUS.SUCCESS;

const loadRevenueSource = async (params = {}) => {
  const [payments, bookings] = await Promise.all([
    paymentService.list({ page: 0, size: 1000 }),
    bookingService.list({ page: 0, size: 1000 }),
  ]);

  return {
    payments: payments.filter((payment) => inRange(payment.paymentDate || payment.paidAt || payment.createdAt, params)),
    bookings: bookings.filter((booking) => inRange(booking.createdAt || booking.paidAt, params)),
  };
};

const revenueService = {
  async getSummary(params = {}) {
    try {
      return unwrapApiData(await apiClient.get('/revenue/summary', { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const { payments, bookings } = await loadRevenueSource(params);
      const successfulPayments = payments.filter(successful);
      const pendingPayments = payments.filter((payment) => String(payment.paymentStatus || payment.status || '').toUpperCase() === PAYMENT_STATUS.PENDING);
      const failedPayments = payments.filter((payment) => ['FAILED', 'CANCELLED'].includes(String(payment.paymentStatus || payment.status || '').toUpperCase()));

      return {
        totalRevenue: successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
        totalBookings: bookings.length,
        totalTickets: bookings.reduce((sum, booking) => sum + Number(booking.seatCount || booking.seats?.length || 0), 0),
        totalSuccessfulPayments: successfulPayments.length,
        totalPendingPayments: pendingPayments.length,
        totalFailedPayments: failedPayments.length,
        derivedFromCrud: true,
      };
    }
  },

  async getByDate(params = {}) {
    try {
      return unwrapApiData(await apiClient.get('/revenue/by-date', { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const { payments, bookings } = await loadRevenueSource(params);
      const rows = new Map();

      bookings.forEach((booking) => {
        const date = datePart(booking.createdAt || booking.paidAt);
        if (!date) return;
        if (!rows.has(date)) rows.set(date, { date, totalRevenue: 0, totalBookings: 0, totalTickets: 0 });
        const row = rows.get(date);
        row.totalBookings += 1;
        row.totalTickets += Number(booking.seatCount || booking.seats?.length || 0);
      });

      payments.filter(successful).forEach((payment) => {
        const date = datePart(payment.paymentDate || payment.paidAt || payment.createdAt);
        if (!date) return;
        if (!rows.has(date)) rows.set(date, { date, totalRevenue: 0, totalBookings: 0, totalTickets: 0 });
        rows.get(date).totalRevenue += Number(payment.amount || 0);
      });

      return [...rows.values()].sort((left, right) => left.date.localeCompare(right.date));
    }
  },

  async getTopMovies(params = {}) {
    try {
      return unwrapApiData(await apiClient.get('/revenue/top-movies', { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      // BookingResponse currently only exposes showtimeId, so an accurate movie
      // ranking requires a backend reporting query or a costly N+1 enrichment.
      return [];
    }
  },

  async getTopCinemas(params = {}) {
    try {
      return unwrapApiData(await apiClient.get('/revenue/top-cinemas', { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return [];
    }
  },

  async getByPaymentMethod(params = {}) {
    try {
      return unwrapApiData(await apiClient.get('/revenue/by-payment-method', { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const { payments } = await loadRevenueSource(params);
      const grouped = new Map();
      payments.filter(successful).forEach((payment) => {
        const method = String(payment.paymentMethod || payment.provider || 'UNKNOWN').toUpperCase();
        const current = grouped.get(method) || { paymentMethod: method, totalRevenue: 0, transactions: 0 };
        current.totalRevenue += Number(payment.amount || 0);
        current.transactions += 1;
        grouped.set(method, current);
      });
      return [...grouped.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
    }
  },
};

export { datePart, inRange };
export default revenueService;
