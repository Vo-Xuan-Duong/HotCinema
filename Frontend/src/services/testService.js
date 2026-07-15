import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const BASE_PATH = ENDPOINTS.TEST;

const testService = {
  async testPermissions() {
    return apiClient.get(`${BASE_PATH}/permissions`);
  },

  async sendMail() {
    return apiClient.get(`${BASE_PATH}/sendmail`);
  },
};

export default testService;
