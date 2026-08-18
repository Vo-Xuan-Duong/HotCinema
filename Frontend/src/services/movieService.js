import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.MOVIES;
const normalizeStatus = (value) => String(value || '').trim().toUpperCase();

const asRows = (data) => Array.isArray(data) ? data : data?.content || [];
const makePage = (rows, params = {}) => {
  const page = Math.max(0, Number(params.page || 0));
  const size = Math.max(1, Number(params.size || 10));
  const start = page * size;
  return {
    content: rows.slice(start, start + size),
    number: page,
    page,
    size,
    totalElements: rows.length,
    totalPages: Math.ceil(rows.length / size),
  };
};

const movieService = {
  async listPage(params = {}) {
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async list(params = {}) {
    const result = await this.listPage({ page: 0, size: 500, ...params });
    return asRows(result);
  },

  async getMovieById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(id)}`));
  },

  async getByGenrePage(genre, params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = await this.list();
      const needle = String(genre || '').toLowerCase();
      return makePage(rows.filter((movie) => (
        Array.isArray(movie.genres) && movie.genres.some((item) => String(item?.name ?? item).toLowerCase() === needle)
      )), params);
    }
  },

  async getByGenre(genre, params = {}) {
    return asRows(await this.getByGenrePage(genre, { page: 0, size: 500, ...params }));
  },

  async getComingSoonPage(params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/coming-soon`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = (await this.list()).filter((movie) => normalizeStatus(movie.status) === 'COMING_SOON');
      return makePage(rows, params);
    }
  },

  async getComingSoon(params = {}) {
    return asRows(await this.getComingSoonPage({ page: 0, size: 500, ...params }));
  },

  async getNowShowingPage(params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/now-showing`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = (await this.list()).filter((movie) => normalizeStatus(movie.status) === 'NOW_SHOWING');
      return makePage(rows, params);
    }
  },

  async getNowShowing(params = {}) {
    return asRows(await this.getNowShowingPage({ page: 0, size: 500, ...params }));
  },

  async getTopRatedPage(params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/top-rated`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = [...await this.list()].sort((a, b) => Number(b.averageRating || b.ratingScore || 0) - Number(a.averageRating || a.ratingScore || 0));
      return makePage(rows, params);
    }
  },

  async getTopRated(params = {}) {
    return asRows(await this.getTopRatedPage({ page: 0, size: 500, ...params }));
  },

  async searchPage(params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/search`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const keyword = String(params.keyword || params.query || params.q || '').trim().toLowerCase();
      const rows = (await this.list()).filter((movie) => `${movie.title || ''} ${movie.originalTitle || ''} ${movie.director || ''} ${movie.actors || ''}`.toLowerCase().includes(keyword));
      return makePage(rows, params);
    }
  },

  async search(params = {}) {
    return asRows(await this.searchPage({ page: 0, size: 500, ...params }));
  },

  async createMovie(body) {
    return unwrapApiData(await apiClient.post(base, body));
  },

  async updateMovie(id, body) {
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(id)}`, body));
  },

  async activeMovie(id) {
    const movieId = normalizeResourceId(id);
    try {
      return unwrapApiData(await apiClient.patch(`${base}/${movieId}/activate`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const movie = await this.getMovieById(movieId);
      return this.updateMovie(movieId, { ...movie, status: 'NOW_SHOWING' });
    }
  },

  async deactiveMovie(id) {
    const movieId = normalizeResourceId(id);
    try {
      return unwrapApiData(await apiClient.patch(`${base}/${movieId}/deactivate`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const movie = await this.getMovieById(movieId);
      return this.updateMovie(movieId, { ...movie, status: 'HIDDEN' });
    }
  },

  async deleteMovie(id) {
    return apiClient.delete(`${base}/${normalizeResourceId(id)}`);
  },

  async deleteAllMovies() {
    const rows = await this.list();
    await Promise.all(rows.map((movie) => this.deleteMovie(movie.id)));
    return { deleted: rows.length };
  },
};

export default movieService;
