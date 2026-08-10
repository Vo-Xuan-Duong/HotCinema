import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';

const base = ENDPOINTS.MOVIES;

const movieService = {
  async listPage(params) {
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async list(params) {
    return unwrapApiArray(await apiClient.get(base, { params }));
  },

  async getMovieById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${id}`));
  },

  async getByGenrePage(genre, params) {
    return unwrapApiData(await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params }));
  },

  async getByGenre(genre, params) {
    return unwrapApiArray(await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params }));
  },

  async getComingSoonPage(params) {
    return unwrapApiData(await apiClient.get(`${base}/coming-soon`, { params }));
  },

  async getComingSoon(params) {
    return unwrapApiArray(await apiClient.get(`${base}/coming-soon`, { params }));
  },

  async getNowShowingPage(params) {
    return unwrapApiData(await apiClient.get(`${base}/now-showing`, { params }));
  },

  async getNowShowing(params) {
    return unwrapApiArray(await apiClient.get(`${base}/now-showing`, { params }));
  },

  async getTopRatedPage(params) {
    return unwrapApiData(await apiClient.get(`${base}/top-rated`, { params }));
  },

  async getTopRated(params) {
    return unwrapApiArray(await apiClient.get(`${base}/top-rated`, { params }));
  },

  async searchPage(params) {
    return unwrapApiData(await apiClient.get(`${base}/search`, { params }));
  },

  async search(params) {
    return unwrapApiArray(await apiClient.get(`${base}/search`, { params }));
  },

  async createMovie(body) {
    return unwrapApiData(await apiClient.post(base, body));
  },

  async updateMovie(id, body) {
    return unwrapApiData(await apiClient.put(`${base}/${id}`, body));
  },

  async activeMovie(id) {
    return unwrapApiData(await apiClient.patch(`${base}/${id}/activate`));
  },

  async deactiveMovie(id) {
    return unwrapApiData(await apiClient.patch(`${base}/${id}/deactivate`));
  },

  async deleteMovie(id) {
    return unwrapApiData(await apiClient.delete(`${base}/${id}`));
  },

  async deleteAllMovies() {
    return unwrapApiData(await apiClient.delete(base));
  },
};

export default movieService;
