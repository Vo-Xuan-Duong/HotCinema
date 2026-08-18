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

const dateOf = (showtime) => String(showtime?.date ?? showtime?.showDate ?? showtime?.startTime ?? '').slice(0, 10);

const normalizeShowtimeFormat = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  const aliases = {
    TWO_D: 'FORMAT_2D',
    '2D': 'FORMAT_2D',
    FORMAT_2D: 'FORMAT_2D',
    THREE_D: 'FORMAT_3D',
    '3D': 'FORMAT_3D',
    FORMAT_3D: 'FORMAT_3D',
    IMAX: 'IMAX',
    IMAX_3D: 'IMAX',
    FOUR_DX: 'FORMAT_4DX',
    '4DX': 'FORMAT_4DX',
    FORMAT_4DX: 'FORMAT_4DX',
    SCREEN_X: 'SCREENX',
    SCREENX: 'SCREENX',
  };
  return aliases[normalized] || normalized;
};

const normalizeShowtimeStatus = (value) => {
  const normalized = String(value || '').trim().toUpperCase();
  const aliases = {
    UPCOMING: 'SCHEDULED',
    SCHEDULED: 'SCHEDULED',
    AVAILABLE: 'OPEN',
    ALMOST_FULL: 'OPEN',
    OPEN: 'OPEN',
    FULL: 'CLOSED',
    SALES_ENDED: 'CLOSED',
    CLOSED: 'CLOSED',
    CANCELLED: 'CANCELLED',
    POSTPONED: 'CANCELLED',
    COMPLETED: 'FINISHED',
    FINISHED: 'FINISHED',
  };
  return aliases[normalized] || normalized;
};

const combineDateAndTime = (date, time) => {
  if (!date || !time) return null;
  const rawTime = String(time);
  if (/^\d{4}-\d{2}-\d{2}T/.test(rawTime)) return rawTime;
  return `${String(date).slice(0, 10)}T${rawTime.length === 5 ? `${rawTime}:00` : rawTime}`;
};

const toIsoDateTime = (value, fallbackDate) => {
  if (!value) return null;
  const candidate = /^\d{1,2}:\d{2}/.test(String(value))
    ? combineDateAndTime(fallbackDate, value)
    : value;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? candidate : date.toISOString();
};

const toShowtimePayload = (data = {}) => {
  const fallbackDate = data.showDate || data.date;
  return {
    movieId: normalizeResourceId(data.movieId ?? data.movie?.id),
    auditoriumId: normalizeResourceId(data.auditoriumId ?? data.roomId ?? data.theaterId ?? data.auditorium?.id),
    startTime: toIsoDateTime(data.startTime, fallbackDate),
    endTime: toIsoDateTime(data.endTime, fallbackDate),
    language: String(data.language || '').trim(),
    subtitle: String(data.subtitle || '').trim(),
    format: normalizeShowtimeFormat(data.format ?? data.formatType),
    basePrice: Number(data.basePrice ?? data.price),
    bookingOpenAt: toIsoDateTime(data.bookingOpenAt, fallbackDate),
    bookingCloseAt: toIsoDateTime(data.bookingCloseAt, fallbackDate),
    status: normalizeShowtimeStatus(data.status),
    ...(normalizeResourceId(data.createdById) ? { createdById: normalizeResourceId(data.createdById) } : {}),
  };
};

const enrichRealShowtimes = async (rows = []) => {
  if (MOCK_API_ENABLED || !rows.length) return rows;
  const [moviesResponse, auditoriumsResponse, cinemasResponse] = await Promise.all([
    apiClient.get(ENDPOINTS.MOVIES, { params: { page: 0, size: 500 } }),
    apiClient.get(ENDPOINTS.AUDITORIUMS, { params: { page: 0, size: 500 } }),
    apiClient.get(ENDPOINTS.CINEMAS, { params: { page: 0, size: 500 } }),
  ]);
  const movies = pageContent(moviesResponse);
  const auditoriums = pageContent(auditoriumsResponse);
  const cinemas = pageContent(cinemasResponse);
  const movieMap = new Map(movies.map((item) => [String(item.id), item]));
  const auditoriumMap = new Map(auditoriums.map((item) => [String(item.id), item]));
  const cinemaMap = new Map(cinemas.map((item) => [String(item.id), item]));

  return rows.map((item) => {
    const movie = movieMap.get(String(item.movieId ?? item.movie?.id)) || item.movie || null;
    const auditorium = auditoriumMap.get(String(item.auditoriumId ?? item.auditorium?.id)) || item.auditorium || null;
    const cinema = cinemaMap.get(String(auditorium?.cinemaId ?? item.cinemaId ?? item.cinema?.id)) || item.cinema || null;
    return {
      ...item,
      movie,
      auditorium,
      cinema,
      movieId: item.movieId ?? movie?.id,
      movieTitle: item.movieTitle || movie?.title || movie?.name,
      moviePoster: item.moviePoster || movie?.posterUrl || movie?.poster,
      auditoriumId: item.auditoriumId ?? auditorium?.id,
      roomId: item.roomId ?? auditorium?.id,
      roomName: item.roomName || auditorium?.name,
      cinemaId: item.cinemaId ?? cinema?.id,
      cinemaName: item.cinemaName || cinema?.name,
      cinemaAddress: item.cinemaAddress || cinema?.address,
      date: item.date || item.showDate || dateOf(item),
      showDate: item.showDate || item.date || dateOf(item),
      price: Number(item.price ?? item.basePrice ?? 0),
      formatType: item.formatType || item.format,
      format: normalizeShowtimeFormat(item.format ?? item.formatType),
      status: normalizeShowtimeStatus(item.status),
    };
  });
};

class ShowtimeService {
  async getAllShowtimes(paramsOrPage = {}, size) {
    const params = typeof paramsOrPage === 'number'
      ? { page: paramsOrPage, size: size ?? 10 }
      : (paramsOrPage || {});
    const data = unwrapApiData(await apiClient.get(SHOWTIME_BASE, { params }));
    if (MOCK_API_ENABLED) return data;
    if (Array.isArray(data)) return enrichRealShowtimes(data);
    if (Array.isArray(data?.content)) return { ...data, content: await enrichRealShowtimes(data.content) };
    return data;
  }

  async getShowtimesByDate(date, params = {}) {
    const result = await this.getAllShowtimes({ ...params, page: 0, size: 500 });
    const rows = Array.isArray(result) ? result : result?.content || [];
    return rows.filter((item) => dateOf(item) === String(date));
  }

  async getShowtimesByCinema(cinemaId, params = {}) {
    const id = normalizeResourceId(cinemaId);
    const result = await this.getAllShowtimes({ ...params, page: 0, size: 500 });
    const rows = Array.isArray(result) ? result : result?.content || [];
    return rows.filter((item) => sameResourceId(item.cinemaId ?? item.cinema?.id, id));
  }

  async getShowtimesByMovie(movieId, params = {}) {
    const id = normalizeResourceId(movieId);
    const result = await this.getAllShowtimes({ ...params, page: 0, size: 500 });
    const rows = Array.isArray(result) ? result : result?.content || [];
    return rows.filter((item) => sameResourceId(item.movieId ?? item.movie?.id, id));
  }

  async getShowtimesByDateAndCinema(date, cinemaId, params = {}) {
    const id = normalizeResourceId(cinemaId);
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/cinema/${id}/date/${date}`, { params }));
    }
    const rows = await this.getShowtimesByCinema(id, params);
    return rows.filter((item) => dateOf(item) === String(date));
  }

  async getCinemaShowtimesByMovieAndDate(movieId, date, params = {}) {
    const id = normalizeResourceId(movieId);
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/movie/${id}/date/${date}`, { params }));
    }
    const rows = await this.getShowtimesByMovie(id, params);
    return rows.filter((item) => dateOf(item) === String(date));
  }

  async getShowtimesWithFilters(filters = {}) {
    if (MOCK_API_ENABLED) return unwrapApiData(await apiClient.post(`${SHOWTIME_BASE}/filters`, filters));
    const result = await this.getAllShowtimes({ page: 0, size: 500 });
    let rows = Array.isArray(result) ? result : result?.content || [];
    if (filters.movieId) rows = rows.filter((item) => sameResourceId(item.movieId ?? item.movie?.id, filters.movieId));
    if (filters.cinemaId) rows = rows.filter((item) => sameResourceId(item.cinemaId ?? item.cinema?.id, filters.cinemaId));
    const wantedDate = filters.date || filters.showDate || filters.fromDate;
    if (wantedDate) rows = rows.filter((item) => dateOf(item) >= String(wantedDate));
    return rows;
  }

  async getShowtimeById(id) {
    const data = unwrapApiData(await apiClient.get(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`));
    return MOCK_API_ENABLED ? data : (await enrichRealShowtimes(data ? [data] : []))[0] || data;
  }

  async createShowtime(data) {
    const payload = MOCK_API_ENABLED ? data : toShowtimePayload(data);
    return unwrapApiData(await apiClient.post(SHOWTIME_BASE, payload));
  }

  async updateShowtime(id, data) {
    const payload = MOCK_API_ENABLED ? data : toShowtimePayload(data);
    return unwrapApiData(await apiClient.put(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`, payload));
  }

  async deleteShowtime(id) {
    return unwrapApiData(await apiClient.delete(`${SHOWTIME_BASE}/${normalizeResourceId(id)}`));
  }

  async updateShowtimeStatus(id, status) {
    const normalizedId = normalizeResourceId(id);
    try {
      return unwrapApiData(await apiClient.patch(`${SHOWTIME_BASE}/${normalizedId}/status`, { status: normalizeShowtimeStatus(status) }));
    } catch (error) {
      if (!endpointUnavailable(error)) throw error;
      const current = await this.getShowtimeById(normalizedId);
      return this.updateShowtime(normalizedId, { ...current, status: normalizeShowtimeStatus(status) });
    }
  }

  async getSeatsByShowtimeId(showtimeId) {
    const normalizedShowtimeId = normalizeResourceId(showtimeId);
    try {
      return unwrapApiArray(await apiClient.get(`${SHOWTIME_BASE}/${normalizedShowtimeId}/seats`));
    } catch (error) {
      if (MOCK_API_ENABLED || !endpointUnavailable(error)) throw error;
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
    return unwrapApiData(await apiClient.post(
      `${SHOWTIME_BASE}/${normalizeResourceId(showtimeId)}/lock-seat/${normalizeResourceId(seatIds)}`,
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
    return Array.from({ length: days }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index);
      return {
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        fullLabel: date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }),
        isToday: index === 0,
      };
    });
  }

  formatTime(timeString) { return timeString; }
  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  }
}

export {
  enrichRealShowtimes,
  normalizeShowtimeFormat,
  normalizeShowtimeStatus,
  toShowtimePayload,
};
export const showtimeService = new ShowtimeService();
export default showtimeService;
