import { apiClient } from '@/utils/apiClient';
import { clearAuthData, getAccessToken } from '@/utils/authStorage';
import mockApiAdapter from '@/mocks/mockApiAdapter';
import { getMockDatabase, persistMockDatabase } from '@/mocks/mockDatabase';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';

const parseBody = (config) => {
  if (config.data == null || config.data === '') return {};
  if (typeof config.data === 'object') return config.data;
  try {
    return JSON.parse(config.data);
  } catch {
    return {};
  }
};

const mockJwt = (user) => {
  const payload = {
    sub: String(user.id),
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60),
  };
  return `mock.${window.btoa(JSON.stringify(payload))}.signature`;
};

const mockResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK (Mock)',
  headers: { 'x-hotcinema-mock': 'true' },
  config,
  request: { mock: true },
});

const currentStoredUser = (db) => {
  try {
    const stored = JSON.parse(window.localStorage.getItem('user_info') || 'null');
    if (stored?.id) return db.users.find((item) => String(item.id) === String(stored.id)) || stored;
  } catch {
    // Ignore malformed local development data.
  }
  return db.users.find((item) => item.email === 'customer@hotcinema.vn') || db.users[0];
};

const authAwareMockAdapter = async (config) => {
  const method = String(config.method || 'get').toLowerCase();
  const path = String(config.url || '').split('?')[0].replace(/\/$/, '');

  if (method === 'post' && path === '/auth/login') {
    const body = parseBody(config);
    const email = String(body.email || '').trim().toLowerCase();
    const passwords = {
      'admin@hotcinema.vn': 'admin123',
      'customer@hotcinema.vn': 'customer123',
      'staff@hotcinema.vn': 'staff123',
    };
    const db = getMockDatabase();
    const user = db.users.find((item) => String(item.email || '').toLowerCase() === email)
      || db.users.find((item) => item.email === 'customer@hotcinema.vn');

    if (passwords[email] && body.password && body.password !== passwords[email]) {
      const error = new Error('Mật khẩu mock không đúng.');
      error.config = config;
      error.response = {
        status: 401,
        data: { message: 'Mật khẩu mock không đúng.' },
        headers: { 'x-hotcinema-mock': 'true' },
        config,
      };
      throw error;
    }

    return mockResponse(config, {
      accessToken: mockJwt(user),
      refreshToken: 'mock-refresh-token',
      userAuth: user,
    });
  }

  // notificationService uses POST for read state changes. Keep those mutations
  // persistent so Header and Notifications page remain in sync after reload.
  if (method === 'post' && (path === '/notifications/read-all' || /^\/notifications\/\d+\/read$/.test(path))) {
    const db = getMockDatabase();
    const user = currentStoredUser(db);
    const canSeeAll = String(user?.role || '').toUpperCase() === 'ADMIN';

    if (path === '/notifications/read-all') {
      db.notifications
        .filter((item) => canSeeAll || String(item.userId) === String(user?.id))
        .forEach((item) => {
          item.read = true;
          item.isRead = true;
        });
      persistMockDatabase();
      return mockResponse(config, { success: true });
    }

    const id = Number(path.split('/')[2]);
    const notification = db.notifications.find((item) => item.id === id);
    if (notification) {
      notification.read = true;
      notification.isRead = true;
      persistMockDatabase();
    }
    return mockResponse(config, notification || { success: true });
  }

  return mockApiAdapter(config);
};

if (MOCK_API_ENABLED) {
  apiClient.defaults.adapter = authAwareMockAdapter;

  // A real/expired backend token would make apiClient try the real refresh endpoint
  // before the mock adapter runs. Clear it when switching into mock mode.
  const existingToken = getAccessToken();
  if (existingToken && !String(existingToken).startsWith('mock.')) {
    clearAuthData();
  }

  console.info('[HotCinema] Mock API enabled. No backend connection is required.');
}

export { MOCK_API_ENABLED };
