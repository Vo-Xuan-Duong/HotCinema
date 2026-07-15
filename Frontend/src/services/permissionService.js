import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const permissionService = {
  // 1. Tạo Permission Mới
  createPermission: async (data) => {
    return apiClient.post(ENDPOINTS.PERMISSIONS, data);
  },

  // 2. Lấy Tất Cả Permissions (Phân Trang)
  getAllPermissions: async (params = {}) => {
    const { page = 0, size = 10, sort = 'id,asc' } = params;
    return apiClient.get(ENDPOINTS.PERMISSIONS, {
      params: { page, size, sort }
    });
  },

  // 3. Lấy Tất Cả Permissions (Không Phân Trang)
  getAllPermissionsList: async () => {
    return apiClient.get(`${ENDPOINTS.PERMISSIONS}/all`);
  },

  // 4. Lấy Permission Theo ID
  getPermissionById: async (permissionId) => {
    return apiClient.get(`${ENDPOINTS.PERMISSIONS}/${permissionId}`);
  },

  // 5. Cập Nhật Permission (PUT)
  updatePermission: async (permissionId, data) => {
    return apiClient.put(`${ENDPOINTS.PERMISSIONS}/${permissionId}`, data);
  },

  // 6. Cập Nhật Permission Một Phần (PATCH)
  partialUpdatePermission: async (permissionId, data) => {
    return apiClient.patch(`${ENDPOINTS.PERMISSIONS}/${permissionId}`, data);
  },

  // 7. Xóa Permission
  deletePermission: async (permissionId) => {
    return apiClient.delete(`${ENDPOINTS.PERMISSIONS}/${permissionId}`);
  },
};

export default permissionService;

