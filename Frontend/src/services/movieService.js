import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

// Helpers to unwrap backend ResponseData envelope
// unwrap: Lấy data từ ResponseData envelope { statusCode, message, data }
const unwrap = (res) => res?.data ?? res;

// unwrapArray: Chỉ lấy mảng content (không có thông tin phân trang)
const unwrapArray = (res) => {
  const data = unwrap(res);
  return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
};

const base = ENDPOINTS.MOVIES; // '/movies'

const movieService = {
  // List (paginated) - returns full Page object with pagination info
  async listPage(params) {
    const res = await apiClient.get(base, { params });
    return unwrap(res); // Trả về { content: [...], totalElements, totalPages, size, number, ... }
  },

  // List content only (array of items) - no pagination info
  async list(params) {
    const res = await apiClient.get(base, { params });
    return unwrapArray(res); // Chỉ trả về mảng content
  },

  // Backward-compat aliases
  async getAllMovies(params) { return this.listPage(params); }, // Đổi từ list -> listPage để giữ pagination
  async getMovies(params) { return this.listPage(params); },

  // Get by id
  async getMovieById(id) {
    const res = await apiClient.get(`${base}/${id}`);
    return unwrap(res);
  },

  // By genre (paginated)
  async getByGenrePage(genre, params) {
    const res = await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params });
    return unwrap(res); // Trả về full Page object
  },
  async getByGenre(genre, params) {
    const res = await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params });
    return unwrapArray(res); // Chỉ trả về mảng
  },

  // Coming soon (paginated)
  async getComingSoonPage(params) {
    const res = await apiClient.get(`${base}/coming-soon`, { params });
    return unwrap(res);
  },
  async getComingSoon(params) {
    const res = await apiClient.get(`${base}/coming-soon`, { params });
    return unwrapArray(res);
  },

  // Now showing (paginated)
  async getNowShowingPage(params) {
    const res = await apiClient.get(`${base}/now-showing`, { params });
    return unwrap(res);
  },
  async getNowShowing(params) {
    const res = await apiClient.get(`${base}/now-showing`, { params });
    return unwrapArray(res);
  },

  // Top rated (paginated)
  async getTopRatedPage(params) {
    const res = await apiClient.get(`${base}/top-rated`, { params });
    return unwrap(res);
  },
  async getTopRated(params) {
    const res = await apiClient.get(`${base}/top-rated`, { params });
    return unwrapArray(res);
  },

  // Search (paginated) - supports keyword, genre, language, page, size, sort
  async searchPage(params) {
    const res = await apiClient.get(`${base}/search`, { params });
    return unwrap(res);
  },
  async search(params) {
    const res = await apiClient.get(`${base}/search`, { params });
    return unwrapArray(res);
  },

  // Create / Update / Delete
  async createMovie(body) {
    const res = await apiClient.post(base, body);
    return unwrap(res);
  },
  async updateMovie(id, body) {
    const res = await apiClient.put(`${base}/${id}`, body);
    return unwrap(res);
  },

  async activeMovie(id) {
    const res = await apiClient.patch(`${base}/${id}/activate`);
    return unwrap(res);
  },
  async deactiveMovie(id) {
    const res = await apiClient.patch(`${base}/${id}/deactivate`);
    return unwrap(res);
  },

  async deleteMovie(id) {
    const res = await apiClient.delete(`${base}/${id}`);
    return unwrap(res);
  },
  async deleteAllMovies() {
    const res = await apiClient.delete(base);
    return unwrap(res);
  },
};

export default movieService; 