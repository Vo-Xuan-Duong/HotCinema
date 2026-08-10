import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';

const notificationService = {
    async list(params) {
        return unwrapApiData(await apiClient.get(ENDPOINTS.NOTIFICATIONS, { params }));
    },

    async markAsRead(id) {
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`));
    },

    async markAllAsRead() {
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/read-all`));
    },

    async delete(id) {
        return unwrapApiData(await apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`));
    },

    async broadcast(payload) {
        return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/broadcast`, payload));
    },
};

export default notificationService;
