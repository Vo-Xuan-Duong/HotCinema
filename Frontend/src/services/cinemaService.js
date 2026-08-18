import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { ENDPOINTS } from '@/utils/constants';
import roomService from '@/services/roomService';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const normalizeCinema = (cinema = {}) => ({
  ...cinema,
  city: cinema.city || cinema.cityName || cinema.regionName || '',
  cityName: cinema.cityName || cinema.city || cinema.regionName || '',
  logoUrl: cinema.logoUrl || cinema.imageUrl || cinema.image || '',
  imageUrl: cinema.imageUrl || cinema.logoUrl || cinema.image || '',
  image: cinema.image || cinema.logoUrl || cinema.imageUrl || '',
  status: String(cinema.status || (cinema.isActive === false ? 'INACTIVE' : 'ACTIVE')).toUpperCase(),
  isActive: String(cinema.status || '').toUpperCase() !== 'INACTIVE' && cinema.isActive !== false,
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

  async getCinemasByRegion(slug, params = {}) {
    if (MOCK_API_ENABLED) {
      return normalizePage(await apiClient.get(`${ENDPOINTS.CINEMAS}/region-slug/${encodeURIComponent(slug)}`, { params }));
    }
    const result = await this.getAllCinemas({ page: 0, size: 500 });
    const rows = Array.isArray(result) ? result : result?.content || [];
    const needle = String(slug || '').toLowerCase().replace(/-/g, ' ');
    return rows.filter((cinema) => String(cinema.city || '').toLowerCase().includes(needle));
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
      return rows.filter((cinema) => `${cinema.name} ${cinema.address} ${cinema.city}`.toLowerCase().includes(needle));
    }
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

export { normalizeCinema, normalizePayload as normalizeCinemaPayload };
export default cinemaService;
