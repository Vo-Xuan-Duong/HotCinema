import axios from 'axios';
import { ERROR_MESSAGES } from '@/utils/constants';
import {
  saveAuthData,
  clearAuthData,
  getAccessToken,
  getRefreshToken
} from '@/utils/authStorage.js';

// Event emitter for 401 errors - để trigger auth modal
let authErrorCallback = null;

export const setAuthErrorCallback = (callback) => {
  authErrorCallback = callback;
};

const emitAuthError = (error) => {
  if (authErrorCallback && typeof authErrorCallback === 'function') {
    authErrorCallback(error);
  }
};

// API base URL is configurable per deployment environment.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let currentToken = null;
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Set authentication token in memory and localStorage
 * This is the CENTRALIZED place where tokens are saved
 */
const setAuthToken = (access_token, refresh_token, userInfo) => {
  currentToken = access_token;

  if (access_token) {
    // Save to localStorage using centralized utility
    saveAuthData({
      accessToken: access_token,
      refreshToken: refresh_token,
      user: userInfo
    });

    // Set Authorization header
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  }
};

/**
 * Remove authentication token from memory and localStorage
 * This is the CENTRALIZED place where tokens are cleared
 */
const removeAuthToken = () => {
  currentToken = null;

  // Clear from localStorage using centralized utility
  clearAuthData();

  // Remove Authorization header
  delete apiClient.defaults.headers.common['Authorization'];
};

// Kiểm tra token có hết hạn không
const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    // Token sắp hết hạn trong vòng 5 phút
    return expiryTime - currentTime < 5 * 60 * 1000;
  } catch (error) {
    console.error('Error parsing token:', error);
    return true;
  }
};

// Refresh token
const refreshAccessToken = async () => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    // Gọi API refresh token (điều chỉnh endpoint theo backend)
    const response = await axios.post(`${API_BASE_URL}/auths/refresh`, { refreshToken });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data || response.data;

    // Lưu token mới - ONLY place where tokens are saved after refresh
    setAuthToken(accessToken, newRefreshToken || refreshToken);

    return accessToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    removeAuthToken();
    // Không redirect, chỉ throw error để component xử lý
    throw error;
  }
};

// Request interceptor to add token and check expiry
apiClient.interceptors.request.use(
  async (config) => {
    // Bỏ qua kiểm tra token cho các endpoint auth
    if (config.url?.includes('/auths/login') ||
      config.url?.includes('/auths/register') ||
      config.url?.includes('/auths/google') ||
      config.url?.includes('/auths/refresh')) {
      return config;
    }

    let token = currentToken || getAccessToken();

    // Kiểm tra token có tồn tại và còn hạn không
    if (token && isTokenExpired(token)) {
      console.log('Token expired or expiring soon, refreshing...');

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          token = await refreshAccessToken();
          isRefreshing = false;
          processQueue(null, token);
        } catch (error) {
          isRefreshing = false;
          processQueue(error, null);
          return Promise.reject(error);
        }
      } else {
        // Đợi refresh token hoàn thành
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          config.headers['Authorization'] = `Bearer ${token}`;
          return config;
        }).catch(err => {
          return Promise.reject(err);
        });
      }
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    let message = ERROR_MESSAGES.SERVER_ERROR;
    const isNetworkError = error.code === 'ECONNABORTED' || error.message === 'Network Error';

    // Xử lý lỗi kết nối
    if (isNetworkError) {
      message = ERROR_MESSAGES.NETWORK_ERROR || 'Không thể kết nối máy chủ. Vui lòng thử lại.';
    }
    // Xử lý 401 Unauthorized - Token hết hạn
    else if (status === 401 && !originalRequest._retry) {
      // Nếu đang ở trang login, register, google auth hoặc refresh token thì không retry
      if (originalRequest.url?.includes('/auths/login') ||
        originalRequest.url?.includes('/auths/register') ||
        originalRequest.url?.includes('/auths/google') ||
        originalRequest.url?.includes('/auths/refresh')) {
        message = error.response?.data?.message || ERROR_MESSAGES.UNAUTHORIZED || 'Xác thực thất bại.';
        // Không remove token cho auth endpoints vì user đang cố đăng nhập
      } else {
        // Đánh dấu request đã retry để tránh loop
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            const newToken = await refreshAccessToken();
            isRefreshing = false;
            processQueue(null, newToken);

            // Retry request với token mới
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            processQueue(refreshError, null);
            removeAuthToken();
            // Emit auth error để tự động mở modal
            emitAuthError(refreshError);
            console.warn('Token refresh failed. Please re-authenticate.');
            return Promise.reject(refreshError);
          }
        } else {
          // Đợi refresh token hoàn thành
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }
      }
    }
    else if (status === 403) {
      message = ERROR_MESSAGES.FORBIDDEN || 'Bạn không có quyền truy cập.';
    } else if (status === 404) {
      message = ERROR_MESSAGES.NOT_FOUND || 'Không tìm thấy thông tin.';
    } else if (status === 422) {
      message = error.response?.data?.message || ERROR_MESSAGES.VALIDATION_ERROR || 'Dữ liệu không hợp lệ.';
    } else if (status === 400) {
      message = error.response?.data?.message || 'Yêu cầu không hợp lệ.';
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    }

    const customError = new Error(message);
    customError.status = status;
    customError.response = error.response;
    throw customError;
  }
);

// Enhanced API methods
const api = {
  // Auth endpoints
  post: (url, data) => apiClient.post(url, data),
  get: (url, params) => apiClient.get(url, params),
  put: (url, data) => apiClient.put(url, data),
  patch: (url, data) => apiClient.patch(url, data),
  delete: (url) => apiClient.delete(url),

  // Token management
  setAuthToken,
  removeAuthToken,
  isTokenExpired,
  refreshAccessToken
};

export {
  apiClient,
  setAuthToken,
  removeAuthToken,
  isTokenExpired,
  refreshAccessToken,
  api
};
export default api; 
