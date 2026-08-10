import { apiClient } from '@/utils/apiClient';
import { clearAuthData, getAccessToken } from '@/utils/authStorage';
import mockApiAdapter from '@/mocks/mockApiAdapter';
import { getMockDatabase } from '@/mocks/mockDatabase';
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

const authAwareMockAdapter = async (config) => {
  const path = String(config.url || '').split('?')[0].replace(/\/$/, '');
  if (String(config.method || 'get').toLowerCase() === 'post' && path === '/auth/login') {
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
      return {
        data: { message: 'Mật khẩu mock không đúng.' },
        status: 401,
        statusText: 'Unauthorized (Mock)',
        headers: { 'x-hotcinema-mock': 'true' },
        config,
        request: { mock: true },
      };
    }

    return {
      data: {
        accessToken: mockJwt(user),
        refreshToken: 'mock-refresh-token',
        userAuth: user,
      },
      status: 200,
      statusText: 'OK (Mock)',
      headers: { 'x-hotcinema-mock': 'true' },
      config,
      request: { mock: true },
    };
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
