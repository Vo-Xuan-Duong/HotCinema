import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { createCapabilityError, isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.PROMOTIONS;
const codesBase = ENDPOINTS.PROMOTION_CODES;

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const isoDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

const normalizePromotion = (promotion = {}, code = null) => ({
  ...promotion,
  code: code?.code || promotion.code || null,
  promotionCodeId: code?.id || promotion.promotionCodeId || null,
  codeActive: code?.active ?? promotion.codeActive ?? null,
  codeUsageLimit: code?.usageLimit ?? promotion.codeUsageLimit ?? null,
  codeUsedCount: code?.usedCount ?? promotion.codeUsedCount ?? null,
  minimumOrderAmount: Number(promotion.minimumOrderAmount ?? promotion.minPurchaseAmount ?? promotion.minPurchase ?? 0),
  maxDiscountAmount: Number(promotion.maxDiscountAmount ?? promotion.maxDiscount ?? 0),
  discountValue: Number(promotion.discountValue || 0),
  usageLimit: Number(promotion.usageLimit || 0),
  usagePerUser: Number(promotion.usagePerUser || 0),
  startDate: promotion.startDate || promotion.startAt,
  endDate: promotion.endDate || promotion.endAt,
  startAt: promotion.startAt || promotion.startDate,
  endAt: promotion.endAt || promotion.endDate,
  status: String(promotion.status || (promotion.isActive ? 'ACTIVE' : 'INACTIVE')).toUpperCase(),
  isActive: String(promotion.status || '').toUpperCase() === 'ACTIVE' || promotion.isActive === true,
});

const normalizePromotionCode = (code = {}) => ({
  ...code,
  id: normalizeResourceId(code.id),
  promotionId: normalizeResourceId(code.promotionId),
  code: String(code.code || '').trim().toUpperCase(),
  usageLimit: Number(code.usageLimit || 0),
  usedCount: Number(code.usedCount || 0),
  active: Boolean(code.active),
});

const toPromotionPayload = (data = {}) => ({
  name: String(data.name || '').trim(),
  description: String(data.description || '').trim(),
  discountType: String(data.discountType || 'PERCENTAGE').trim().toUpperCase(),
  discountValue: Number(data.discountValue || 0),
  maxDiscountAmount: Number(data.maxDiscountAmount ?? data.maxDiscount ?? 0),
  minimumOrderAmount: Number(data.minimumOrderAmount ?? data.minPurchaseAmount ?? data.minPurchase ?? 0),
  startAt: isoDateTime(data.startAt ?? data.startDate),
  endAt: isoDateTime(data.endAt ?? data.endDate),
  usageLimit: Number(data.usageLimit || 0),
  usagePerUser: Number(data.usagePerUser || 1),
  status: String(data.status || 'DRAFT').trim().toUpperCase(),
});

const toPromotionCodePayload = (promotionId, data = {}) => ({
  promotionId: normalizeResourceId(promotionId ?? data.promotionId),
  code: String(data.code || '').trim().toUpperCase(),
  usageLimit: Number(data.usageLimit || 0),
  usedCount: Number(data.usedCount || 0),
  active: Boolean(data.active),
});

const syntheticMockCode = (promotion) => {
  if (!promotion?.code) return null;
  return normalizePromotionCode({
    id: `mock-code-${promotion.id}`,
    promotionId: promotion.id,
    code: promotion.code,
    usageLimit: promotion.codeUsageLimit ?? promotion.usageLimit ?? 0,
    usedCount: promotion.codeUsedCount ?? promotion.usedCount ?? 0,
    active: promotion.codeActive ?? promotion.isActive ?? true,
  });
};

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
    const payload = MOCK_API_ENABLED ? { ...toPromotionPayload(promotionData), ...promotionData } : toPromotionPayload(promotionData);
    return normalizePromotion(unwrapApiData(await apiClient.post(base, payload)));
  },

  async updatePromotion(id, promotionData) {
    const promotionId = normalizeResourceId(id);
    const payload = MOCK_API_ENABLED ? { ...promotionData, ...toPromotionPayload(promotionData) } : toPromotionPayload(promotionData);
    return normalizePromotion(unwrapApiData(await apiClient.put(`${base}/${promotionId}`, payload)));
  },

  async deletePromotion(id) {
    return apiClient.delete(`${base}/${normalizeResourceId(id)}`);
  },

  async activatePromotion(id) {
    const promotionId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) {
      return normalizePromotion(unwrapApiData(await apiClient.post(`${base}/${promotionId}/activate`)));
    }
    const current = await this.getPromotionById(promotionId);
    return this.updatePromotion(promotionId, { ...current, status: 'ACTIVE' });
  },

  async deactivatePromotion(id) {
    const promotionId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) {
      return normalizePromotion(unwrapApiData(await apiClient.post(`${base}/${promotionId}/deactivate`)));
    }
    const current = await this.getPromotionById(promotionId);
    return this.updatePromotion(promotionId, { ...current, status: 'INACTIVE' });
  },

  // Admin lookup. It may enumerate the PromotionCode collection as a fallback
  // because admin already has access to the management resource.
  async getPromotionByCode(code) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return null;

    if (MOCK_API_ENABLED) {
      const direct = unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(normalizedCode)}`));
      return direct ? normalizePromotion(direct, syntheticMockCode(direct)) : null;
    }

    try {
      const direct = unwrapApiData(await apiClient.get(`${base}/code/${encodeURIComponent(normalizedCode)}`));
      if (direct) return normalizePromotion(direct, { code: normalizedCode, active: true });
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
    }

    const codesResponse = await apiClient.get(codesBase, { params: { page: 0, size: 1000 } });
    const promotionCode = rowsOf(codesResponse)
      .map(normalizePromotionCode)
      .find((item) => item.code === normalizedCode);
    if (!promotionCode || promotionCode.active === false) return null;

    const promotion = await this.getPromotionById(promotionCode.promotionId);
    return promotion ? normalizePromotion(promotion, promotionCode) : null;
  },

  async validateCodeForCheckout(code, context = {}) {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) return null;
    if (MOCK_API_ENABLED) return this.getPromotionByCode(normalizedCode);

    try {
      const result = unwrapApiData(await apiClient.post(`${codesBase}/validate`, {
        code: normalizedCode,
        showtimeId: normalizeResourceId(context.showtimeId),
        subtotal: Number(context.subtotal || 0),
      }));
      if (!result) return null;
      return normalizePromotion(result.promotion || result, {
        ...(result.promotionCode || {}),
        code: normalizedCode,
        active: result.active ?? result.promotionCode?.active ?? true,
      });
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      // Never enumerate /promotioncodes from a customer session to discover
      // private/unused codes. Validation must be a server-side command.
      throw createCapabilityError('xác thực mã khuyến mãi tại checkout', error);
    }
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

  async getPromotionCodes(promotionId) {
    const id = normalizeResourceId(promotionId);
    if (MOCK_API_ENABLED) {
      const promotion = await this.getPromotionById(id);
      const code = syntheticMockCode(promotion);
      return code ? [code] : [];
    }
    const data = rowsOf(await apiClient.get(codesBase, { params: { page: 0, size: 1000 } }));
    return data.map(normalizePromotionCode).filter((code) => sameResourceId(code.promotionId, id));
  },

  async createPromotionCode(promotionId, data) {
    if (MOCK_API_ENABLED) {
      const promotion = await this.getPromotionById(promotionId);
      return normalizePromotionCode({
        id: `mock-code-${promotionId}`,
        promotionId,
        ...data,
        code: data.code,
        active: data.active ?? true,
      });
    }
    return normalizePromotionCode(unwrapApiData(await apiClient.post(codesBase, toPromotionCodePayload(promotionId, data))));
  },

  async updatePromotionCode(id, promotionId, data) {
    if (MOCK_API_ENABLED) {
      return normalizePromotionCode({ id, promotionId, ...data });
    }
    return normalizePromotionCode(unwrapApiData(await apiClient.put(
      `${codesBase}/${normalizeResourceId(id)}`,
      toPromotionCodePayload(promotionId, data),
    )));
  },

  async deletePromotionCode(id) {
    if (MOCK_API_ENABLED) return { deleted: true, id };
    return apiClient.delete(`${codesBase}/${normalizeResourceId(id)}`);
  },

  async setPromotionCodeActive(code, active) {
    const normalized = normalizePromotionCode(code);
    return this.updatePromotionCode(normalized.id, normalized.promotionId, { ...normalized, active });
  },
};

export {
  normalizePromotion,
  normalizePromotionCode,
  toPromotionPayload,
  toPromotionCodePayload,
};
export default promotionService;
