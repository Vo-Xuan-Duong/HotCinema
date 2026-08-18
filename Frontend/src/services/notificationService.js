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

const notificationService = {
  async list(params = {}) {
    const data = unwrapApiData(await apiClient.get(ENDPOINTS.NOTIFICATIONS, { params }));
    if (Array.isArray(data)) return data.map(normalizeNotification);
    if (Array.isArray(data?.content)) {
      return { ...data, content: data.content.map(normalizeNotification) };
    }
    return data;
  },

  async getById(id) {
    return normalizeNotification(unwrapApiData(
      await apiClient.get(`${ENDPOINTS.NOTIFICATIONS}/${normalizeResourceId(id)}`),
    ));
  },

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

  async markAllAsRead() {
    if (MOCK_API_ENABLED) {
      return unwrapApiData(await apiClient.put(`${ENDPOINTS.NOTIFICATIONS}/read-all`));
    }

    try {
      return unwrapApiData(await apiClient.post(`${ENDPOINTS.NOTIFICATIONS}/read-all`));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;

      const user = getUserInfo();
      const rows = pageRows(await apiClient.get(ENDPOINTS.NOTIFICATIONS, {
        params: { page: 0, size: 1000 },
      }))
        .map(normalizeNotification)
        .filter((item) => !item.isRead)
        .filter((item) => !user?.id || sameResourceId(item.userId, user.id));

      const changed = [];
      for (let index = 0; index < rows.length; index += 8) {
        const batch = rows.slice(index, index + 8);
        changed.push(...await Promise.all(batch.map(async (item) => normalizeNotification(unwrapApiData(
          await apiClient.put(
            `${ENDPOINTS.NOTIFICATIONS}/${normalizeResourceId(item.id)}`,
            toUpdatePayload(item, { isRead: true, readAt: new Date().toISOString() }),
          ),
        )))));
      }
      return { updated: changed.length, notifications: changed };
    }
  },

  async delete(id) {
    return apiClient.delete(`${ENDPOINTS.NOTIFICATIONS}/${normalizeResourceId(id)}`);
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
