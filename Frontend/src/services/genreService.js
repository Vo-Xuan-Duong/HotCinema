import apiClient from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const base = '/genres';

const genreService = {
  async getAllGenres() {
    return unwrapApiArray(await apiClient.get(base));
  },

  async getGenreById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${id}`));
  },

  async getGenreByName(name) {
    return unwrapApiData(await apiClient.get(`${base}/name/${encodeURIComponent(name)}`));
  },

  async createGenre(genreData) {
    return unwrapApiData(await apiClient.post(base, genreData));
  },

  async updateGenre(id, genreData) {
    return unwrapApiData(await apiClient.put(`${base}/${id}`, genreData));
  },

  async deleteGenre(id) {
    return unwrapApiData(await apiClient.delete(`${base}/${id}`));
  },
};

export default genreService;
