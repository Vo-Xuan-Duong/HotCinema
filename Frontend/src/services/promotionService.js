import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';

const base = ENDPOINTS.PROMOTIONS;

const promotionService = {
  async getAllPromotions(page = 0, size = 10, sort = '') {
    const params = { page, size };
    if (sort) params.sort = sort;
    return unwrapApiData(await apiClient.get(base, { params }));
  },

  async getPromotionById(id) {
    return unwrapApiData(await apiClient.get(`${base}/${id}`));
  },

  async createPromotion(promotionData) {
    return unwrapApiData(await apiClient.post(base, promotionData));
  },

  async updatePromotion(id, promotionData) {
    return unwrapApiData(await apiClient.put(`${base}/${id}`, promotionData));
  },

  async deletePromotion(id) {
    return unwrapApiData(await apiClient.delete(`${base}/${id}`));
  },

  async activatePromotion(id) {
    return unwrapApiData(await apiClient.post(`${base}/${id}/activate`));
  },

  async deactivatePromotion(id) {
    return unwrapApiData(await apiClient.post(`${base}/${id}/deactivate`));
  },

  async getPromotionByCode(code) {
    return unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(code)}`));
  },

  async getActivePromotions(page = 0, size = 10, sort = '') {
    const params = { page, size };
    if (sort) params.sort = sort;
    return unwrapApiData(await apiClient.get(`${base}/active`, { params }));
  },

  async togglePromotionStatus(id, currentStatus) {
    return currentStatus === true || currentStatus === 'active'
      ? promotionService.deactivatePromotion(id)
      : promotionService.activatePromotion(id);
  },

  async getVoucherByCode(code) {
    return promotionService.getPromotionByCode(code);
  },

  async getActiveVouchers(page = 0, size = 10, sort = '') {
    return promotionService.getActivePromotions(page, size, sort);
  },

  async toggleVoucherStatus(id, currentStatus) {
    return promotionService.togglePromotionStatus(id, currentStatus);
  },
};

export default promotionService;
