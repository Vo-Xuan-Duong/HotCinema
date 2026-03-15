import { apiClient } from '../utils/apiClient';
import { ENDPOINTS } from '../utils/constants';

class ShowtimeService {
    async getAllShowtimes(params) {
        return apiClient.get(ENDPOINTS.SHOWTIME, { params });
    }

    async getShowtimesByDate(date) {
        return apiClient.get(ENDPOINTS.SHOWTIME, { params: { date } });
    }

    async getShowtimesByCinema(cinemaId) {
        return apiClient.get(ENDPOINTS.SHOWTIME, { params: { cinemaId } });
    }

    async getShowtimesByMovie(movieId) {
        return apiClient.get(ENDPOINTS.SHOWTIME, { params: { movieId } });
    }

    async getShowtimesByDateAndCinema(date, cinemaId, params = {}) {
        return apiClient.get(`${ENDPOINTS.SHOWTIME}/cinema/${cinemaId}/date/${date}`, { params });
    }

    async getCinemaShowtimesByMovieAndDate(movieId, date, params = {}) {
        return apiClient.get(`${ENDPOINTS.SHOWTIME}/movie/${movieId}/date/${date}`, { params });
    }

    async getShowtimesWithFilters(filters) {
        return apiClient.post(`${ENDPOINTS.SHOWTIME}/filters`, filters);
    }

    async getShowtimeById(id) {
        return apiClient.get(`${ENDPOINTS.SHOWTIME}/${id}`);
    }

    async createShowtime(data) {
        return apiClient.post(ENDPOINTS.SHOWTIME, data);
    }

    async updateShowtime(id, data) {
        return apiClient.put(`${ENDPOINTS.SHOWTIME}/${id}`, data);
    }

    async deleteShowtime(id) {
        return apiClient.delete(`${ENDPOINTS.SHOWTIME}/${id}`);
    }

    async updateShowtimeStatus(id, status) {
        return apiClient.patch(`${ENDPOINTS.SHOWTIME}/${id}/status`, { status });
    }

    async getSeatsByShowtimeId(showtimeId) {
        return apiClient.get(`${ENDPOINTS.SHOWTIME}/${showtimeId}/seats`);
    }

    async lockSeats(showtimeId, seatIds, userId) {
        // Gửi userId như query parameter (bắt buộc theo backend)
        // Nếu không có userId thì gửi '0'
        const userIdParam = userId || '0';
        return apiClient.post(`${ENDPOINTS.SHOWTIME}/${showtimeId}/lock-seat/${seatIds}?userId=${userIdParam}`);
    }

    async unlockSeats(showtimeId, seatIds) {
        return apiClient.post(`${ENDPOINTS.SHOWTIME}/${showtimeId}/unlock-seat/${seatIds}`);
    }

    // Generate upcoming dates for showtime display
    getUpcomingDates(days = 7) {
        const dates = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit'
                }),
                fullLabel: date.toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                isToday: i === 0
            });
        }
        return dates;
    }

    // Format time for display
    formatTime(timeString) {
        return timeString; // Already in HH:mm format
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// Create and export a singleton instance
export const showtimeService = new ShowtimeService();
export default showtimeService;
