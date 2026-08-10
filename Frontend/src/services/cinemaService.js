import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';
import roomService from '@/services/roomService';

/**
 * Cinema Service
 * Quản lý các API calls liên quan đến rạp chiếu phim
 */
const cinemaService = {
  /**
   * Lấy tất cả rạp
   * @param {Object} params - Query parameters (page, size, sort)
   * @returns {Promise<Object>} Danh sách rạp (có thể có phân trang)
   */
  async getAllCinemas(params) {
    return apiClient.get(ENDPOINTS.CINEMAS, { params });
  },

  /**
   * Lấy danh sách rạp với filter
   * @param {Object} params - Filter params (cityId, isActive, etc.)
   * @returns {Promise<Array>} Danh sách rạp
   */
  getCinemas: async (params) => {
    return apiClient.get(ENDPOINTS.CINEMAS, { params });
  },

  /**
   * Lấy rạp theo ID
   * @param {number} cinemaId - ID của rạp
   * @returns {Promise<Object>} Thông tin rạp
   */
  getCinemaById: async (cinemaId) => {
    return apiClient.get(`${ENDPOINTS.CINEMAS}/${cinemaId}`);
  },

  /**
   * Lấy rạp theo region slug (khu vực)
   * @param {string} slug - Slug của region (ví dụ: "ho-chi-minh", "ha-noi")
   * @param {Object} params - Query parameters (page, size, sort)
   * @returns {Promise<Object>} Danh sách rạp trong region với pagination
   */
  getCinemasByRegion: async (slug, params = {}) => {
    return apiClient.get(`${ENDPOINTS.CINEMAS}/region-slug/${encodeURIComponent(slug)}`, {
      params
    });
  },

  /**
   * Tìm kiếm rạp theo keyword
   * @param {string} keyword - Từ khóa tìm kiếm
   * @param {Object} params - Query parameters (page, size, sort)
   * @returns {Promise<Object>} Danh sách rạp kết quả tìm kiếm với pagination
   */
  searchCinemas: async (keyword, params = {}) => {
    return apiClient.get(`${ENDPOINTS.CINEMAS}/search`, {
      params: { keyword, ...params }
    });
  },

  /**
   * Lấy tất cả rạp không phân trang
   * @returns {Promise<Array>} Danh sách tất cả rạp
   */
  getAllCinemasNoPagination: async () => {
    return apiClient.get(`${ENDPOINTS.CINEMAS}/all-no-page`);
  },

  /**
   * Tạo rạp mới (Admin)
   * @param {Object} data - Thông tin rạp
   * @returns {Promise<Object>} Rạp vừa tạo
   */
  createCinema: async (data) => {
    return apiClient.post(ENDPOINTS.CINEMAS, data);
  },

  /**
   * Cập nhật thông tin rạp (Admin)
   * @param {number} cinemaId - ID của rạp
   * @param {Object} data - Thông tin cập nhật
   * @returns {Promise<Object>} Rạp đã cập nhật
   */
  updateCinema: async (cinemaId, data) => {
    return apiClient.put(`${ENDPOINTS.CINEMAS}/${cinemaId}`, data);
  },

  /**
   * Cập nhật một phần thông tin rạp (Admin)
   * @param {number} cinemaId - ID của rạp
   * @param {Object} data - Thông tin cập nhật (chỉ các field cần cập nhật)
   * @returns {Promise<Object>} Rạp đã cập nhật
   */
  partialUpdateCinema: async (cinemaId, data) => {
    return apiClient.patch(`${ENDPOINTS.CINEMAS}/${cinemaId}`, data);
  },

  /**
   * Xóa rạp (Admin)
   * @param {number} cinemaId - ID của rạp
   * @returns {Promise<void>}
   */
  deleteCinema: async (cinemaId) => {
    return apiClient.delete(`${ENDPOINTS.CINEMAS}/${cinemaId}`);
  },

  /**
   * Thêm phòng chiếu mới cho rạp (Admin)
   * Delegates to roomService.createRoom()
   * @param {number} cinemaId - ID của rạp
   * @param {Object} roomData - Thông tin phòng chiếu
   * @param {string} roomData.name - Tên phòng
   * @param {string} roomData.roomType - Loại phòng (STANDARD_2D, STANDARD_3D, IMAX, VIP)
   * @param {number} roomData.rowsCount - Số hàng ghế
   * @param {number} roomData.seatsPerRow - Số ghế mỗi hàng
   * @param {Array<number>} roomData.rowVip - Danh sách index hàng VIP
   * @param {number} roomData.price - Giá cơ bản
   * @param {boolean} roomData.isActive - Trạng thái
   * @returns {Promise<Object>} Phòng chiếu vừa tạo
   */
  addRoom: async (cinemaId, roomData) => {
    // roomData đã được format đúng từ CinemaDetail.jsx
    // Gửi trực tiếp lên API mà không cần mapping
    return roomService.createRoom(cinemaId, roomData);
  },

  /**
   * Cập nhật thông tin phòng chiếu (Admin)
   * Delegates to roomService.updateRoom()
   * @param {number} cinemaId - ID của rạp (không sử dụng nhưng giữ lại cho consistency)
   * @param {number} roomId - ID của phòng chiếu
   * @param {Object} roomData - Thông tin cập nhật
   * @param {string} roomData.name - Tên phòng
   * @param {string} roomData.roomType - Loại phòng (STANDARD_2D, STANDARD_3D, IMAX, VIP)
   * @param {number} roomData.rowsCount - Số hàng ghế
   * @param {number} roomData.seatsPerRow - Số ghế mỗi hàng
   * @param {Array<number>} roomData.rowVip - Danh sách index hàng VIP
   * @param {number} roomData.price - Giá cơ bản
   * @param {boolean} roomData.isActive - Trạng thái
   * @returns {Promise<Object>} Phòng chiếu đã cập nhật
   */
  updateRoom: async (cinemaId, roomId, roomData) => {
    // roomData đã được format đúng từ CinemaDetail.jsx
    // Gửi trực tiếp lên API mà không cần mapping
    return roomService.updateRoom(roomId, roomData);
  },

  /**
   * Xóa phòng chiếu (Admin)
   * Delegates to roomService.deleteRoom()
   * @param {number} cinemaId - ID của rạp (không sử dụng nhưng giữ lại cho consistency)
   * @param {number} roomId - ID của phòng chiếu
   * @returns {Promise<void>}
   */
  deleteRoom: async (cinemaId, roomId) => {
    return roomService.deleteRoom(roomId);
  },

  /**
   * Lấy danh sách phòng chiếu của rạp
   * Delegates to roomService.getRoomsByCinemaId()
   * @param {number} cinemaId - ID của rạp
   * @returns {Promise<Array>} Danh sách phòng chiếu
   */
  getRoomsByCinemaId: async (cinemaId) => {
    return roomService.getRoomsByCinemaId(cinemaId);
  },

  /**
   * Lấy thông tin chi tiết phòng chiếu
   * Delegates to roomService.getRoomById()
   * @param {number} cinemaId - ID của rạp (không sử dụng nhưng giữ lại cho consistency)
   * @param {number} roomId - ID của phòng chiếu
   * @returns {Promise<Object>} Thông tin phòng chiếu
   */
  getRoomById: async (cinemaId, roomId) => {
    return roomService.getRoomById(roomId);
  },

  /**
   * Utility: Lấy rạp cho dropdown/select
   * @param {number} cityId - Optional city filter
   * @returns {Promise<Array>} Simplified cinema list
   */
  getCinemasForDropdown: async (cityId) => {
    const params = cityId ? { cityId } : {};
    const cinemas = await cinemaService.getCinemas(params);
    return (cinemas || []).map(cinema => ({
      value: cinema.id,
      label: cinema.name,
      cityId: cinema.cityId
    }));
  },
};

export default cinemaService;
