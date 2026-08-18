import { createCapabilityError } from '@/utils/backendCapability';

// Current backend stores `city` directly on Cinema and exposes no
// RegionController/resource. Keep this legacy module explicit so an old import
// fails with a capability error instead of issuing requests to an invented API.
const unsupported = (operation) => {
  throw createCapabilityError(`region (${operation}); backend hiện dùng Cinema.city trực tiếp`);
};

class RegionService {
  async getAllRegions() {
    return unsupported('danh sách');
  }

  async getRegionsAllNoPage() {
    return unsupported('danh sách không phân trang');
  }

  async getRegionById() {
    return unsupported('chi tiết');
  }

  async searchRegionsByName() {
    return unsupported('tìm kiếm');
  }

  async getRegionsForDropdown() {
    return unsupported('dropdown');
  }
}

export default new RegionService();
