import { apiClient } from '../utils/apiClient';
import { ENDPOINTS } from '../utils/constants';

const roleService = {
  // 1. Tạo Role Mới
  createRole: async (data) => {
    return apiClient.post(ENDPOINTS.ROLES, data);
  },

  // 2. Lấy Tất Cả Roles (Phân Trang)
  getAllRoles: async (params = {}) => {
    const { page = 0, size = 10, sort = 'id,asc' } = params;
    return apiClient.get(ENDPOINTS.ROLES, {
      params: { page, size, sort }
    });
  },

  // 3. Lấy Tất Cả Roles (Không Phân Trang)
  getAllRolesList: async () => {
    return apiClient.get(`${ENDPOINTS.ROLES}/all`);
  },

  // 4. Lấy Role Theo ID
  getRoleById: async (roleId) => {
    return apiClient.get(`${ENDPOINTS.ROLES}/${roleId}`);
  },

  // 5. Lấy Role Theo Code
  getRoleByCode: async (code) => {
    return apiClient.get(`${ENDPOINTS.ROLES}/code/${code}`);
  },

  // 6. Cập Nhật Role (PUT)
  updateRole: async (roleId, data) => {
    return apiClient.put(`${ENDPOINTS.ROLES}/${roleId}`, data);
  },

  // 7. Cập Nhật Role Một Phần (PATCH)
  partialUpdateRole: async (roleId, data) => {
    return apiClient.patch(`${ENDPOINTS.ROLES}/${roleId}`, data);
  },

  // 8. Xóa Role
  deleteRole: async (roleId) => {
    return apiClient.delete(`${ENDPOINTS.ROLES}/${roleId}`);
  },

  // 9. Kích Hoạt Role
  activateRole: async (roleId) => {
    return apiClient.patch(`${ENDPOINTS.ROLES}/${roleId}/activate`);
  },

  // 10. Vô Hiệu Hóa Role
  deactivateRole: async (roleId) => {
    return apiClient.patch(`${ENDPOINTS.ROLES}/${roleId}/deactivate`);
  },

  // 11. Thêm Permissions Vào Role
  addPermissionsToRole: async (roleId, permissionIds) => {
    return apiClient.post(`${ENDPOINTS.ROLES}/${roleId}/permissions`, permissionIds);
  },

  // 12. Xóa Permissions Khỏi Role
  removePermissionsFromRole: async (roleId, permissionIds) => {
    return apiClient.delete(`${ENDPOINTS.ROLES}/${roleId}/permissions`, {
      data: permissionIds
    });
  },
};

export default roleService;

