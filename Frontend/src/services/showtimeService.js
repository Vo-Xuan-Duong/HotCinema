import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { ENDPOINTS } from '@/utils/constants';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const SHOWTIME_BASE = MOCK_API_ENABLED ? '/showtime' : ENDPOINTS.SHOWTIMES;
const SHOWTIME_SEAT_BASE = MOCK_API_ENABLED ? '/showtime-seats' : ENDPOINTS.SHOWTIMESEATS;
const endpointUnavailable = (error) => [404, 405].includes(error?.status || error?.response?.status);
const pageContent = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

class ShowtimeService {
  async getAllShowtimes(paramsOrPage = {}, size) {
    const params = typeof paramsOrPage === 'number'
      ? { page: paramsOrPage, size: size ?? 10 }
      : (paramsOrPage || {});
    return unwrapApiData(await apiClient.get(SHOWTIME_BASE, { params }));
  }

  async getShowtimesByDate(date, params = {}) {
    return this.getAllShowtimes({ ...params, date });
  }

  async getShowtimesByCinema(cinemaId, params = {}) {
    return this.getAllShowtimes({ ...params, cinemaId: normalizeResourceId(cinemaId) });
  }

  async getShowtimesByMovie(movieId, params = {}) {
    return this.getAllShowtimes({ ...params, movieId: normalizeResourceId(movieId) });
  }

  async getShowtimesByDateAndCinema(date, cinemaId, params = {}) {
    const id = normalizeResourceId(cinemaId);
    try {
      return unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/cinema/${id}/date/${date}`, { params }));
    } catch (error) {
      if (!endpointUnavailable(error)) throw error;
      const result = await this.getAllShowtimes({ ...params, page: 0, size: 500 });
      const rows = Array.isArray(result) ? result : result?.content || [];
      return rows.filter((item) => (
        sameResourceId(item.cinemaId ?? item.cinema?.id, id)
        && String(item.date ?? item.showDate ?? item.startTime ?? '').slice(0, 10) === String(date)
      ));
    }
  }

  async getCinemaShowtimesByMovieAndDate(movieId, date, params = {}) {
    const id = normalizeResourceId(movieId);
    try {
      return unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/movie/${id}/date/${date}`, { params }));
    } catch (error) {
      if (!endpointUnavailable(error)) throw error;
      const result = await this.getAllShowtimes({ ...params, page: 0, size: 500 });
      const rows = Array.isArray(result) ? result : result?.content || [];
      return rows.filter((item) => (
        sameResourceId(item.movieId ?? item.movie?.id, id)
        && String(item.date ?? item.showDate ?? item.startTime ?? '').slice(0, 10) === String(date)
      ));
    }
  }

  async getShowtimesWithFilters(filters = {}) {
    try {
      return unwrapApiData(await apiClient.post(`${SHOWTIME_BASE}/filters`, filters));
    } catch (error) {
      if (!endpointUnavailable(error)) throw error;
      const result = await this.getAllShowtimes({ page: 0, size: 500 });
      let rows = Array.isArray(result) ? result : result?.content || [];
      if (filters.movieId) rows = rows.filter((item) => sameResourceId(item.movieId ?? item.movie?.id, filters.movieId));
      if (filters.cinemaId) rows = rows.filter((item) => sameResourceId(item.cinemaId ?? item.cinema?.id, filters.cinemaId));
      if (filters.date || filters.showDate) {
        const date = String(filters.date || filters.showDate);
        rows = rows.filter((item) => String(item.date ?? item.showDate ?? item.startTime ?? '').slice(0, 10) === date);
      }
      return rows;
    }
  }

  async getShowtimeById(id) {
    return unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`));
  }

  async createShowtime(data) {
    return unwrapApiData(await apiClient.post(SHOWTIME_BASE, data));
  }

  async updateShowtime(id, data) {
    return unwrapApiData(await apiClient.put(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`, data));
  }

  async deleteShowtime(id) {
    return unwrapApiData(await apiClient.delete(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`));
  }

  async updateShowtimeStatus(id, status) {
    const normalizedId = normalizeResourceId(id);
    try {
      return unwrapApiData(await apiClient.patch(`${SHOWTIME_BASE}/${normalizedId}/status`, { status }));
    } catch (error) {
      if (!endpointUnavailable(error)) throw error;
      const current = await this.getShowtimeById(normalizedId);
      return this.updateShowtime(normalizedId, { ...current, status });
    }
  }

  async getSeatsByShowtimeId(showtimeId) {
    const normalizedShowtimeId = normalizeResourceId(showtimeId);
    try {
      return unwrapApiArray(await apiClient.get(`${SHOWTIME_BASE}/${normalizedShowtimeId}/seats`));
    } catch (error) {
      if (MOCK_API_ENABLED || !endpointUnavailable(error)) throw error;

      // Current backend exposes generic ShowtimeSeat and Seat CRUD resources.
      // Join them client-side as a compatibility fallback until the dedicated
      // seat-layout use-case endpoint is implemented server-side.
      const [showtimeSeatsResponse, seatsResponse] = await Promise.all([
        apiClient.get(SHOWTIME_SEAT_BASE, { params: { page: 0, size: 500 } }),
        apiClient.get(ENDPOINTS.SEATS, { params: { page: 0, size: 1000 } }),
      ]);

      const showtimeSeats = pageContent(showtimeSeatsResponse)
        .filter((item) => sameResourceId(item.showtimeId ?? item.showtime?.id, normalizedShowtimeId));
      const seats = pageContent(seatsResponse);
      const seatById = new Map(seats.map((seat) => [String(seat.id), seat]));

      return showtimeSeats.map((item) => {
        const seat = seatById.get(String(item.seatId ?? item.seat?.id)) || item.seat || {};
        return {
          ...seat,
          showtimeSeatId: item.id,
          id: item.id,
          physicalSeatId: seat.id ?? item.seatId,
          price: Number(item.price ?? seat.price ?? 0),
          status: String(item.status ?? seat.status ?? 'AVAILABLE').toLowerCase(),
          seatStatus: String(item.status ?? seat.seatStatus ?? 'AVAILABLE').toUpperCase(),
          lockedByUserId: item.heldByUserId ?? null,
          holdToken: item.holdToken ?? null,
          holdExpiresAt: item.holdExpiresAt ?? null,
          version: item.version,
        };
      });
    }
  }

  async lockSeats(showtimeId, seatIds, userId) {
    const showtime = normalizeResourceId(showtimeId);
    const seat = normalizeResourceId(seatIds);
    return unwrapApiData(await apiClient.post(
      `${SHOWTIME_BASE}/${showtime}/lock-seat/${seat}`,
      null,
      { params: userId ? { userId: normalizeResourceId(userId) } : undefined },
    ));
  }

  async unlockSeats(showtimeId, seatIds) {
    return unwrapApiData(await apiClient.post(
      `${SHOWTIME_BASE}/${normalizeResourceId(showtimeId)}/unlock-seat/${normalizeResourceId(seatIds)}`,
    ));
  }

  getUpcomingDates(days = 7) {
    const dates = [];
    for (let i = 0; i < days; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullLabel: date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }),
        isToday: i === 0,
      });
    }
    return dates;
  }

  formatTime(timeString) {
    return timeString;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}

export const showtimeService = new ShowtimeService();
export default showtimeService;
