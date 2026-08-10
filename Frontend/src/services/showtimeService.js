import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';

class ShowtimeService {
    async getAllShowtimes(paramsOrPage = {}, size) {
        const params = typeof paramsOrPage === 'number'
            ? { page: paramsOrPage, size: size ?? 10 }
            : (paramsOrPage || {});
        return unwrapApiData(await apiClient.get(ENDPOINTS.SHOWTIME, { params }));
    }

    async getShowtimesByDate(date, params = {}) {
        return unwrapApiData(await apiClient.get(ENDPOINTS.SHOWTIME, { params: { ...params, date } }));
    }

    async getShowtimesByCinema(cinemaId, params = {}) {
        return unwrapApiData(await apiClient.get(ENDPOINTS.SHOWTIME, { params: { ...params, cinemaId } }));
    }

    async getShowtimesByMovie(movieId, params = {}) {
        return unwrapApiData(await apiClient.get(ENDPOINTS.SHOWTIME, { params: { ...params, movieId } }));
    }

    async getShowtimesByDateAndCinema(date, cinemaId, params = {}) {
        return unwrapApiData(await apiClient.get(`${ENDPOINTS.SHOWTIME}/cinema/${cinemaId}/date/${date}`, { params }));
    }

    async getCinemaShowtimesByMovieAndDate(movieId, date, params = {}) {
        return unwrapApiData(await apiClient.get(`${ENDPOINTS.SHOWTIME}/movie/${movieId}/date/${date}`, { params }));
    }

    async getShowtimesWithFilters(filters) {
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.SHOWTIME}/filters`, filters));
    }

    async getShowtimeById(id) {
        return unwrapApiData(await apiClient.get(`${ENDPOINTS.SHOWTIME}/${id}`));
    }

    async createShowtime(data) {
        return unwrapApiData(await apiClient.post(ENDPOINTS.SHOWTIME, data));
    }

    async updateShowtime(id, data) {
        return unwrapApiData(await apiClient.put(`${ENDPOINTS.SHOWTIME}/${id}`, data));
    }

    async deleteShowtime(id) {
        return unwrapApiData(await apiClient.delete(`${ENDPOINTS.SHOWTIME}/${id}`));
    }

    async updateShowtimeStatus(id, status) {
        return unwrapApiData(await apiClient.patch(`${ENDPOINTS.SHOWTIME}/${id}/status`, { status }));
    }

    async getSeatsByShowtimeId(showtimeId) {
        return unwrapApiArray(await apiClient.get(`${ENDPOINTS.SHOWTIME}/${showtimeId}/seats`));
    }

    async lockSeats(showtimeId, seatIds, userId) {
        const userIdParam = userId || '0';
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.SHOWTIME}/${showtimeId}/lock-seat/${seatIds}?userId=${userIdParam}`));
    }

    async unlockSeats(showtimeId, seatIds) {
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.SHOWTIME}/${showtimeId}/unlock-seat/${seatIds}`));
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
