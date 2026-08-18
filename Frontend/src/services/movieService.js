import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.MOVIES;
const PUBLIC_MOVIE_STATUSES = new Set(['NOW_SHOWING', 'COMING_SOON', 'ENDED']);
const normalizeStatus = (value) => String(value || '').trim().toUpperCase();
const asRows = (data) => Array.isArray(data) ? data : data?.content || [];

const localDate = (value) => {
  if (!value) return null;
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
  }
  return String(value).slice(0, 10);
};

const toMoviePayload = (data = {}) => ({
  title: String(data.title || '').trim(),
  originalTitle: String(data.originalTitle || '').trim(),
  slug: String(data.slug || '').trim(),
  description: String(data.description || '').trim(),
  durationMinutes: Number(data.durationMinutes ?? data.duration),
  releaseDate: localDate(data.releaseDate),
  endDate: localDate(data.endDate),
  ageRating: String(data.ageRating || '').trim().toUpperCase(),
  originalLanguage: String(data.originalLanguage || '').trim(),
  director: String(data.director || '').trim(),
  actors: String(data.actors || '').trim(),
  country: String(data.country || '').trim(),
  productionCompany: String(data.productionCompany || '').trim(),
  posterUrl: String(data.posterUrl || data.poster || '').trim(),
  bannerUrl: String(data.bannerUrl || data.backdropUrl || '').trim(),
  trailerUrl: String(data.trailerUrl || data.trailer || '').trim(),
  status: normalizeStatus(data.status || 'DRAFT'),
});

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
    totalPages: rows.length ? Math.ceil(rows.length / size) : 0,
    first: page === 0,
    last: rows.length === 0 || page >= Math.ceil(rows.length / size) - 1,
    empty: rows.length === 0,
  };
};

const releaseYearOf = (movie) => {
  const value = movie?.releaseDate;
  if (!value) return null;
  if (typeof value === 'object' && value.year) return Number(value.year);
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? Number(String(value).slice(0, 4)) || null : date.getFullYear();
};

const textOf = (movie) => [
  movie?.title,
  movie?.originalTitle,
  movie?.director,
  movie?.actors,
  movie?.country,
  movie?.productionCompany,
].filter(Boolean).join(' ').toLowerCase();

const compareValues = (left, right, key) => {
  if (key === 'releaseDate' || key === 'createdAt' || key === 'updatedAt') {
    const a = new Date(left?.[key] || 0).getTime();
    const b = new Date(right?.[key] || 0).getTime();
    return (Number.isFinite(a) ? a : 0) - (Number.isFinite(b) ? b : 0);
  }
  const a = left?.[key];
  const b = right?.[key];
  if (typeof a === 'number' || typeof b === 'number') return Number(a || 0) - Number(b || 0);
  return String(a || '').localeCompare(String(b || ''), 'vi', { sensitivity: 'base' });
};

const filterAndSortRows = (rows, params = {}, { publicOnly = false } = {}) => {
  const keyword = String(params.keyword || params.query || params.q || '').trim().toLowerCase();
  const requestedStatus = normalizeStatus(params.status);
  const requestedYear = params.releaseYear == null || params.releaseYear === '' ? null : Number(params.releaseYear);

  let result = rows.filter((movie) => {
    const status = normalizeStatus(movie?.status);
    if (publicOnly && !PUBLIC_MOVIE_STATUSES.has(status)) return false;
    if (keyword && !textOf(movie).includes(keyword)) return false;
    if (requestedStatus && status !== requestedStatus) return false;
    if (requestedYear && releaseYearOf(movie) !== requestedYear) return false;
    return true;
  });

  const rawSort = String(params.sort || 'updatedAt,desc').replace(':', ',');
  const [sortKey = 'updatedAt', sortOrder = 'desc'] = rawSort.split(',');
  result = [...result].sort((left, right) => {
    const compared = compareValues(left, right, sortKey);
    return String(sortOrder).toLowerCase() === 'asc' ? compared : -compared;
  });

  return result;
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

  async getPublicMovieById(id) {
    const movie = await this.getMovieById(id);
    if (!PUBLIC_MOVIE_STATUSES.has(normalizeStatus(movie?.status))) {
      const error = new Error('Phim này hiện không được công khai.');
      error.code = 'MOVIE_NOT_PUBLIC';
      error.status = 404;
      throw error;
    }
    return movie;
  },

  async getByGenrePage(genre, params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${base}/genre/${encodeURIComponent(genre)}`, { params }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return makePage([], params);
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
      const rows = filterAndSortRows(await this.list(), { ...params, status: 'COMING_SOON' }, { publicOnly: true });
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
      const rows = filterAndSortRows(await this.list(), { ...params, status: 'NOW_SHOWING' }, { publicOnly: true });
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
      const rows = filterAndSortRows(await this.list(), { ...params, sort: params.sort || 'updatedAt,desc' }, { publicOnly: true });
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
      const rows = filterAndSortRows(await this.list(), params);
      return makePage(rows, params);
    }
  },

  async search(params = {}) {
    return asRows(await this.searchPage({ page: 0, size: 500, ...params }));
  },

  async searchPublicPage(params = {}) {
    const rows = filterAndSortRows(await this.list(), params, { publicOnly: true });
    return makePage(rows, params);
  },

  async searchPublic(params = {}) {
    return asRows(await this.searchPublicPage({ page: 0, size: 500, ...params }));
  },

  async createMovie(body) {
    return unwrapApiData(await apiClient.post(base, toMoviePayload(body)));
  },

  async updateMovie(id, body) {
    return unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(id)}`, toMoviePayload(body)));
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

export { filterAndSortRows as filterAndSortMovieRows, PUBLIC_MOVIE_STATUSES, toMoviePayload };
export default movieService;
