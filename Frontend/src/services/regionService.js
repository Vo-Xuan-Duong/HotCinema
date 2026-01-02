import { apiClient } from '../utils/apiClient';
import { ENDPOINTS } from '../utils/constants';

/**
 * Region Service
 * Base URL: /api/v1/regions
 */
class RegionService {
    /**
     * GET /api/v1/regions
     * Lấy tất cả regions với phân trang
     * @param {Object} params - Query parameters
     * @param {number} params.page - Số trang (default: 0)
     * @param {number} params.size - Số items per page (default: 20)
     * @param {string} params.sort - Sắp xếp (VD: "name,asc" hoặc "name,desc")
     * @returns {Promise<Object>} Pagination response với danh sách regions
     */
    async getAllRegions() {
        return apiClient.get(ENDPOINTS.REGIONS);
    }

    /**
     * GET /api/v1/regions/all-no-page
     * Lấy tất cả regions đang hoạt động (không phân trang)
     * @returns {Promise<Array>} Danh sách regions đang active
     */
    async getRegionsAllNoPage() {
        return apiClient.get(`${ENDPOINTS.REGIONS}`);
    }

    /**
     * GET /api/v1/regions/{id}
     * Lấy region theo ID
     * @param {number} id - ID của region
     * @returns {Promise<Object>} Region object
     */
    async getRegionById(id) {
        return apiClient.get(`${ENDPOINTS.REGIONS}/${id}`);
    }

    /**
     * GET /api/v1/regions/search
     * Tìm kiếm regions theo tên (không phân biệt hoa thường)
     * @param {string} name - Tên region để tìm kiếm
     * @returns {Promise<Array>} Danh sách regions khớp với tên
     */
    async searchRegionsByName(name) {
        return apiClient.get(`${ENDPOINTS.REGIONS}/search`, {
            params: { name }
        });
    }

    /**
     * Utility: Lấy regions cho dropdown/select
     * @returns {Promise<Array>} Simplified region list với id và name
     */
    async getRegionsForDropdown() {
        try {
            const response = await this.getRegionsAllNoPage();
            const regions = Array.isArray(response?.data) ? response.data : [];
            return regions.map(region => ({
                value: region.id,
                label: region.name
            }));
        } catch (error) {
            console.error('Error getting regions for dropdown:', error);
            return [];
        }
    }
}

export default new RegionService();

