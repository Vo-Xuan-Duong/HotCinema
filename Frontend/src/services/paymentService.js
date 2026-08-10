import { apiClient } from '@/utils/apiClient';
import { ENDPOINTS } from '@/utils/constants';

// Helpers to unwrap backend ResponseData envelope
const unwrap = (res) => res?.data ?? res;

const unwrapArray = (res) => {
    const data = unwrap(res);
    return Array.isArray(data?.content) ? data.content : (Array.isArray(data) ? data : []);
};

const base = ENDPOINTS.PAYMENTS;

// Payment Status Constants
export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    SUCCESS: 'SUCCESS',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
};

const paymentService = {
    // ==================== Create ====================

    /**
     * Create payment for booking
     * @param {Object} data - Payment data
     * @param {number} data.bookingId - Booking ID
     * @param {string} data.paymentMethod - Payment method (momo, vnpay, zalopay, etc.)
     * @returns {Promise} Created payment
     */
    async createPayment(data) {
        const res = await apiClient.post(base, data);
        return unwrap(res);
    },

    // ==================== List & Pagination ====================

    /**
     * Get paginated list of payments
     * @param {Object} params - Query parameters (page, size, sort, etc.)
     * @returns {Promise} Full page object with pagination info
     */
    async listPage(params = { page: 0, size: 10, sort: 'createdAt,desc' }) {
        const res = await apiClient.get(base, { params });
        return unwrap(res);
    },

    /**
     * Get all payments without pagination
     * @returns {Promise<Array>} Array of all payments
     */
    async getAllNoPagination() {
        const res = await apiClient.get(`${base}/all-no-page`);
        return unwrapArray(res);
    },

    /**
     * Get payments as array (no pagination info)
     * @param {Object} params - Query parameters
     * @returns {Promise<Array>} Array of payment items
     */
    async list(params) {
        const res = await apiClient.get(base, { params });
        return unwrapArray(res);
    },

    // ==================== Single Payment ====================

    /**
     * Get payment by ID
     * @param {string|number} paymentId - Payment ID
     * @returns {Promise} Payment details
     */
    async getPaymentById(paymentId) {
        const res = await apiClient.get(`${base}/${paymentId}`);
        return unwrap(res);
    },

    // ==================== Get By Filters ====================

    /**
     * Get payments by booking ID
     * @param {string|number} bookingId - Booking ID
     * @returns {Promise<Array>} Array of payments for the booking
     */
    async getPaymentsByBookingId(bookingId) {
        const res = await apiClient.get(`${base}/booking/${bookingId}`);
        return unwrapArray(res);
    },

    /**
     * Get payment by transaction ID
     * @param {string} transactionId - Transaction ID from payment gateway
     * @returns {Promise} Payment details
     */
    async getPaymentByTransactionId(transactionId) {
        const res = await apiClient.get(`${base}/transaction/${transactionId}`);
        return unwrap(res);
    },

    /**
     * Get payments by status
     * @param {string} status - Payment status (PENDING, SUCCESS, FAILED, CANCELLED)
     * @param {Object} params - Query parameters (page, size, etc.)
     * @returns {Promise} Paginated payments with specific status
     */
    async getPaymentsByStatus(status, params) {
        const res = await apiClient.get(`${base}/status/${status}`, { params });
        return unwrap(res);
    },

    /**
     * Get pending payments
     * @param {Object} params - Query parameters
     * @returns {Promise} Paginated pending payments
     */
    async getPendingPayments(params) {
        return this.getPaymentsByStatus(PAYMENT_STATUS.PENDING, params);
    },

    /**
     * Get successful payments
     * @param {Object} params - Query parameters
     * @returns {Promise} Paginated successful payments
     */
    async getSuccessfulPayments(params) {
        return this.getPaymentsByStatus(PAYMENT_STATUS.SUCCESS, params);
    },

    /**
     * Get failed payments
     * @param {Object} params - Query parameters
     * @returns {Promise} Paginated failed payments
     */
    async getFailedPayments(params) {
        return this.getPaymentsByStatus(PAYMENT_STATUS.FAILED, params);
    },

    /**
     * Get cancelled payments
     * @param {Object} params - Query parameters
     * @returns {Promise} Paginated cancelled payments
     */
    async getCancelledPayments(params) {
        return this.getPaymentsByStatus(PAYMENT_STATUS.CANCELLED, params);
    },

    // ==================== Update ====================

    /**
     * Update payment status
     * @param {string|number} paymentId - Payment ID
     * @param {string} status - New status (PENDING, SUCCESS, FAILED, CANCELLED)
     * @returns {Promise} Updated payment
     */
    async updatePaymentStatus(paymentId, status) {
        const res = await apiClient.patch(`${base}/${paymentId}/status`, { status });
        return unwrap(res);
    },

    /**
     * Update transaction ID
     * @param {string|number} paymentId - Payment ID
     * @param {string} transactionId - Transaction ID from payment gateway
     * @returns {Promise} Updated payment
     */
    async updateTransactionId(paymentId, transactionId) {
        const res = await apiClient.patch(`${base}/${paymentId}/transaction-id`, { transactionId });
        return unwrap(res);
    },

    // ==================== Delete ====================

    /**
     * Delete payment
     * @param {string|number} paymentId - Payment ID
     * @returns {Promise} Deletion result
     */
    async deletePayment(paymentId) {
        const res = await apiClient.delete(`${base}/${paymentId}`);
        return unwrap(res);
    },

    // ==================== Payment Gateway Callbacks ====================

    /**
     * Handle MoMo callback (Internal API)
     * @param {Object} callbackData - Callback data from MoMo
     * @returns {Promise} Callback processing result
     */
    async handleMoMoCallback(callbackData) {
        const res = await apiClient.post(`${base}/momo-callback`, callbackData);
        return unwrap(res);
    },

    // ==================== Helper Methods ====================

    /**
     * Get status display name in Vietnamese
     * @param {string} status - Status key
     * @returns {string} Display name in Vietnamese
     */
    getStatusDisplayName(status) {
        const statusNames = {
            [PAYMENT_STATUS.PENDING]: 'Đang chờ',
            [PAYMENT_STATUS.SUCCESS]: 'Thành công',
            [PAYMENT_STATUS.FAILED]: 'Thất bại',
            [PAYMENT_STATUS.CANCELLED]: 'Đã hủy',
            'REFUNDED': 'Đã hoàn tiền'
        };
        return statusNames[status] || status;
    },

    /**
     * Get status color for UI display
     * @param {string} status - Status key
     * @returns {string} Color code or name
     */
    getStatusColor(status) {
        const statusColors = {
            [PAYMENT_STATUS.PENDING]: 'orange',
            [PAYMENT_STATUS.SUCCESS]: 'green',
            [PAYMENT_STATUS.FAILED]: 'red',
            [PAYMENT_STATUS.CANCELLED]: 'gray'
        };
        return statusColors[status] || 'default';
    },

    /**
     * Format payment method name
     * @param {string} method - Payment method key
     * @returns {string} Display name in Vietnamese
     */
    getPaymentMethodName(method) {
        const methods = {
            'CASH': 'Tiền mặt',
            'VNPAY': 'VNPay',
            'MOMO': 'Ví MoMo',
            'ZALOPAY': 'ZaloPay',
            'CREDIT_CARD': 'Thẻ tín dụng',
            'DEBIT_CARD': 'Thẻ ghi nợ',
        };
        return methods[method] || methods[method?.toUpperCase()] || method;
    },

    /**
     * Check if payment status is final (cannot be changed)
     * @param {string} status - Payment status
     * @returns {boolean} True if status is final
     */
    isFinalStatus(status) {
        return [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.CANCELLED].includes(status);
    },

    /**
     * Check if payment can be retried
     * @param {string} status - Payment status
     * @returns {boolean} True if payment can be retried
     */
    canRetry(status) {
        return [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.PENDING].includes(status);
    }
};

export default paymentService;
