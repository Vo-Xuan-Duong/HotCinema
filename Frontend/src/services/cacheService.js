import { apiClient } from '../utils/apiClient';
import { ENDPOINTS } from '../utils/constants';

const BASE_PATH = ENDPOINTS.CACHE;

const cacheService = {
  async getCacheNames() {
    return apiClient.get(`${BASE_PATH}/names`);
  },

  async clearAll() {
    return apiClient.delete(`${BASE_PATH}/clear-all`);
  },

  async clearByName(cacheName) {
    return apiClient.delete(`${BASE_PATH}/clear/${encodeURIComponent(cacheName)}`);
  },
};

export default cacheService;
