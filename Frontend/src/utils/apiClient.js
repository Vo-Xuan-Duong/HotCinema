import axios from 'axios';
import { API_BASE_URL, ERROR_MESSAGES } from '@/utils/constants';
import {
  saveAuthData,
  clearAuthData,
  getAccessToken,
  getRefreshToken,
} from '@/utils/authStorage.js';
import { isJwtExpired } from '@/utils/jwt.js';

let authErrorCallback = null;
export const setAuthErrorCallback = (callback) => { authErrorCallback = callback; };
const emitAuthError = (error) => {
  if (typeof authErrorCallback === 'function') authErrorCallback(error);
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

let currentToken = getAccessToken();
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  failedQueue = [];
};

const isAuthEndpoint = (url = '') => [
  '/auth/login',
  '/auth/register',
  '/auth/google',
  '/auth/refresh',
].some((endpoint) => String(url).includes(endpoint));

const setAuthToken = (accessToken, refreshToken, userInfo) => {
  currentToken = accessToken || null;
  if (!accessToken) return;

  saveAuthData({ accessToken, refreshToken, user: userInfo });
  apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
};

const removeAuthToken = () => {
  currentToken = null;
  clearAuthData();
  delete apiClient.defaults.headers.common.Authorization;
};

const isTokenExpired = (token) => isJwtExpired(token, 5 * 60 * 1000);

const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');

  try {
    let response;
    try {
      response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (postError) {
      if (![404, 405].includes(postError?.response?.status)) throw postError;
      response = await axios.get(`${API_BASE_URL}/auth/refresh`, {
        params: { refreshToken },
        timeout: 30000,
      });
    }

    const body = response?.data?.data || response?.data || {};
    const accessToken = body.accessToken || body.token;
    const nextRefreshToken = body.refreshToken || refreshToken;
    if (!accessToken) throw new Error('Refresh response does not contain an access token');

    setAuthToken(accessToken, nextRefreshToken);
    return accessToken;
  } catch (error) {
    removeAuthToken();
    throw error;
  }
};

apiClient.interceptors.request.use(
  async (config) => {
    if (isAuthEndpoint(config.url)) return config;

    let token = currentToken || getAccessToken();
    if (token && isTokenExpired(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          token = await refreshAccessToken();
          processQueue(null, token);
        } catch (error) {
          processQueue(error, null);
          throw error;
        } finally {
          isRefreshing = false;
        }
      } else {
        token = await new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
      }
    }

    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    const isNetworkError = error.code === 'ECONNABORTED' || error.message === 'Network Error';

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest.url)) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          removeAuthToken();
          emitAuthError(refreshError);
          throw refreshError;
        } finally {
          isRefreshing = false;
        }
      }

      const token = await new Promise((resolve, reject) => failedQueue.push({ resolve, reject }));
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return apiClient(originalRequest);
    }

    let message = ERROR_MESSAGES.SERVER_ERROR;
    if (isNetworkError) message = ERROR_MESSAGES.NETWORK_ERROR;
    else if (status === 401) message = error.response?.data?.message || ERROR_MESSAGES.UNAUTHORIZED;
    else if (status === 403) message = error.response?.data?.message || ERROR_MESSAGES.FORBIDDEN;
    else if (status === 404) message = error.response?.data?.message || ERROR_MESSAGES.NOT_FOUND;
    else if (status === 400 || status === 422) {
      message = error.response?.data?.message
        || error.response?.data?.detail
        || ERROR_MESSAGES.VALIDATION_ERROR;
    } else if (error.response?.data?.message || error.response?.data?.detail) {
      message = error.response.data.message || error.response.data.detail;
    }

    const customError = new Error(message);
    customError.name = 'ApiError';
    customError.status = status;
    customError.code = error.response?.data?.code || error.code;
    customError.validationErrors = error.response?.data?.errors || null;
    customError.response = error.response;
    customError.config = originalRequest;
    customError.cause = error;
    throw customError;
  },
);

const api = {
  post: (url, data, config) => apiClient.post(url, data, config),
  get: (url, config) => apiClient.get(url, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),
  setAuthToken,
  removeAuthToken,
  isTokenExpired,
  refreshAccessToken,
};

export {
  apiClient,
  setAuthToken,
  removeAuthToken,
  isTokenExpired,
  refreshAccessToken,
  api,
};
export default api;
