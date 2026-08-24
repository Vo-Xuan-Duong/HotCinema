import dayjs from 'dayjs';
import bookingService from '@/services/bookingService';
import paymentService from '@/services/paymentService';
import showtimeService from '@/services/showtimeService';
import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray } from '@/utils/apiResponse';

const SNAPSHOT_TTL_MS = 15000;
let cachedSnapshot = null;
let cachedAt = 0;
let pendingSnapshot = null;

const successfulPayment = (payment) => String(payment?.status || '').toUpperCase() === 'SUCCESS';
const pendingPayment = (payment) => ['PENDING', 'PROCESSING'].includes(String(payment?.status || '').toUpperCase());
const failedPayment = (payment) => ['FAILED', 'CANCELLED'].includes(String(payment?.status || '').toUpperCase());

const inRange = (value, params = {}) => {
  if (!value) return false;
  const date = dayjs(value);
  if (!date.isValid()) return false;
  const start = params.startDate ? dayjs(params.startDate).startOf('day') : null;
  const end = params.endDate ? dayjs(params.endDate).endOf('day') : null;
  if (start?.isValid() && date.isBefore(start)) return false;
  if (end?.isValid() && date.isAfter(end)) return false;
  return true;
};

const getSnapshot = async () => {
  if (cachedSnapshot && Date.now() - cachedAt < SNAPSHOT_TTL_MS) return cachedSnapshot;
  if (pendingSnapshot) return pendingSnapshot;

  pendingSnapshot = Promise.all([
    bookingService.list(),
    paymentService.getAllNoPagination(),
    showtimeService.getShowtimesWithFilters({}),
    apiClient.get('/bookingseats'),
  ]).then(([bookings, payments, showtimes, bookingSeatsResponse]) => {
    const snapshot = {
      bookings: Array.isArray(bookings) ? bookings : [],
      payments: Array.isArray(payments) ? payments : [],
      showtimes: Array.isArray(showtimes) ? showtimes : [],
      bookingSeats: unwrapApiArray(bookingSeatsResponse),
    };
    cachedSnapshot = snapshot;
    cachedAt = Date.now();
    return snapshot;
  }).finally(() => {
    pendingSnapshot = null;
  });

  return pendingSnapshot;
};

const buildContext = async (params = {}) => {
  const snapshot = await getSnapshot();
  const bookings = snapshot.bookings.filter((booking) => inRange(booking.createdAt || booking.paidAt, params));
  const payments = snapshot.payments.filter((payment) => inRange(payment.paidAt || payment.createdAt, params));
  const successfulPayments = payments.filter(successfulPayment);
  const bookingById = new Map(snapshot.bookings.map((booking) => [String(booking.id), booking]));
  const showtimeById = new Map(snapshot.showtimes.map((showtime) => [String(showtime.id), showtime]));
  const seatsByBooking = new Map();

  snapshot.bookingSeats.forEach((seat) => {
    const key = String(seat.bookingId || '');
    if (!key) return;
    const items = seatsByBooking.get(key) || [];
    items.push(seat);
    seatsByBooking.set(key, items);
  });

  return { snapshot, bookings, payments, successfulPayments, bookingById, showtimeById, seatsByBooking };
};

const revenueService = {
  async getSummary(params = {}) {
    const context = await buildContext(params);
    const successfulBookingIds = new Set(context.successfulPayments.map((payment) => String(payment.bookingId)));
    const totalTickets = [...successfulBookingIds].reduce(
      (sum, bookingId) => sum + (context.seatsByBooking.get(bookingId)?.length || 0),
      0
    );

    return {
      totalRevenue: context.successfulPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
      totalBookings: context.bookings.length,
      totalTickets,
      totalSuccessfulPayments: context.successfulPayments.length,
      totalPendingPayments: context.payments.filter(pendingPayment).length,
      totalFailedPayments: context.payments.filter(failedPayment).length,
    };
  },

  async getByDate(params = {}) {
    const context = await buildContext(params);
    const groups = new Map();

    context.successfulPayments.forEach((payment) => {
      const date = dayjs(payment.paidAt || payment.createdAt).format('YYYY-MM-DD');
      if (!groups.has(date)) {
        groups.set(date, { date, totalRevenue: 0, bookingIds: new Set(), totalTickets: 0 });
      }
      const group = groups.get(date);
      const bookingId = String(payment.bookingId || '');
      group.totalRevenue += Number(payment.amount || 0);
      if (bookingId) group.bookingIds.add(bookingId);
    });

    groups.forEach((group) => {
      group.totalTickets = [...group.bookingIds].reduce(
        (sum, bookingId) => sum + (context.seatsByBooking.get(bookingId)?.length || 0),
        0
      );
    });

    return [...groups.values()]
      .sort((left, right) => left.date.localeCompare(right.date))
      .map((group) => ({
        date: group.date,
        totalRevenue: group.totalRevenue,
        totalBookings: group.bookingIds.size,
        totalTickets: group.totalTickets,
      }));
  },

  async getTopMovies(params = {}) {
    const context = await buildContext(params);
    const groups = new Map();

    context.successfulPayments.forEach((payment) => {
      const booking = context.bookingById.get(String(payment.bookingId));
      const showtime = booking ? context.showtimeById.get(String(booking.showtimeId)) : null;
      if (!showtime?.movieId) return;
      const key = String(showtime.movieId);
      if (!groups.has(key)) {
        groups.set(key, {
          id: showtime.movieId,
          movieId: showtime.movieId,
          title: showtime.movieTitle || 'Không rõ phim',
          totalRevenue: 0,
          bookingIds: new Set(),
        });
      }
      const group = groups.get(key);
      group.totalRevenue += Number(payment.amount || 0);
      group.bookingIds.add(String(payment.bookingId));
    });

    const limit = Math.max(1, Number(params.limit) || 5);
    return [...groups.values()]
      .map((group) => ({ ...group, totalBookings: group.bookingIds.size, bookingIds: undefined }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },

  async getTopCinemas(params = {}) {
    const context = await buildContext(params);
    const groups = new Map();

    context.successfulPayments.forEach((payment) => {
      const booking = context.bookingById.get(String(payment.bookingId));
      const showtime = booking ? context.showtimeById.get(String(booking.showtimeId)) : null;
      if (!showtime?.cinemaId) return;
      const key = String(showtime.cinemaId);
      if (!groups.has(key)) {
        groups.set(key, {
          id: showtime.cinemaId,
          cinemaId: showtime.cinemaId,
          name: showtime.cinemaName || 'Không rõ rạp',
          totalRevenue: 0,
          bookingIds: new Set(),
        });
      }
      const group = groups.get(key);
      group.totalRevenue += Number(payment.amount || 0);
      group.bookingIds.add(String(payment.bookingId));
    });

    const limit = Math.max(1, Number(params.limit) || 5);
    return [...groups.values()]
      .map((group) => ({ ...group, totalBookings: group.bookingIds.size, bookingIds: undefined }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, limit);
  },

  async getByPaymentMethod(params = {}) {
    const context = await buildContext(params);
    const groups = new Map();

    context.successfulPayments.forEach((payment) => {
      const method = payment.paymentMethod || payment.provider || 'UNKNOWN';
      const current = groups.get(method) || { paymentMethod: method, totalRevenue: 0, totalPayments: 0 };
      current.totalRevenue += Number(payment.amount || 0);
      current.totalPayments += 1;
      groups.set(method, current);
    });

    return [...groups.values()].sort((a, b) => b.totalRevenue - a.totalRevenue);
  },

  clearCache() {
    cachedSnapshot = null;
    cachedAt = 0;
  },
};

export default revenueService;
