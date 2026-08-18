import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { createCapabilityError, isEndpointUnavailable } from '@/utils/backendCapability';
import { normalizeResourceId } from '@/utils/resourceId';

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const pageOf = (rows, page = 0, size = 10) => {
  const start = page * size;
  return { content: rows.slice(start, start + size), number: page, page, size, totalElements: rows.length, totalPages: Math.ceil(rows.length / size) };
};

const userService = {
  async createUser(data) {
    return unwrapApiData(await apiClient.post(ENDPOINTS.USERS, data));
  },

  async registerUser(data) {
    return unwrapApiData(await apiClient.post('/auth/register', data));
  },

  async getUserById(userId) {
    return unwrapApiData(await apiClient.get(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}`));
  },

  async getAllUsers(params = {}) {
    const { page = 0, size = 10 } = params;
    return unwrapApiData(await apiClient.get(ENDPOINTS.USERS, { params: { page, size } }));
  },

  async updateUser(userId, data) {
    return unwrapApiData(await apiClient.put(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}`, data));
  },

  async deleteUser(userId) {
    return apiClient.delete(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}`);
  },

  async searchUsers(keyword, params = {}) {
    const { page = 0, size = 10 } = params;
    try {
      return unwrapApiData(await apiClient.get(`${ENDPOINTS.USERS}/search`, { params: { keyword, page, size } }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = rowsOf(await apiClient.get(ENDPOINTS.USERS, { params: { page: 0, size: 500 } }));
      const needle = String(keyword || '').trim().toLowerCase();
      return pageOf(rows.filter((user) => `${user.fullName || ''} ${user.email || ''} ${user.phone || ''}`.toLowerCase().includes(needle)), page, size);
    }
  },

  async getUserByEmail(email) {
    try {
      return unwrapApiData(await apiClient.get(`${ENDPOINTS.USERS}/email/${encodeURIComponent(email)}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const rows = rowsOf(await apiClient.get(ENDPOINTS.USERS, { params: { page: 0, size: 500 } }));
      return rows.find((user) => String(user.email || '').toLowerCase() === String(email || '').toLowerCase()) || null;
    }
  },

  async getUserByUsername(username) {
    return this.getUserByEmail(username);
  },

  async changePassword(userId, passwordData) {
    try {
      return unwrapApiData(await apiClient.put(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}/password`, passwordData));
    } catch (error) {
      if (isEndpointUnavailable(error)) throw createCapabilityError('đổi mật khẩu người dùng', error);
      throw error;
    }
  },

  async updateAvatar(userId, avatarUrl) {
    try {
      return unwrapApiData(await apiClient.put(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}/avatar`, { avatarUrl }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getUserById(userId);
      return this.updateUser(userId, { ...current, avatarUrl });
    }
  },

  async changeRole(userId, role) {
    try {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.USERS}/${normalizeResourceId(userId)}/change-roles`, { role }));
    } catch (error) {
      if (isEndpointUnavailable(error)) throw createCapabilityError('phân quyền người dùng', error);
      throw error;
    }
  },

  async setStatus(userId, status) {
    const current = await this.getUserById(userId);
    return this.updateUser(userId, { ...current, status: String(status).toUpperCase() });
  },

  async activateUser(userId) { return this.setStatus(userId, 'ACTIVE'); },
  async deactivateUser(userId) { return this.setStatus(userId, 'INACTIVE'); },

  async getUsersByRole(roleName, params = {}) {
    try {
      return unwrapApiData(await apiClient.get(`${ENDPOINTS.USERS}/role/${encodeURIComponent(roleName)}`, { params }));
    } catch (error) {
      if (isEndpointUnavailable(error)) throw createCapabilityError('lọc người dùng theo vai trò', error);
      throw error;
    }
  },

  async getAllStaff(params = {}) { return this.getUsersByRole('STAFF', params); },
  async getAllCustomers(params = {}) { return this.getUsersByRole('CUSTOMER', params); },
};

export default userService;
