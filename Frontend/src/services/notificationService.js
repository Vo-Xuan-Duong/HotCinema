import { apiClient } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { getUserInfo } from '@/utils/authStorage';
import { createCapabilityError, isEndpointUnavailable } from '@/utils/backendCapability';
import { ENDPOINTS } from '@/utils/constants';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { normalizeResourceId, sameResourceId } from '@/utils/resourceId';

const pageRows = (response) => {
  const data = unwrapApiData(response);
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const normalizeNotification = (notification = {}) => ({
  ...notification,
  read: Boolean(notification.read ?? notification.isRead),
  isRead: Boolean(notification.isRead ?? notification.read),
});

const normalizeNotificationPage = (data) => {
  if (Array.isArray(data)) return data.map(normalizeNotification);
  if (Array.isArray(data?.content)) {
    return { ...data, content: data.content.map(normalizeNotification) };
  }
  return data;
};

const toUpdatePayload = (notification, changes = {}) => {
  const isRead = Boolean(changes.isRead ?? changes.read ?? notification.isRead ?? notification.read);
  return {
    userId: normalizeResourceId(changes.userId ?? notification.userId),
    type: String(changes.type ?? notification.type ?? 'SYSTEM').toUpperCase(),
    title: String(changes.title ?? notification.title ?? '').trim(),
    content: String(changes.content ?? notification.content ?? '').trim(),
    isRead,
    // Current backend DTO marks readAt as @NotNull even when unread. Preserve an
    // existing timestamp where possible; marking as read always uses now.
    readAt: changes.readAt ?? notification.readAt ?? notification.createdAt ?? new Date().toISOString(),
  };
};

const emptyPage = (params = {}) => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  page: 0,
  size: Number(params.size || 100),
});

const notificationService = {
  // Admin collection. Customer surfaces must use listMine instead.
  async list(params = {}) {
    return normalizeNotificationPage(unwrapApiData(
      await apiClient.get(ENDPOINTS.NOTIFICATIONS, { params }),
    ));
  },

  async listMine(params = {}) {
    const user = getUserInfo();
    if (!user?.id) return emptyPage(params);

    if (MOCK_API_ENABLED) {
      const response = await this.list({ page: 0, size: 1000 });
      const rows = pageRows(response)
        .filter((item) => sameResourceId(item.userId, user.id))
        .sort((left, right) => String(right.createdAt || '').localeCompare(String(left.createdAt || '')));
      const page = Math.max(0, Number(params.page || 0));
      const size = Math.max(1, Number(params.size || 100));
      const start = page * size;
      return {
        content: rows.slice(start, start + size),
        totalElements: rows.length,
        totalPages: rows.length ? Math.ceil(rows.length / size) : 0,
        number: page,
        page,
        size,
      };
    }

    try {
      return normalizeNotificationPage(unwrapApiData(
        await apiClient.get(`${ENDPOINTS.NOTIFICATIONS}/me`, { params }),
      ));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      // Do not GET the admin notification collection and filter it in the
      // browser. Notification ownership must be enforced by the backend.
      throw createCapabilityError('danh sách thông báo cá nhân có kiểm soát ownership', error);
    }
  },

  // Admin lookup. Do not use this from customer pages because the current
  // backend has no resource-level authorization guarantee for generic CRUD.
  async getById(id) {
    return normalizeNotification(unwrapApiData(
      await apiClient.get(`${ENDPOINTS.NOTIFICATIONS}/${normalizeResourceId(id)}`),
    ));
  },

  // Admin mutation. Customer surfaces must use markMineAsRead.
  async markAsRead(id) {
    const notificationId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) {
      return normalizeNotification(unwrapApiData(
        await apiClient.put(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`),
      ));
    }

    try {
      return normalizeNotification(unwrapApiData(
        await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/${notificationId}/read`),
      ));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      const current = await this.getById(notificationId);
      const updated = unwrapApiData(await apiClient.put(
        `${ENDPOINTS.NOTIFICATIONS}/${notificationId}`,
        toUpdatePayload(current, { isRead: true, readAt: new Date().toISOString() }),
      ));
      return normalizeNotification(updated);
    }
  },

  async markMineAsRead(id) {
    const notificationId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) return this.markAsRead(notificationId);

    try {
      return normalizeNotification(unwrapApiData(
        await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/me/${notificationId}/read`),
      ));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      // Do not emulate this with GET /notifications/{id} + PUT. That would let
      // the browser choose another user's notification identifier.
      throw createCapabilityError('đánh dấu thông báo cá nhân đã đọc có kiểm soát ownership', error);
    }
  },

  // Admin/global command. Customer surfaces must use markAllMineAsRead.
  async markAllAsRead() {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.put(`${ENDPOINTS.NOTIFICATIONS}/read-all`));
    }

    try {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/read-all`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      throw createCapabilityError('đánh dấu tất cả thông báo đã đọc', error);
    }
  },

  async markAllMineAsRead() {
    if (MOCK_API_ENABLED) {
      const mine = pageRows(await this.listMine({ page: 0, size: 1000 })).filter((item) => !item.isRead);
      for (let index = 0; index < mine.length; index += 8) {
        const batch = mine.slice(index, index + 8);
        await Promise.all(batch.map((item) => this.markMineAsRead(item.id)));
      }
      return { updated: mine.length };
    }

    try {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/me/read-all`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      throw createCapabilityError('đánh dấu tất cả thông báo cá nhân đã đọc', error);
    }
  },

  // Admin delete. Customer surfaces must use deleteMine.
  async delete(id) {
    return apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/${normalizeResourceId(id)}`);
  },

  async deleteMine(id) {
    const notificationId = normalizeResourceId(id);
    if (MOCK_API_ENABLED) return this.delete(notificationId);

    try {
      return apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/me/${notificationId}`);
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      throw createCapabilityError('xóa thông báo cá nhân có kiểm soát ownership', error);
    }
  },

  async create(payload) {
    if (MOCK_API_ENABLED) {
      throw createCapabilityError('gửi notification trực tiếp cho một user trong mock mode; mock hiện chỉ hỗ trợ broadcast');
    }
    const isRead = Boolean(payload?.isRead ?? payload?.read);
    return normalizeNotification(unwrapApiData(await apiClient.post(ENDPOINTS.NOTIFICATIONS, {
      userId: normalizeResourceId(payload?.userId),
      type: String(payload?.type || 'SYSTEM').toUpperCase(),
      title: String(payload?.title || '').trim(),
      content: String(payload?.content || payload?.message || '').trim(),
      isRead,
      readAt: payload?.readAt || new Date().toISOString(),
    })));
  },

  async broadcast(payload) {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/broadcast`, payload));
    }

    try {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/broadcast`, payload));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      throw createCapabilityError('gửi thông báo broadcast', error);
    }
  },
};

export { normalizeNotification, toUpdatePayload as toNotificationUpdatePayload };
export default notificationService;
