import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

const revenueService = {
  async getSummary(params) {
    return unwrapApiData(await apiClient.get('/revenue/summary', { params }));
  },

  async getByDate(params) {
    return unwrapApiData(await apiClient.get('/revenue/by-date', { params }));
  },

  async getTopMovies(params) {
    return unwrapApiData(await apiClient.get('/revenue/top-movies', { params }));
  },

  async getTopCinemas(params) {
    return unwrapApiData(await apiClient.get('/revenue/top-cinemas', { params }));
  },

  async getByPaymentMethod(params) {
    return unwrapApiData(await apiClient.get('/revenue/by-payment-method', { params }));
  },
};

export default revenueService;
