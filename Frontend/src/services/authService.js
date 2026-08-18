import api from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';
import { getAccessToken } from '@/utils/authStorage';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import { isEndpointUnavailable, rethrowCapabilityError } from '@/utils/backendCapability';
import { isJwtExpired, userFromAccessToken } from '@/utils/jwt';
import { buildUserUpdatePayload } from '@/services/userService';

const normalizeUserProfile = (profile, token = getAccessToken()) => {
  if (!profile && !token) return null;
  const identity = userFromAccessToken(token) || {};
  const source = profile || {};
  const roles = Array.isArray(source.roles) && source.roles.length > 0
    ? source.roles
    : (identity.roles || []);
  const role = source.role || identity.role || roles[0] || null;
  const phone = source.phone ?? source.phoneNumber ?? identity.phone ?? '';
  const dateOfBirth = source.dateOfBirth ?? source.birthDate ?? null;
  const avatarUrl = source.avatarUrl ?? source.avatar ?? '';

  return {
    ...identity,
    ...source,
    id: source.id || identity.id || null,
    email: source.email || identity.email || null,
    roles,
    role,
    phone,
    phoneNumber: phone,
    dateOfBirth,
    birthDate: dateOfBirth,
    avatarUrl,
    avatar: avatarUrl,
  };
};

const toAuthResult = (response) => {
  const auth = unwrapApiData(response) || {};
  const token = auth.accessToken || auth.token || null;
  const user = normalizeUserProfile(auth.userAuth || auth.user, token);
  return {
    ...auth,
    accessToken: token,
    token,
    refreshToken: auth.refreshToken || null,
    user,
  };
};

const verifyLocally = () => {
  const token = getAccessToken();
  if (!token || isJwtExpired(token)) throw new Error('Phiên đăng nhập đã hết hạn.');
  return { valid: true, localOnly: true, user: normalizeUserProfile(null, token) };
};

const getTokenUser = () => normalizeUserProfile(null, getAccessToken());

const getUserResourceFromToken = async () => {
  const tokenUser = getTokenUser();
  if (!tokenUser?.id) return null;
  const profile = unwrapApiData(await api.get(`/users/${tokenUser.id}`));
  return normalizeUserProfile(profile, getAccessToken());
};

export const authService = {
  async verify() {
    try {
      const verification = unwrapApiData(await api.get('/auth/verify'));
      if (verification?.user) return { ...verification, user: normalizeUserProfile(verification.user) };
      return verification;
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      try {
        const currentUser = unwrapApiData(await api.get('/auth/current-user'));
        return { valid: true, fallback: 'auth-current-user', user: normalizeUserProfile(currentUser) };
      } catch (currentUserError) {
        if (!isEndpointUnavailable(currentUserError)) throw currentUserError;
        const user = await getUserResourceFromToken();
        if (user) return { valid: true, fallback: 'users-resource', user };
        return verifyLocally();
      }
    }
  },

  async login(data) {
    const result = toAuthResult(await api.post('/auth/login', data));
    if (!result.token) throw new Error('Máy chủ không trả về access token.');
    if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
    return result;
  },

  async register(data) {
    return unwrapApiData(await api.post('/auth/register', data));
  },

  async refreshToken(refreshToken) {
    if (MOCK_API_ENABLED) {
      return toAuthResult(await api.get('/auth/refresh', { params: { refreshToken } }));
    }

    try {
      return toAuthResult(await api.post('/auth/refresh', { refreshToken }));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return toAuthResult(await api.get('/auth/refresh', { params: { refreshToken } }));
    }
  },

  async logout() {
    try {
      if (MOCK_API_ENABLED) return unwrapApiData(await api.get('/auth/logout'));
      try {
        return unwrapApiData(await api.post('/auth/logout'));
      } catch (error) {
        if (!isEndpointUnavailable(error)) throw error;
        return unwrapApiData(await api.get('/auth/logout'));
      }
    } finally {
      api.removeAuthToken();
    }
  },

  async forgotPassword(email) {
    try {
      return unwrapApiData(await api.post('/auth/forgot-password', { email }));
    } catch (error) {
      if (MOCK_API_ENABLED && isEndpointUnavailable(error)) {
        return unwrapApiData(await api.get(`/auth/forget-password?email=${encodeURIComponent(email)}`));
      }
      rethrowCapabilityError('quên mật khẩu', error);
    }
  },

  async verifyPasswordOtp(email, otp) {
    try {
      return unwrapApiData(await api.post('/auth/password/verify-otp', { email, otpCode: otp }));
    } catch (error) {
      if (MOCK_API_ENABLED && isEndpointUnavailable(error)) {
        return unwrapApiData(await api.get(`/auth/verify-otp-change-password?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otp)}`));
      }
      rethrowCapabilityError('xác minh OTP đổi mật khẩu', error);
    }
  },

  async resetPassword(email, otpCode, newPassword) {
    try {
      return unwrapApiData(await api.patch('/auth/change-password', { email, otpCode, newPassword }));
    } catch (error) {
      rethrowCapabilityError('đổi mật khẩu', error);
    }
  },

  async verifyEmail(token) {
    try {
      return unwrapApiData(await api.post('/auth/verify-email', { token }));
    } catch (error) {
      rethrowCapabilityError('xác minh email', error);
    }
  },

  async verifyOTP(email, otpCode) {
    try {
      return unwrapApiData(await api.post('/auth/verify-otp', { email, otpCode }));
    } catch (error) {
      if (MOCK_API_ENABLED && isEndpointUnavailable(error)) {
        return unwrapApiData(await api.get(`/auth/verify-otp?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otpCode)}`));
      }
      rethrowCapabilityError('xác minh OTP', error);
    }
  },

  async resendOTP(email) {
    try {
      return unwrapApiData(await api.post('/auth/resend-otp', { email }));
    } catch (error) {
      if (MOCK_API_ENABLED && isEndpointUnavailable(error)) {
        return unwrapApiData(await api.get(`/auth/resend-otp?email=${encodeURIComponent(email)}`));
      }
      rethrowCapabilityError('gửi lại OTP', error);
    }
  },

  async getCurrentUser() {
    try {
      return normalizeUserProfile(unwrapApiData(await api.get('/auth/current-user')));
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;
      return (await getUserResourceFromToken()) || getTokenUser();
    }
  },

  async updateProfile(userData) {
    try {
      const user = normalizeUserProfile(unwrapApiData(await api.put('/users/profile', userData)));
      return { user };
    } catch (error) {
      if (!isEndpointUnavailable(error)) throw error;

      const current = await getUserResourceFromToken();
      if (!current?.id) throw new Error('Không xác định được người dùng hiện tại để cập nhật hồ sơ.');
      const payload = buildUserUpdatePayload(current, userData);
      const user = normalizeUserProfile(unwrapApiData(await api.put(`/users/${current.id}`, payload)));
      return { user };
    }
  },

  async validateToken() {
    return this.verify();
  },

  async loginWithGoogle(code) {
    try {
      const result = toAuthResult(await api.post('/auth/google', { code }));
      if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
      return result;
    } catch (error) {
      rethrowCapabilityError('đăng nhập Google', error);
    }
  },

  async handleGoogleCallback(code) {
    try {
      const result = toAuthResult(await api.get(`/auth/google/callback?code=${encodeURIComponent(code)}`));
      if (result.token) api.setAuthToken(result.token, result.refreshToken, result.user);
      return result;
    } catch (error) {
      rethrowCapabilityError('callback Google', error);
    }
  },
};

export { normalizeUserProfile, toAuthResult };
