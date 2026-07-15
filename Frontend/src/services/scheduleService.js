import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

class ScheduleService {
    async getAllSchedules(params) {
        return apiClient.get(ENDPOINTS.SCHEDULES, { params });
    }

    async getSchedulesByDate(date) {
        return apiClient.get(ENDPOINTS.SCHEDULES, { params: { date } });
    }

    async getSchedulesByCinema(cinemaId) {
        return apiClient.get(ENDPOINTS.SCHEDULES, { params: { cinemaId } });
    }

    async getSchedulesByMovie(movieId) {
        return apiClient.get(ENDPOINTS.SCHEDULES, { params: { movieId } });
    }

    async getSchedulesByDateAndCinema(date, cinemaId) {
        return apiClient.get(ENDPOINTS.SCHEDULES, { params: { date, cinemaId } });
    }

    async getScheduleById(id) {
        return apiClient.get(`${ENDPOINTS.SCHEDULES}/${id}`);
    }

    // Generate upcoming dates for schedule display
    getUpcomingDates(days = 7) {
        const dates = [];
        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: date.toLocaleDateString('vi-VN', {
                    weekday: 'short',
                    day: '2-digit',
                    month: '2-digit'
                }),
                fullLabel: date.toLocaleDateString('vi-VN', {
                    weekday: 'long',
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
export const scheduleService = new ScheduleService();