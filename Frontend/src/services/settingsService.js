import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

const settingsService = {
  async get() {
    return unwrapApiData(await apiClient.get('/settings'));
  },

  async update(settings) {
    return unwrapApiData(await apiClient.put('/settings', settings));
  },
};

export default settingsService;
