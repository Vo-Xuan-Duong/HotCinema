import { apiClient } from '@/utils/apiClient';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';
import { ENDPOINTS } from '@/utils/constants';
import { isEndpointUnavailable, rethrowCapabilityError } from '@/utils/backendCapability';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const base = ENDPOINTS.PAYMENTS;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
  REFUNDED: 'REFUNDED',
};

const normalizeStatus = (value) => String(value || '').trim().toUpperCase();
const normalizePayment = (payment = {}) => ({
  ...payment,
  paymentStatus: normalizeStatus(payment.paymentStatus || payment.status),
  status: normalizeStatus(payment.status || payment.paymentStatus),
  transactionId: payment.transactionId || payment.providerTransactionId,
  providerTransactionId: payment.providerTransactionId || payment.transactionId,
  paymentDate: payment.paymentDate || payment.paidAt || payment.updatedAt || payment.createdAt,
});

const contentOf = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return unwrapApiArray(response);
};

const providerForMethod = (method) => {
  const value = String(method || '').trim().toUpperCase();
  if (['MOMO', 'VNPAY', 'ZALOPAY', 'STRIPE', 'CASH'].includes(value)) return value;
  if (['CREDIT_CARD', 'DEBIT_CARD'].includes(value)) return 'STRIPE';
  return value || 'CASH';
};

const paymentService = {
  async createPayment(data = {}) {
    const paymentMethod = String(data.paymentMethod || data.provider || '').trim().toUpperCase();
    const payload = {
      ...data,
      bookingId: normalizeResourceId(data.bookingId),
      paymentMethod,
      provider: data.provider || providerForMethod(paymentMethod),
    };
    return normalizePayment(unwrapApiData(await apiClient.post(base, payload)));
  },

  async listPage(params = { page: 0, size: 10, sort: 'createdAt,desc' }) {
    const data = unwrapApiData(await apiClient.get(base, { params }));
    if (Array.isArray(data)) return data.map(normalizePayment);
    if (data?.content) return { ...data, content: data.content.map(normalizePayment) };
    return data;
  },

  async list(params = {}) {
    const result = await this.listPage({ page: 0, size: 500, ...params });
    return (Array.isArray(result) ? result : result?.content || []).map(normalizePayment);
  },

  async getAllNoPagination() {
    try {
      return contentOf(await apiClient.get(`${base}/all-no-page`)).map(normalizePayment);
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return this.list({ page: 0, size: 500 });
    }
  },

  async getPaymentById(paymentId) {
    return normalizePayment(unwrapApiData(await apiClient.get(`${base}/${normalizeResourceId(paymentId)}`)));
  },

  async getPaymentsByBookingId(bookingId) {
    const id = normalizeResourceId(bookingId);
    try {
      return contentOf(await apiClient.get(`${base}/booking/${id}`)).map(normalizePayment);
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await this.list()).filter((payment) => sameResourceId(payment.bookingId ?? payment.booking?.id, id));
    }
  },

  async getPaymentByTransactionId(transactionId) {
    const id = String(transactionId || '').trim();
    try {
      return normalizePayment(unwrapApiData(await apiClient.get(`${base}/transaction/${encodeURIComponent(id)}`)));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await this.list()).find((payment) => String(payment.providerTransactionId || payment.transactionId || '') === id) || null;
    }
  },

  async getPaymentsByStatus(status, params = {}) {
    const normalized = normalizeStatus(status);
    try {
      const data = unwrapApiData(await apiClient.get(`${base}/status/${normalized}`, { params }));
      if (Array.isArray(data)) return data.map(normalizePayment);
      if (data?.content) return { ...data, content: data.content.map(normalizePayment) };
      return data;
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await this.list(params)).filter((payment) => payment.paymentStatus === normalized);
    }
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
    const id = normalizeResourceId(paymentId);
    const normalizedStatus = normalizeStatus(status);
    try {
      return normalizePayment(unwrapApiData(await apiClient.patch(`${base}/${id}/status`, { status: normalizedStatus })));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getPaymentById(id);
      return normalizePayment(unwrapApiData(await apiClient.put(`${base}/${id}`, { ...current, status: normalizedStatus })));
    }
  },

  async updateTransactionId(paymentId, transactionId) {
    const id = normalizeResourceId(paymentId);
    try {
      return normalizePayment(unwrapApiData(await apiClient.patch(`${base}/${id}/transaction-id`, { transactionId })));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getPaymentById(id);
      return normalizePayment(unwrapApiData(await apiClient.put(`${base}/${id}`, {
        ...current,
        providerTransactionId: transactionId,
      })));
    }
  },

  async deletePayment(paymentId) {
    return apiClient.delete(`${base}/${normalizeResourceId(paymentId)}`);
  },

  async handleMoMoCallback(callbackData) {
    try {
      return unwrapApiData(await apiClient.post(`${base}/momo-callback`, callbackData));
    } catch (error) {
      rethrowCapabilityError('xử lý callback MoMo', error);
    }
  },

  getStatusDisplayName(status) {
    const statusNames = {
      [PAYMENT_STATUS.PENDING]: 'Đang chờ',
      [PAYMENT_STATUS.SUCCESS]: 'Thành công',
      [PAYMENT_STATUS.FAILED]: 'Thất bại',
      [PAYMENT_STATUS.CANCELLED]: 'Đã hủy',
      [PAYMENT_STATUS.REFUNDED]: 'Đã hoàn tiền',
    };
    return statusNames[normalizeStatus(status)] || status;
  },

  getStatusColor(status) {
    const statusColors = {
      [PAYMENT_STATUS.PENDING]: 'orange',
      [PAYMENT_STATUS.SUCCESS]: 'green',
      [PAYMENT_STATUS.FAILED]: 'red',
      [PAYMENT_STATUS.CANCELLED]: 'gray',
      [PAYMENT_STATUS.REFUNDED]: 'blue',
    };
    return statusColors[normalizeStatus(status)] || 'default';
  },

  getPaymentMethodName(method) {
    const value = String(method || '').toUpperCase();
    const methods = {
      CASH: 'Tiền mặt',
      VNPAY: 'VNPay',
      MOMO: 'Ví MoMo',
      ZALOPAY: 'ZaloPay',
      STRIPE: 'Thẻ quốc tế',
      CREDIT_CARD: 'Thẻ tín dụng',
      DEBIT_CARD: 'Thẻ ghi nợ',
    };
    return methods[value] || method;
  },

  isFinalStatus(status) {
    return [PAYMENT_STATUS.SUCCESS, PAYMENT_STATUS.CANCELLED, PAYMENT_STATUS.REFUNDED].includes(normalizeStatus(status));
  },

  canRetry(status) {
    return [PAYMENT_STATUS.FAILED, PAYMENT_STATUS.PENDING].includes(normalizeStatus(status));
  },
};

export { normalizePayment, providerForMethod };
export default paymentService;
