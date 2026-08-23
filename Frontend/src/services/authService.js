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
    return unwrapApiData(await api.get('/auths/verify'));
  },

  async login(data) {
    const result = toAuthResult(await api.post('/auths/login', data));
    if (result.token) {
      api.setAuthToken(result.token, result.refreshToken, result.user);
      result.user = await this.getCurrentUser();
      api.setAuthToken(result.token, result.refreshToken, result.user);
    }
    return result;
  },

  async register(data) {
    return unwrapApiData(await api.post('/auths/register', data));
  },

  async refreshToken(refreshToken) {
    return toAuthResult(await api.post('/auths/refresh', { refreshToken }));
  },

  async logout() {
    try {
      return unwrapApiData(await api.post('/auths/logout'));
    } finally {
      api.removeAuthToken();
    }
  },

  async forgotPassword(email) {
    return unwrapApiData(await api.post('/auths/forgot-password', { email }));
  },

  async verifyPasswordOtp(email, otp) {
    return unwrapApiData(await api.post('/auths/verify-password-otp', { email, otp }));
  },

  async resetPassword(email, otpCode, newPassword) {
    return unwrapApiData(await api.post('/auths/reset-password', {
      email,
      otp: otpCode,
      newPassword,
      confirmPassword: newPassword,
    }));
  },

  async verifyEmail(email, otp) {
    return unwrapApiData(await api.post('/auths/verify-otp', { email, otp }));
  },

  async verifyOTP(email, otpCode) {
    return unwrapApiData(await api.post('/auths/verify-otp', { email, otp: otpCode }));
  },

  async resendOTP(email) {
    return unwrapApiData(await api.post('/auths/resend-otp', { email }));
  },

  async getCurrentUser() {
    return unwrapApiData(await api.get('/auths/me'));
  },

  async updateProfile(userData) {
    const user = unwrapApiData(await api.put('/users/profile', userData));
    return { user };
  },

  async validateToken() {
    return this.verify();
  },

  async loginWithGoogle(code) {
    const result = toAuthResult(await api.post('/auths/google', { code }));
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },

  async handleGoogleCallback(code) {
    const result = toAuthResult(await api.get(`/auths/google/callback?code=${encodeURIComponent(code)}`));
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },
};
