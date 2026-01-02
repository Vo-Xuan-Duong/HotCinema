import { apiClient } from '../utils/apiClient';
import { ENDPOINTS } from '../utils/constants';

/**
 * Seat Service
 * Quản lý các API calls liên quan đến ghế ngồi
 */
const seatService = {
    /**
     * Tạo ghế mới
     * @param {Object} seatData - Dữ liệu ghế
     * @param {number} seatData.roomId - ID phòng chiếu
     * @param {string} seatData.rowLabel - Nhãn hàng (A, B, C...)
     * @param {string} seatData.seatNumber - Số ghế
     * @param {string} seatData.seatType - Loại ghế (STANDARD, VIP, COUPLE)
     * @param {boolean} seatData.isActive - Trạng thái hoạt động
     * @returns {Promise<Object>} Thông tin ghế vừa tạo
     */
    async createSeat(seatData) {
        return apiClient.post(ENDPOINTS.SEATS, seatData);
    },

    /**
     * Lấy thông tin ghế theo ID
     * @param {number} id - ID của ghế
     * @returns {Promise<Object>} Thông tin ghế
     */
    async getSeatById(id) {
        return apiClient.get(`${ENDPOINTS.SEATS}/${id}`);
    },

    /**
     * Lấy tất cả ghế của phòng chiếu
     * @param {number} roomId - ID phòng chiếu
     * @returns {Promise<Array>} Danh sách ghế
     */
    async getSeatsByRoomId(roomId) {
        return apiClient.get(`${ENDPOINTS.SEATS}/theater/${roomId}`);
    },

    /**
     * Lấy ghế đang hoạt động của phòng chiếu
     * @param {number} roomId - ID phòng chiếu
     * @returns {Promise<Array>} Danh sách ghế đang hoạt động
     */
    async getActiveSeatsByRoomId(roomId) {
        return apiClient.get(`${ENDPOINTS.SEATS}/theater/${roomId}/active`);
    },

    /**
     * Lấy ghế theo loại ghế
     * @param {string} seatType - Loại ghế (STANDARD, VIP, COUPLE)
     * @returns {Promise<Array>} Danh sách ghế
     */
    async getSeatsBySeatType(seatType) {
        return apiClient.get(`${ENDPOINTS.SEATS}/type/${seatType}`);
    },

    /**
     * Lấy ghế theo phòng và loại ghế
     * @param {number} roomId - ID phòng chiếu
     * @param {string} seatType - Loại ghế (STANDARD, VIP, COUPLE)
     * @returns {Promise<Array>} Danh sách ghế
     */
    async getSeatsByRoomAndType(roomId, seatType) {
        return apiClient.get(`${ENDPOINTS.SEATS}/theater/${roomId}/type/${seatType}`);
    },

    /**
     * Lấy tất cả ghế của rạp
     * @param {number} cinemaId - ID rạp chiếu
     * @returns {Promise<Array>} Danh sách ghế
     */
    async getSeatsByCinemaId(cinemaId) {
        return apiClient.get(`${ENDPOINTS.SEATS}/cinema/${cinemaId}`);
    },

    /**
     * Lấy ghế theo vị trí trong phòng
     * @param {number} roomId - ID phòng chiếu
     * @param {string} rowLabel - Nhãn hàng (A, B, C...)
     * @param {string} seatNumber - Số ghế
     * @returns {Promise<Object>} Thông tin ghế
     */
    async getSeatByPosition(roomId, rowLabel, seatNumber) {
        return apiClient.get(`${ENDPOINTS.SEATS}/theater/${roomId}/position/${rowLabel}/${seatNumber}`);
    },

    /**
     * Cập nhật toàn bộ thông tin ghế
     * @param {number} id - ID ghế
     * @param {Object} seatData - Dữ liệu ghế đầy đủ
     * @param {number} seatData.roomId - ID phòng chiếu
     * @param {string} seatData.rowLabel - Nhãn hàng
     * @param {string} seatData.seatNumber - Số ghế
     * @param {string} seatData.seatType - Loại ghế
     * @param {boolean} seatData.isActive - Trạng thái hoạt động
     * @returns {Promise<Object>} Thông tin ghế sau khi cập nhật
     */
    async updateSeat(id, seatData) {
        return apiClient.put(`${ENDPOINTS.SEATS}/${id}`, seatData);
    },

    /**
     * Cập nhật một phần thông tin ghế
     * @param {number} id - ID ghế
     * @param {Object} partialData - Dữ liệu cần cập nhật (các field tùy chọn)
     * @returns {Promise<Object>} Thông tin ghế sau khi cập nhật
     */
    async patchSeat(id, partialData) {
        return apiClient.patch(`${ENDPOINTS.SEATS}/${id}`, partialData);
    },

    /**
     * Kích hoạt ghế
     * @param {number} id - ID ghế
     * @returns {Promise<Object>} Thông tin ghế sau khi kích hoạt
     */
    async activateSeat(id) {
        return apiClient.patch(`${ENDPOINTS.SEATS}/${id}/activate`);
    },

    /**
     * Vô hiệu hóa ghế
     * @param {number} id - ID ghế
     * @returns {Promise<Object>} Thông tin ghế sau khi vô hiệu hóa
     */
    async deactivateSeat(id) {
        return apiClient.patch(`${ENDPOINTS.SEATS}/${id}/deactivate`);
    },

    /**
     * Xóa ghế
     * @param {number} id - ID ghế
     * @returns {Promise<void>}
     */
    async deleteSeat(id) {
        return apiClient.delete(`${ENDPOINTS.SEATS}/${id}`);
    },

    /**
     * Tạo hàng loạt ghế cho phòng chiếu
     * @param {number} roomId - ID phòng chiếu
     * @param {number} rowsCount - Số lượng hàng
     * @param {number} seatsPerRow - Số ghế mỗi hàng
     * @returns {Promise<void>}
     */
    async createBulkSeatsForRoom(roomId, rowsCount, seatsPerRow) {
        return apiClient.post(
            `${ENDPOINTS.SEATS}/theater/${roomId}/create-bulk`,
            null,
            {
                params: {
                    rowsCount,
                    seatsPerRow
                }
            }
        );
    },

    /**
     * Xóa tất cả ghế của phòng chiếu
     * @param {number} roomId - ID phòng chiếu
     * @returns {Promise<void>}
     */
    async deleteAllSeatsByRoomId(roomId) {
        return apiClient.delete(`${ENDPOINTS.SEATS}/theater/${roomId}`);
    }
};

export default seatService;
