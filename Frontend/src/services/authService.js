import api from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

const toAuthResult = (response) => {
  const auth = unwrapApiData(response) || {};
  return {
    ...auth,
    token: auth.accessToken,
    refreshToken: auth.refreshToken,
    user: auth.userAuth || auth.user,
  };
};

export const authService = {
  async verify() {
    return unwrapApiData(await api.get('/auth/verify'));
  },

  async login(data) {
    const result = toAuthResult(await api.post('/auth/login', data));
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },

  async register(data) {
    return unwrapApiData(await api.post('/auth/register', data));
  },

  async refreshToken(refreshToken) {
    return unwrapApiData(await api.get('/auth/refresh', { params: { refreshToken } }));
  },

  async logout() {
    try {
      return unwrapApiData(await api.get('/auth/logout'));
    } finally {
      api.removeAuthToken();
    }
  },

  async forgotPassword(email) {
    return unwrapApiData(await api.get(`/auth/forget-password?email=${encodeURIComponent(email)}`));
  },

  async verifyPasswordOtp(email, otp) {
    return unwrapApiData(await api.get(`/auth/verify-otp-change-password?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otp)}`));
  },

  async resetPassword(email, otpCode, newPassword) {
    return unwrapApiData(await api.patch('/auth/change-password', { email, otpCode, newPassword }));
  },

  async verifyEmail(token) {
    return unwrapApiData(await api.post('/auth/verify-email', { token }));
  },

  async verifyOTP(email, otpCode) {
    return unwrapApiData(await api.get(`/auth/verify-otp?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otpCode)}`));
  },

  async resendOTP(email) {
    return unwrapApiData(await api.get(`/auth/resend-otp?email=${encodeURIComponent(email)}`));
  },

  async getCurrentUser() {
    return unwrapApiData(await api.get('/auth/current-user'));
  },

  async updateProfile(userData) {
    const user = unwrapApiData(await api.put('/users/profile', userData));
    return { user };
  },

  async validateToken() {
    return unwrapApiData(await api.get('/auth/validate_token'));
  },

  async loginWithGoogle(code) {
    const result = toAuthResult(await api.post('/auth/google', { code }));
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },

  async handleGoogleCallback(code) {
    const result = toAuthResult(await api.get(`/auth/google/callback?code=${encodeURIComponent(code)}`));
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },
};
