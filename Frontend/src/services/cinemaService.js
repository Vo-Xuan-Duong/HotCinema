import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import roomService from '@/services/roomService';

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

const cinemaService = {
  async getAllCinemas(params = {}) {
    return unwrapApiArray(await apiClient.get(ENDPOINTS.CINEMAS, { params }));
  },

  async getCinemas(params = {}) {
    return this.getAllCinemas(params);
  },

  async getCinemaById(cinemaId) {
    return unwrapApiData(await apiClient.get(`${ENDPOINTS.CINEMAS}/${cinemaId}`));
  },

  async getCinemasByRegion(slug) {
    const cinemas = await this.getAllCinemas();
    const target = normalizeText(slug).replace(/-/g, ' ');
    return cinemas.filter((cinema) => {
      const city = normalizeText(cinema.city);
      const district = normalizeText(cinema.district);
      return city === target || district === target || city.replace(/\s+/g, '-') === normalizeText(slug);
    });
  },

  async searchCinemas(keyword) {
    const cinemas = await this.getAllCinemas();
    const query = normalizeText(keyword);
    if (!query) return cinemas;
    return cinemas.filter((cinema) => [
      cinema.name,
      cinema.code,
      cinema.address,
      cinema.ward,
      cinema.district,
      cinema.city,
    ].some((value) => normalizeText(value).includes(query)));
  },

  async getAllCinemasNoPagination() {
    return this.getAllCinemas();
  },

  async createCinema(data) {
    return unwrapApiData(await apiClient.post(ENDPOINTS.CINEMAS, data));
  },

  async updateCinema(cinemaId, data) {
    return unwrapApiData(await apiClient.put(`${ENDPOINTS.CINEMAS}/${cinemaId}`, data));
  },

  async partialUpdateCinema(cinemaId, data) {
    const current = await this.getCinemaById(cinemaId);
    return this.updateCinema(cinemaId, { ...current, ...data });
  },

  async deleteCinema(cinemaId) {
    return unwrapApiData(await apiClient.delete(`${ENDPOINTS.CINEMAS}/${cinemaId}`));
  },

  async addRoom(cinemaId, roomData) {
    return roomService.createRoom(cinemaId, roomData);
  },

  async updateRoom(cinemaId, roomId, roomData) {
    return roomService.updateRoom(roomId, roomData);
  },

  async deleteRoom(cinemaId, roomId) {
    return roomService.deleteRoom(roomId);
  },

  async getRoomsByCinemaId(cinemaId) {
    return roomService.getRoomsByCinemaId(cinemaId);
  },

  async getRoomById(cinemaId, roomId) {
    return roomService.getRoomById(roomId);
  },

  async getCinemasForDropdown(city) {
    const cinemas = await this.getAllCinemas();
    return cinemas
      .filter((cinema) => !city || normalizeText(cinema.city) === normalizeText(city))
      .map((cinema) => ({
        value: cinema.id,
        label: cinema.name,
        city: cinema.city,
      }));
  },
};

export default cinemaService;
