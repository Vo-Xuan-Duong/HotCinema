import { apiClient } from '@/utils/apiClient';
import { clearAuthData, getAccessToken } from '@/utils/authStorage';
import mockApiAdapter from '@/mocks/mockApiAdapter';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';

if (MOCK_API_ENABLED) {
  apiClient.defaults.adapter = mockApiAdapter;

  // A real/expired backend token would make apiClient try the real refresh endpoint
  // before the mock adapter runs. Clear it when switching into mock mode.
  const existingToken = getAccessToken();
  if (existingToken && !String(existingToken).startsWith('mock.')) {
    clearAuthData();
  }

  console.info('[HotCinema] Mock API enabled. No backend connection is required.');
}

export { MOCK_API_ENABLED };
