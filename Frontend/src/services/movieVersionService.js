import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const BASE_PATH = ENDPOINTS.MOVIE_VERSIONS;

const movieVersionService = {
  async createMovieVersion(data) {
    return apiClient.post(BASE_PATH, data);
  },

  async getMovieVersionById(id) {
    return apiClient.get(`${BASE_PATH}/${id}`);
  },

  async getAllMovieVersions() {
    return apiClient.get(BASE_PATH);
  },

  async getMovieVersionsByMovieId(movieId) {
    return apiClient.get(BASE_PATH, { params: { movieId } });
  },

  async updateMovieVersion(id, data) {
    return apiClient.put(`${BASE_PATH}/${id}`, data);
  },

  async deleteMovieVersion(id) {
    return apiClient.delete(`${BASE_PATH}/${id}`);
  },
};

export default movieVersionService;
