import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { createCapabilityError, isEndpointUnavailable } from '@/utils/backendCapability';
import { ENDPOINTS } from '@/utils/constants';
import { normalizeResourceId } from '@/utils/resourceId';

const rowsOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const roleService = {
  async createRole(data) {
    return unwrapApiData(await apiClient.post(ENDPOINTS.ROLES, data));
  },

  async getAllRoles(params = {}) {
    const { page = 0, size = 10 } = params;
    return unwrapApiData(await apiClient.get(ENDPOINTS.ROLES, { params: { page, size } }));
  },

  async getAllRolesList() {
    try {
      return rowsOf(await apiClient.get(`${ENDPOINTS.ROLES}/all`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return rowsOf(await apiClient.get(ENDPOINTS.ROLES, { params: { page: 0, size: 500 } }));
    }
  },

  async getRoleById(roleId) {
    return unwrapApiData(await apiClient.get(`${ENDPOINTS.ROLES}/${normalizeResourceId(roleId)}`));
  },

  async getRoleByCode(code) {
    try {
      return unwrapApiData(await apiClient.get(`${ENDPOINTS.ROLES}/code/${encodeURIComponent(code)}`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const normalizedCode = String(code || '').trim().toUpperCase();
      return (await this.getAllRolesList()).find(
        (role) => String(role.code || '').trim().toUpperCase() === normalizedCode,
      ) || null;
    }
  },

  async updateRole(roleId, data) {
    return unwrapApiData(await apiClient.put(
      `${ENDPOINTS.ROLES}/${normalizeResourceId(roleId)}`,
      data,
    ));
  },

  async partialUpdateRole(roleId, data) {
    const id = normalizeResourceId(roleId);
    try {
      return unwrapApiData(await apiClient.patch(`${ENDPOINTS.ROLES}/${id}`, data));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getRoleById(id);
      return this.updateRole(id, { ...current, ...data });
    }
  },

  async deleteRole(roleId) {
    return apiClient.delete(`${ENDPOINTS.ROLES}/${normalizeResourceId(roleId)}`);
  },

  async activateRole(roleId) {
    const error = createCapabilityError('kích hoạt role');
    error.roleId = normalizeResourceId(roleId);
    throw error;
  },

  async deactivateRole(roleId) {
    const error = createCapabilityError('vô hiệu hóa role');
    error.roleId = normalizeResourceId(roleId);
    throw error;
  },

  async addPermissionsToRole(roleId, permissionIds) {
    const error = createCapabilityError('gán permission cho role');
    error.roleId = normalizeResourceId(roleId);
    error.permissionIds = permissionIds;
    throw error;
  },

  async removePermissionsFromRole(roleId, permissionIds) {
    const error = createCapabilityError('gỡ permission khỏi role');
    error.roleId = normalizeResourceId(roleId);
    error.permissionIds = permissionIds;
    throw error;
  },
};

export default roleService;
