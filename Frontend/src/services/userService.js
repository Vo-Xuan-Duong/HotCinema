import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

const userService = {
  // 1. Tạo User Mới (Admin only)
  createUser: async (data) => {
    return apiClient.post(ENDPOINTS.USERS, data);
  },

  // 2. Đăng Ký User Mới (Public)
  registerUser: async (data) => {
    return apiClient.post(`${ENDPOINTS.USERS}/register`, data);
  },

  // 3. Lấy User Theo ID
  getUserById: async (userId) => {
    return apiClient.get(`${ENDPOINTS.USERS}/${userId}`);
  },

  // 4. Lấy Tất Cả Users (Phân Trang)
  getAllUsers: async (params = {}) => {
    const { page = 0, size = 10, sortBy = 'id', sortDir = 'asc' } = params;
    return apiClient.get(ENDPOINTS.USERS, {
      params: { page, size, sortBy, sortDir }
    });
  },

  // Alias cho getAllUsers (backward compatibility)
  getUsers: async (params) => {
    return userService.getAllUsers(params);
  },

  // 5. Cập Nhật User
  updateUser: async (userId, data) => {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}`, data);
  },

  // 6. Xóa User
  deleteUser: async (userId) => {
    return apiClient.delete(`${ENDPOINTS.USERS}/${userId}`);
  },

  // 7. Tìm Kiếm Users
  searchUsers: async (keyword, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiClient.get(`${ENDPOINTS.USERS}/search`, {
      params: { keyword, page, size }
    });
  },

  // 8. Lấy User Theo Email
  getUserByEmail: async (email) => {
    return apiClient.get(`${ENDPOINTS.USERS}/email/${email}`);
  },

  // 9. Lấy User Theo Username
  getUserByUsername: async (username) => {
    return apiClient.get(`${ENDPOINTS.USERS}/username/${username}`);
  },

  // 10. Đổi Mật Khẩu
  changePassword: async (userId, passwordData) => {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}/password`, passwordData);
  },

  // 11. Cập Nhật Avatar
  updateAvatar: async (userId, avatarUrl) => {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}/avatar`, null, {
      params: { avatarUrl }
    });
  },

  // 12. Thay Đổi Role
  changeRole: async (userId, role) => {
    return apiClient.post(`${ENDPOINTS.USERS}/${userId}/change-roles`, null, {
      params: { role }
    });
  },

  // 13. Kích Hoạt User
  activateUser: async (userId) => {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}/activate`);
  },

  // 14. Vô Hiệu Hóa User
  deactivateUser: async (userId) => {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}/deactivate`);
  },

  // 15. Lấy Users Theo Role
  getUsersByRole: async (roleName, params = {}) => {
    const { page = 0, size = 10 } = params;
    return apiClient.get(`${ENDPOINTS.USERS}/role/${roleName}`, {
      params: { page, size }
    });
  },

  getAllStaff: async (params) => {
    return apiClient.get(`${ENDPOINTS.USERS}/staffs`, {params});
  },

  getAllCustomers: async (params) => {
    return apiClient.get(`${ENDPOINTS.USERS}/customers`, {params});
  },
};

export default userService; 