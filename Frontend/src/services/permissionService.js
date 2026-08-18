import { createCapabilityError } from '@/utils/backendCapability';

const unsupported = (feature) => {
  throw createCapabilityError(feature);
};

// The current backend does not expose a PermissionController/resource. Keep a
// stable service surface so callers fail with an explicit capability error
// instead of issuing requests to a non-existent /permissions endpoint.
const permissionService = {
  async createPermission() {
    return unsupported('tạo permission');
  },

  async getAllPermissions() {
    return unsupported('đọc danh sách permission');
  },

  async getAllPermissionsList() {
    return unsupported('đọc danh sách permission');
  },

  async getPermissionById() {
    return unsupported('đọc permission');
  },

  async updatePermission() {
    return unsupported('cập nhật permission');
  },

  async partialUpdatePermission() {
    return unsupported('cập nhật permission');
  },

  async deletePermission() {
    return unsupported('xóa permission');
  },
};

export default permissionService;
