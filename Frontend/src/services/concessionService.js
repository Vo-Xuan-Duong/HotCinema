import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/cinemaproducts';

const concessionService = {
  async list() {
    return unwrapApiArray(await apiClient.get(base));
  },

  async listAvailableByCinema(cinemaId) {
    if (!cinemaId) return [];
    return unwrapApiArray(await apiClient.get(`${base}/cinema/${cinemaId}/available`));
  },

  async getById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${id}`));
  },

  async create(payload) {
    return unwrapApiData(await apiClient.post(base, payload));
  },

  async update(id, payload) {
    return unwrapApiData(await apiClient.put(`${base}/${id}`, payload));
  },

  async delete(id) {
    await apiClient.delete(`${base}/${id}`);
  },
};

export default concessionService;
