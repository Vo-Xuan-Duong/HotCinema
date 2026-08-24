import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';

const base = ENDPOINTS.PAYMENTS;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
};

const paymentService = {
  async createPayment(data) {
    return unwrapApiData(await apiClient.post(base, data));
  },

  async listPage(params = { page: 0, size: 10, sort: 'createdAt,desc' }) {
    return unwrapApiData(await apiClient.get(`${base}/page`, { params }));
  },

  async getAllNoPagination() {
    return unwrapApiArray(await apiClient.get(`${base}/all-no-page`));
  },

  async list(params) {
    return unwrapApiArray(await apiClient.get(base, { params }));
  },

  async getPaymentById(paymentId) {
    return unwrapApiData(await apiClient.get(`${base}/${paymentId}`));
  },

  async getPaymentsByBookingId(bookingId) {
    return unwrapApiArray(await apiClient.get(`${base}/booking/${bookingId}`));
  },

  async getPaymentByTransactionId(transactionId) {
    return unwrapApiData(await apiClient.get(`${base}/transaction/${transactionId}`));
  },

  async getPaymentsByStatus(status, params) {
    return unwrapApiData(await apiClient.get(`${base}/status/${status}`, { params }));
  },

  async getPendingPayments(params) {
    return this.getPaymentsByStatus(PAYMENT_STATUS.PENDING, params);
  },

  async getSuccessfulPayments(params) {
    return this.getPaymentsByStatus(PAYMENT_STATUS.SUCCESS, params);
  },

  async getFailedPayments(params) {
    return this.getPaymentsByStatus(PAYMENT_STATUS.FAILED, params);
  },

  async getCancelledPayments(params) {
    return this.getPaymentsByStatus(PAYMENT_STATUS.CANCELLED, params);
  },

  async updatePaymentStatus(paymentId, status) {
    return unwrapApiData(await apiClient.patch(`${base}/${paymentId}/status`, { status }));
  },

  async updateTransactionId(paymentId, transactionId) {
    return unwrapApiData(await apiClient.patch(`${base}/${paymentId}/transaction-id`, { transactionId }));
  },

  async deletePayment(paymentId) {
    return unwrapApiData(await apiClient.delete(`${base}/${paymentId}`));
  },

  async handleMoMoCallback(callbackData) {
    return unwrapApiData(await apiClient.post(`${base}/momo-callback`, callbackData));
  },

  getStatusDisplayName(status) {
    const statusNames = {
      [PAYMENT_STATUS.PENDING]: 'Đang chờ',
      [PAYMENT_STATUS.SUCCESS]: 'Thành công',
      [PAYMENT_STATUS.FAILED]: 'Thất bại',
      [PAYMENT_STATUS.CANCELLED]: 'Đã hủy',
      REFUNDED: 'Đã hoàn tiền',
    };
    return statusNames[status] || status;
  },

  getStatusColor(status) {
    const statusColors = {
      [PAYMENT_STATUS.PENDING]: 'orange',
      [PAYMENT_STATUS.SUCCESS]: 'green',
      [PAYMENT_STATUS.FAILED]: 'red',
      [PAYMENT_STATUS.CANCELLED]: 'gray',
    };
    return statusColors[status] || 'default';
  },

  getPaymentMethodName(method) {
    const methods = {
      CASH: 'Tiền mặt',
      VNPAY: 'VNPay',
      MOMO: 'Ví MoMo',
      ZALOPAY: 'ZaloPay',
      CREDIT_CARD: 'Thẻ tín dụng',
      DEBIT_CARD: 'Thẻ ghi nợ',
    };
    return methods[method] || methods[method?.toUpperCase()] || method;
  },

  isFinalStatus(status) {
    return [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.CANCELLED].includes(status);
  },

  canRetry(status) {
    return [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.PENDING].includes(status);
  },
};

export default paymentService;
