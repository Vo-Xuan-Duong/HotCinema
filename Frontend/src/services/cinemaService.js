import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { ENDPOINTS } from '@/utils/constants';
import roomService from '@/services/roomService';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const normalizeCinema = (cinema = {}) => ({
  ...cinema,
  city: cinema.city || cinema.cityName || '',
  cityName: cinema.cityName || cinema.city || '',
  logoUrl: cinema.logoUrl || cinema.imageUrl || cinema.image || '',
  imageUrl: cinema.imageUrl || cinema.logoUrl || cinema.image || '',
  image: cinema.image || cinema.logoUrl || cinema.imageUrl || '',
  status: String(cinema.status || (cinema.isActive === false ? 'INACTIVE' : 'ACTIVE')).toUpperCase(),
  isActive: String(cinema.status || '').toUpperCase() === 'ACTIVE' || (!cinema.status && cinema.isActive !== false),
});

const normalizePage = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data.map(normalizeCinema);
  if (data?.content) return { ...data, content: data.content.map(normalizeCinema) };
  return data;
};

const normalizePayload = (data = {}) => ({
  ...data,
  ...(data.status ? { status: String(data.status).toUpperCase() } : {}),
  ...(data.logoUrl || data.imageUrl || data.image ? { logoUrl: data.logoUrl || data.imageUrl || data.image } : {}),
  ...(data.city || data.cityName ? { city: data.city || data.cityName } : {}),
});

const isPublicCinema = (cinema) => String(cinema?.status || '').toUpperCase() === 'ACTIVE';

const paginate = (rows, params = {}) => {
  const page = Math.max(0, Number(params.page || 0));
  const size = Math.max(1, Number(params.size || 12));
  const start = page * size;
  return {
    content: rows.slice(start, start + size),
    totalElements: rows.length,
    totalPages: rows.length ? Math.ceil(rows.length / size) : 0,
    number: page,
    page,
    size,
    first: page === 0,
    last: rows.length === 0 || page >= Math.ceil(rows.length / size) - 1,
    empty: rows.length === 0,
  };
};

const cinemaService = {
  async getAllCinemas(params = {}) {
    return normalizePage(await apiClient.get(ENDPOINTS.CINEMAS, { params }));
  },

  async getCinemas(params = {}) {
    return this.getAllCinemas(params);
  },

  async getCinemaById(cinemaId) {
    return normalizeCinema(unwrapApiData(await apiClient.get(`${ENDPOINTS.CINEMAS}/${normalizeResourceId(cinemaId)}`)));
  },

  async getPublicCinemaById(cinemaId) {
    const cinema = await this.getCinemaById(cinemaId);
    if (!isPublicCinema(cinema)) {
      const error = new Error('Rạp này hiện không hoạt động.');
      error.code = 'CINEMA_NOT_PUBLIC';
      error.status = 404;
      throw error;
    }
    return cinema;
  },

  async getPublicCinemas(params = {}) {
    const result = await this.getAllCinemas({ page: 0, size: 500 });
    let rows = (Array.isArray(result) ? result : result?.content || []).filter(isPublicCinema);
    const keyword = String(params.keyword || params.query || '').trim().toLowerCase();
    const city = String(params.city || '').trim().toLowerCase();

    if (keyword) {
      rows = rows.filter((cinema) => `${cinema.name || ''} ${cinema.address || ''} ${cinema.city || ''}`.toLowerCase().includes(keyword));
    }
    if (city) {
      rows = rows.filter((cinema) => String(cinema.city || '').trim().toLowerCase() === city);
    }

    rows = [...rows].sort((left, right) => String(left.name || '').localeCompare(String(right.name || ''), 'vi', { sensitivity: 'base' }));
    return paginate(rows, params);
  },

  async getCinemasByRegion(slug, params = {}) {
    if (MOCK_API_ENABLED) {
      return normalizePage(await apiClient.get(`${ENDPOINTS.CINEMAS}/region-slug/${encodeURIComponent(slug)}`, { params }));
    }
    // Current backend stores city directly on Cinema and has no region relation.
    return this.getPublicCinemas({ ...params, city: String(slug || '').replace(/-/g, ' ') });
  },

  async searchCinemas(keyword, params = {}) {
    if (MOCK_API_ENABLED) {
      return normalizePage(await apiClient.get(`${ENDPOINTS.CINEMAS}/search`, { params: { keyword, ...params } }));
    }
    try {
      return normalizePage(await apiClient.get(`${ENDPOINTS.CINEMAS}/search`, { params: { keyword, ...params } }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const result = await this.getAllCinemas({ page: 0, size: 500 });
      const rows = Array.isArray(result) ? result : result?.content || [];
      const needle = String(keyword || '').trim().toLowerCase();
      return rows.filter((cinema) => `${cinema.name || ''} ${cinema.address || ''} ${cinema.city || ''}`.toLowerCase().includes(needle));
    }
  },

  async searchPublicCinemas(keyword, params = {}) {
    return this.getPublicCinemas({ ...params, keyword });
  },

  async getAllCinemasNoPagination() {
    if (MOCK_API_ENABLED) return unwrapApiArray(await apiClient.get(`${ENDPOINTS.CINEMAS}/all-no-page`)).map(normalizeCinema);
    const result = await this.getAllCinemas({ page: 0, size: 500 });
    return Array.isArray(result) ? result : result?.content || [];
  },

  async createCinema(data) {
    return normalizeCinema(unwrapApiData(await apiClient.post(ENDPOINTS.CINEMAS, normalizePayload(data))));
  },

  async updateCinema(cinemaId, data) {
    const id = normalizeResourceId(cinemaId);
    return normalizeCinema(unwrapApiData(await apiClient.put(`${ENDPOINTS.CINEMAS}/${id}`, normalizePayload(data))));
  },

  async partialUpdateCinema(cinemaId, data) {
    const id = normalizeResourceId(cinemaId);
    try {
      return normalizeCinema(unwrapApiData(await apiClient.patch(`${ENDPOINTS.CINEMAS}/${id}`, normalizePayload(data))));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getCinemaById(id);
      return this.updateCinema(id, { ...current, ...data });
    }
  },

  async deleteCinema(cinemaId) {
    return apiClient.delete(`${ENDPOINTS.CINEMAS}/${normalizeResourceId(cinemaId)}`);
  },

  async addRoom(cinemaId, roomData) {
    return roomService.createRoom(cinemaId, roomData);
  },

  async updateRoom(_cinemaId, roomId, roomData) {
    return roomService.updateRoom(roomId, roomData);
  },

  async deleteRoom(_cinemaId, roomId) {
    return roomService.deleteRoom(roomId);
  },

  async getRoomsByCinemaId(cinemaId) {
    return roomService.getRoomsByCinemaId(cinemaId);
  },

  async getRoomById(_cinemaId, roomId) {
    return roomService.getRoomById(roomId);
  },

  async getCinemasForDropdown() {
    const cinemas = await this.getAllCinemasNoPagination();
    return cinemas.map((cinema) => ({ value: cinema.id, label: cinema.name, city: cinema.city }));
  },
};

export { normalizeCinema, normalizePayload as normalizeCinemaPayload, isPublicCinema };
export default cinemaService;
