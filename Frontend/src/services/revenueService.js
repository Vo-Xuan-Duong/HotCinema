import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const BASE_PATH = ENDPOINTS.REVENUE;

const revenueService = {
  async getSummary(params = {}) {
    return apiClient.get(`${BASE_PATH}/summary`, { params });
  },

  async getByDate(params = {}) {
    return apiClient.get(`${BASE_PATH}/by-date`, { params });
  },

  async getByMovie(params = {}) {
    return apiClient.get(`${BASE_PATH}/by-movie`, { params });
  },

  async getByCinema(params = {}) {
    return apiClient.get(`${BASE_PATH}/by-cinema`, { params });
  },

  async getByPaymentMethod(params = {}) {
    return apiClient.get(`${BASE_PATH}/by-payment-method`, { params });
  },

  async getTopMovies(params = {}) {
    return apiClient.get(`${BASE_PATH}/top-movies`, { params });
  },

  async getTopCinemas(params = {}) {
    return apiClient.get(`${BASE_PATH}/top-cinemas`, { params });
  },
};

export default revenueService;
