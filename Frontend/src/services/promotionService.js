import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.PROMOTIONS;
const codesBase = ENDPOINTS.PROMOTION_CODES;

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const normalizePromotion = (promotion = {}, code = null) => ({
  ...promotion,
  code: code?.code || promotion.code || null,
  promotionCodeId: code?.id || promotion.promotionCodeId || null,
  codeActive: code?.active ?? promotion.codeActive ?? null,
  codeUsageLimit: code?.usageLimit ?? promotion.codeUsageLimit ?? null,
  codeUsedCount: code?.usedCount ?? promotion.codeUsedCount ?? null,
  startDate: promotion.startDate || promotion.startAt,
  endDate: promotion.endDate || promotion.endAt,
  startAt: promotion.startAt || promotion.startDate,
  endAt: promotion.endAt || promotion.endDate,
  isActive: String(promotion.status || '').toUpperCase() === 'ACTIVE' && (code?.active ?? true),
});

const promotionService = {
  async getAllPromotions(page = 0, size = 10, sort = '') {
    const params = { page, size };
    if (sort) params.sort = sort;
    const data = unwrapApiData(await apiClient.get(base, { params }));
    if (Array.isArray(data)) return data.map(normalizePromotion);
    if (data?.content) return { ...data, content: data.content.map(normalizePromotion) };
    return data;
  },

  async getPromotionById(id) {
    return normalizePromotion(unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(id)}`)));
  },

  async createPromotion(promotionData) {
    return normalizePromotion(unwrapApiData(await apiClient.post(base, promotionData)));
  },

  async updatePromotion(id, promotionData) {
    return normalizePromotion(unwrapApiData(await apiClient.put(`${base}/${normalizeResourceId(id)}`, promotionData)));
  },

  async deletePromotion(id) {
    return apiClient.delete(`${base}/${normalizeResourceId(id)}`);
  },

  async activatePromotion(id) {
    const promotionId = normalizeResourceId(id);
    try {
      return normalizePromotion(unwrapApiData(await apiClient.post(`${base}/${promotionId}/activate`)));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getPromotionById(promotionId);
      return this.updatePromotion(promotionId, { ...current, status: 'ACTIVE' });
    }
  },

  async deactivatePromotion(id) {
    const promotionId = normalizeResourceId(id);
    try {
      return normalizePromotion(unwrapApiData(await apiClient.post(`${base}/${promotionId}/deactivate`)));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getPromotionById(promotionId);
      return this.updatePromotion(promotionId, { ...current, status: 'INACTIVE' });
    }
  },

  async getPromotionByCode(code) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return null;

    try {
      const direct = unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(normalizedCode)}`));
      if (direct) return normalizePromotion(direct, { code: normalizedCode, active: true });
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
    }

    // The real backend models codes separately from promotion rules.
    const codesResponse = await apiClient.get(codesBase, { params: { page: 0, size: 500 } });
    const promotionCode = rowsOf(codesResponse)
      .find((item) => String(item.code || '').trim().toUpperCase() === normalizedCode);
    if (!promotionCode || promotionCode.active === false) return null;

    const promotion = await this.getPromotionById(promotionCode.promotionId);
    return promotion ? normalizePromotion(promotion, promotionCode) : null;
  },

  async getActivePromotions(page = 0, size = 10, sort = '') {
    try {
      const params = { page, size };
      if (sort) params.sort = sort;
      const data = unwrapApiData(await apiClient.get(`${base}/active`, { params }));
      if (Array.isArray(data)) return data.map(normalizePromotion);
      if (data?.content) return { ...data, content: data.content.map(normalizePromotion) };
      return data;
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const all = await this.getAllPromotions(0, 500, sort);
      const rows = Array.isArray(all) ? all : all?.content || [];
      const active = rows.filter((item) => String(item.status).toUpperCase() === 'ACTIVE');
      const start = page * size;
      return {
        content: active.slice(start, start + size),
        number: page,
        page,
        size,
        totalElements: active.length,
        totalPages: Math.ceil(active.length / size),
      };
    }
  },

  async togglePromotionStatus(id, currentStatus) {
    return String(currentStatus).toUpperCase() === 'ACTIVE' || currentStatus === true
      ? this.deactivatePromotion(id)
      : this.activatePromotion(id);
  },

  async getVoucherByCode(code) { return this.getPromotionByCode(code); },
  async getActiveVouchers(page = 0, size = 10, sort = '') { return this.getActivePromotions(page, size, sort); },
  async toggleVoucherStatus(id, currentStatus) { return this.togglePromotionStatus(id, currentStatus); },

  async listCodesForPromotion(promotionId) {
    const response = await apiClient.get(codesBase, { params: { page: 0, size: 500 } });
    return rowsOf(response).filter((item) => sameResourceId(item.promotionId, promotionId));
  },
};

export { normalizePromotion };
export default promotionService;
