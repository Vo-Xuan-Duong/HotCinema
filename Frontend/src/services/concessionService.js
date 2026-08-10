import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/concessions';

const concessionService = {
  async list(params) {
    return unwrapApiArray(await apiClient.get(base, { params }));
  },

  async create(payload) {
    return unwrapApiData(await apiClient.post(base, payload));
  },

  async update(id, payload) {
    return unwrapApiData(await apiClient.put(`${base}/${id}`, payload));
  },

  async delete(id) {
    return unwrapApiData(await apiClient.delete(`${base}/${id}`));
  },
};

export default concessionService;
