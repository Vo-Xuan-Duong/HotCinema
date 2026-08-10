import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

// Helpers to unwrap backend ResponseData envelope
const unwrap = (res) => res?.data ?? res;

const unwrapArray = (res) => {
    const data = unwrap(res);
    return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
};

const base = ENDPOINTS.PROMOTIONS; // '/promotions'

const promotionService = {
    // 1. GET /api/v1/promotions - Lấy tất cả promotions với phân trang
    getAllPromotions: async (page = 0, size = 10, sort = '') => {
        const params = { page, size };
        if (sort) params.sort = sort;
        const res = await apiClient.get(base, { params });
        return unwrap(res);
    },

    // 2. GET /api/v1/promotions/{id} - Lấy promotion theo ID
    getPromotionById: async (id) => {
        const res = await apiClient.get(`${base}/${id}`);
        return unwrap(res);
    },

    // 3. POST /api/v1/promotions - Tạo promotion mới (Admin only)
    createPromotion: async (promotionData) => {
        const res = await apiClient.post(base, promotionData);
        return unwrap(res);
    },

    // 4. PUT /api/v1/promotions/{id} - Cập nhật promotion (Admin only)
    updatePromotion: async (id, promotionData) => {
        const res = await apiClient.put(`${base}/${id}`, promotionData);
        return unwrap(res);
    },

    // 5. DELETE /api/v1/promotions/{id} - Xóa promotion (Admin only)
    deletePromotion: async (id) => {
        const res = await apiClient.delete(`${base}/${id}`);
        return unwrap(res);
    },

    // 6. POST /api/v1/promotions/{id}/activate - Kích hoạt promotion (Admin only)
    activatePromotion: async (id) => {
        const res = await apiClient.post(`${base}/${id}/activate`);
        return unwrap(res);
    },

    // 7. POST /api/v1/promotions/{id}/deactivate - Vô hiệu hóa promotion (Admin only)
    deactivatePromotion: async (id) => {
        const res = await apiClient.post(`${base}/${id}/deactivate`);
        return unwrap(res);
    },

    // 8. GET /api/v1/promotions/code/{code} - Lấy promotion theo code
    getPromotionByCode: async (code) => {
        const res = await apiClient.get(`${base}/code/${code}`);
        return unwrap(res);
    },

    // 9. GET /api/v1/promotions/active - Lấy tất cả promotions đang active
    getActivePromotions: async (page = 0, size = 10, sort = '') => {
        const params = { page, size };
        if (sort) params.sort = sort;
        const res = await apiClient.get(`${base}/active`, { params });
        return unwrap(res);
    },

    // Helper: Toggle promotion status (activate/deactivate)
    togglePromotionStatus: async (id, currentStatus) => {
        if (currentStatus === true || currentStatus === 'active') {
            return promotionService.deactivatePromotion(id);
        } else {
            return promotionService.activatePromotion(id);
        }
    },

    getVoucherByCode: async (code) => {
        return promotionService.getPromotionByCode(code);
    },
    getActiveVouchers: async (page = 0, size = 10, sort = '') => {
        return promotionService.getActivePromotions(page, size, sort);
    },
    toggleVoucherStatus: async (id, currentStatus) => {
        return promotionService.togglePromotionStatus(id, currentStatus);
    }
};

export default promotionService;
