import api from '@/utils/apiClient';

export const authService = {
    // Verify token validity (used on app start)
    verify: async () => {
        return api.get('/auth/verify');
    },

    login: async (data) => {
        const response = await api.post('/auth/login', data);

        const auth = response?.data || response;
        if (auth?.accessToken) {
            api.setAuthToken(auth.accessToken, auth.refreshToken, auth.userAuth);
        }
        return {
            ...response,
            token: auth?.accessToken,
            refreshToken: auth?.refreshToken,
            user: auth?.userAuth,
        };
    },

    register: async (data) => {
        const response = await api.post('/auth/register', data);
        // Token storage is handled by the component/hook after successful registration
        return response;
    },

    refreshToken: async (refreshToken) => {
        return api.get('/auth/refresh', { params: { refreshToken } });
    },

    logout: async () => {
        try {
            return await api.get('/auth/logout');
        } finally {
            api.removeAuthToken();
        }
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
        return api.get('/auth/current-user');
    },

    // Update user profile
    updateProfile: async (userData) => {
        const response = await api.put('/users/profile', userData);
        const user = response?.data || response;
        return { user };
    },

    validateToken: async () => {
        return api.get('/auth/validate_token');
    },

    // Google OAuth login - Send authorization code to backend
    // Backend will exchange code for ID token, validate, and return JWT
    loginWithGoogle: async (code) => {
        const response = await api.post('/auth/google', { code: code });
        const auth = response?.data || response;
        if (auth?.accessToken) {
            api.setAuthToken(auth.accessToken, auth.refreshToken, auth.userAuth);
        }
        return {
            ...response,
            token: auth?.accessToken,
            refreshToken: auth?.refreshToken,
            user: auth?.userAuth,
        };
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
