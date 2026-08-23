import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

/**
 * Room Service
 * Quản lý các API calls liên quan đến phòng chiếu
 */
const roomService = {
    /**
     * Lấy tất cả phòng chiếu với phân trang
     * @param {Object} params - Query parameters
     * @param {number} params.page - Số trang (default: 0)
     * @param {number} params.size - Số lượng items mỗi trang (default: 20)
     * @param {string} params.sort - Sắp xếp (e.g., "name,asc")
     * @returns {Promise<Object>} Page<RoomResponse>
     */
    async getAllRooms(params = {}) {
        const queryParams = {
            page: params.page || 0,
            size: params.size || 20,
            ...(params.sort && { sort: params.sort })
        };
        return apiClient.get(`${ENDPOINTS.ROOMS}/page`, { params: queryParams });
    },

    /**
     * Lấy phòng chiếu theo ID
     * @param {number} id - ID của phòng chiếu
     * @returns {Promise<Object>} RoomResponse object
     */
    async getRoomById(id) {
        return apiClient.get(`${ENDPOINTS.ROOMS}/${id}`);
    },

    /**
     * Lấy danh sách phòng chiếu theo rạp với phân trang
     * @param {number} cinemaId - ID của rạp
     * @param {Object} params - Query parameters
     * @param {number} params.page - Số trang (default: 0)
     * @param {number} params.size - Số lượng items mỗi trang (default: 20)
     * @param {string} params.sort - Sắp xếp
     * @returns {Promise<Object>} Page<RoomResponse>
     */
    async getRoomsByCinemaId(cinemaId) {
        return apiClient.get(`${ENDPOINTS.ROOMS}/cinema/${cinemaId}`);
    },

    /**
     * Tạo phòng chiếu mới
     * @param {number} cinemaId - ID của rạp
     * @param {Object} roomData - Dữ liệu phòng chiếu
     * @param {string} roomData.name - Tên phòng
     * @param {string} roomData.roomType - Loại phòng (STANDARD_2D, STANDARD_3D, IMAX, VIP)
     * @param {number} roomData.rowsCount - Số hàng ghế
     * @param {number} roomData.seatsPerRow - Số ghế mỗi hàng
     * @param {Array<number>} roomData.rowVip - Danh sách index hàng VIP (optional, default: [])
     * @param {number} roomData.price - Giá phòng (optional, default: 0)
     * @param {boolean} roomData.isActive - Trạng thái hoạt động (optional, default: true)
     * @returns {Promise<Object>} RoomResponse object
     */
    async createRoom(cinemaId, roomData) {
        return apiClient.post(`${ENDPOINTS.ROOMS}/cinema/${cinemaId}`, roomData);
    },

    /**
     * Cập nhật thông tin phòng chiếu
     * @param {number} id - ID của phòng chiếu
     * @param {Object} roomData - Dữ liệu cập nhật
     * @param {string} roomData.name - Tên phòng
     * @param {string} roomData.roomType - Loại phòng (STANDARD_2D, STANDARD_3D, IMAX, VIP)
     * @param {number} roomData.rowsCount - Số hàng ghế
     * @param {number} roomData.seatsPerRow - Số ghế mỗi hàng
     * @param {Array<number>} roomData.rowVip - Danh sách index hàng VIP (optional)
     * @param {number} roomData.price - Giá phòng (optional)
     * @param {boolean} roomData.isActive - Trạng thái hoạt động (optional)
     * @returns {Promise<Object>} RoomResponse object
     */
    async updateRoom(id, roomData) {
        return apiClient.put(`${ENDPOINTS.ROOMS}/${id}`, roomData);
    },

    /**
     * Xóa phòng chiếu
     * @param {number} id - ID của phòng chiếu
     * @returns {Promise<void>}
     */
    async deleteRoom(id) {
        return apiClient.delete(`${ENDPOINTS.ROOMS}/${id}`);
    },

    /**
     * Xóa tất cả phòng chiếu của rạp
     * @param {number} cinemaId - ID của rạp
     * @returns {Promise<void>}
     */
    async deleteAllRoomsByCinemaId(cinemaId) {
        return apiClient.delete(`${ENDPOINTS.ROOMS}/cinema/${cinemaId}`);
    },

    /**
     * Utility: Map room type từ frontend sang backend
     * @param {string} frontendType - Loại phòng frontend (2D, 3D, IMAX, VIP)
     * @returns {string} Backend room type
     */
    mapRoomTypeToBackend(frontendType) {
        const typeMap = {
            '2D': 'STANDARD_2D',
            '3D': 'STANDARD_3D',
            'IMAX': 'IMAX',
            'VIP': 'VIP'
        };
        return typeMap[frontendType] || 'STANDARD_2D';
    },

    /**
     * Utility: Map room type từ backend sang frontend
     * @param {string} backendType - Loại phòng backend (STANDARD_2D, STANDARD_3D, IMAX, VIP)
     * @returns {string} Frontend room type
     */
    mapRoomTypeToFrontend(backendType) {
        const typeMap = {
            'STANDARD_2D': '2D',
            'STANDARD_3D': '3D',
            'IMAX': 'IMAX',
            'VIP': 'VIP'
        };
        return typeMap[backendType] || '2D';
    },

    /**
     * Utility: Lấy danh sách phòng cho dropdown (không phân trang)
     * @param {number} cinemaId - ID của rạp
     * @returns {Promise<Array>} Simplified room list
     */
    async getRoomsForDropdown(cinemaId) {
        const response = await this.getRoomsByCinemaId(cinemaId);
        const rooms = response?.data?.data || response?.data || response || [];
        return rooms.map(room => ({
            value: room.id,
            label: room.name,
            type: this.mapRoomTypeToFrontend(room.roomType),
            totalSeats: room.totalSeats || (room.rowsCount * room.seatsPerRow)
        }));
    }
};

export default roomService;
