import { apiClient } from '@/utils/apiClient';

const unwrap = (response) => response?.data ?? response;

const revenueService = {
  async getSummary(params) {
    return unwrap(await apiClient.get('/revenue/summary', { params }));
  },
  async getByDate(params) {
    return unwrap(await apiClient.get('/revenue/by-date', { params }));
  },
  async getTopMovies(params) {
    return unwrap(await apiClient.get('/revenue/top-movies', { params }));
  },
  async getTopCinemas(params) {
    return unwrap(await apiClient.get('/revenue/top-cinemas', { params }));
  },
  async getByPaymentMethod(params) {
    return unwrap(await apiClient.get('/revenue/by-payment-method', { params }));
  },
};

export default revenueService;
