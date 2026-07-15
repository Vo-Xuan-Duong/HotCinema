import api from '@/utils/apiClient';

export const authService = {
    // Verify token validity (used on app start)
    verify: async () => {
        return api.get('/auth/verify');
    },

    login: async (data) => {
        const response = await api.post('/auth/login', data);

        console.log('Login response:', response);

        // Let apiClient handle token storage via setAuthToken
        if (response?.data?.accessToken) {
            api.setAuthToken(response.data.accessToken, response.data.refreshToken, response.data.userAuth);
        }
        return response;
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        // Token storage is handled by the component/hook after successful registration
        return response;
    },

    refreshToken: async (refreshToken) => {
        return api.get('/auth/refresh-token', { refreshToken });
    },

    logout: () => {
        api.removeAuthToken();
        return api.post('/auth/logout');
    },

    forgotPassword: async (email) => {
        return api.get(`/auth/forget-password?email=${encodeURIComponent(email)}`);
    },

    verifyPasswordOtp: async (email, otp) => {
        return api.get(`/auth/verify-otp-change-password?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otp)}`);
    },

    resetPassword: async (email, otpCode, newPassword) => {
        return api.patch('/auth/change-password', { email, otpCode, newPassword });
    },

    verifyEmail: async (token) => {
        return api.post('/auth/verify-email', { token });
    },

    verifyOTP: async (email, otpCode) => {
        return api.get(`/auth/verify-otp?email=${encodeURIComponent(email)}&otpCode=${encodeURIComponent(otpCode)}`);
    },

    resendOTP: async (email) => {
        return api.get(`/auth/resend-otp?email=${encodeURIComponent(email)}`);
    },

    getCurrentUser: async () => {
        return api.get('/users/me');
    },

    // Update user profile
    updateProfile: async (userData) => {
        return api.put('/users/profile', userData);
    },

    validateToken: async () => {
        return api.get('/auth/validate_token');
    },

    // Google OAuth login - Send authorization code to backend
    // Backend will exchange code for ID token, validate, and return JWT
    loginWithGoogle: async (code) => {
        console.log('Login with Google authorization code');

        const response = await api.post('/auth/google', { code: code });

        console.log('Login with Google response:', response);

        // Let apiClient handle token storage via setAuthToken
        if (response?.data?.accessToken) {
            api.setAuthToken(response.data.accessToken, response.data.refreshToken, response.data.userAuth);
        }
        return response;
    },

    // Google OAuth callback (for server-side flow - fallback)
    handleGoogleCallback: async (code) => {
        const response = await api.get(`/auth/google/callback?code=${code}`);

        if (response?.data?.accessToken) {
            api.setAuthToken(response.data.accessToken, response.data.refreshToken, response.data.userAuth);
        }
        return response;
    },

};