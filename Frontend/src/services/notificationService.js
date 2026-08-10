import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const notificationService = {
    list: (params) => apiClient.get(ENDPOINTS.NOTIFICATIONS, { params }),
    markAsRead: (id) => apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/${id}/read`),
    markAllAsRead: () => apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/read-all`),
    delete: (id) => apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/${id}`),
    broadcast: (payload) => apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/broadcast`, payload),
};

export default notificationService;
