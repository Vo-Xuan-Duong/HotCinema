import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const BASE_PATH = ENDPOINTS.PEOPLE;

const toContentArray = (res) => (
  Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : [])
);

const peopleService = {
  async createPeople(data) {
    return apiClient.post(BASE_PATH, data);
  },

  async getPeopleById(id) {
    return apiClient.get(`${BASE_PATH}/${id}`);
  },

  async getPeoplePage(params = {}) {
    return apiClient.get(BASE_PATH, { params });
  },

  async getAllPeople() {
    return apiClient.get(`${BASE_PATH}/all`);
  },

  async listPeople(params = {}) {
    const res = await apiClient.get(BASE_PATH, { params });
    return toContentArray(res);
  },

  async updatePeople(id, data) {
    return apiClient.put(`${BASE_PATH}/${id}`, data);
  },

  async deletePeople(id) {
    return apiClient.delete(`${BASE_PATH}/${id}`);
  },

  async getPeopleByMovie(movieId) {
    return apiClient.get(`${BASE_PATH}/movie/${movieId}`);
  },
};

export default peopleService;
