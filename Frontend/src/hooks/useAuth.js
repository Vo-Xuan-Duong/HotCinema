import { useEffect, useMemo, useSyncExternalStore } from 'react';
import api from '@/utils/apiClient.js';
import { authService } from '@/services/authService.js';
import {
    getUserInfo,
    getAccessToken,
    saveAuthData
} from '@/utils/authStorage.js';

// Simple external store for auth state (no React Context)
const subscribers = new Set();

const notify = () => {
    subscribers.forEach((cb) => {
        try { cb(); } catch (_) { /* noop */ }
    });
};

const getStoredUser = () => {
    return getUserInfo();
};

const getInitialState = () => {
    const token = getAccessToken();
    const user = getStoredUser();
    return {
        user,
        token,
        isAuthenticated: !!(token && user),
        isLoading: !!token,
        error: null,
    };
};

let state = getInitialState();
let initialized = false;

const setState = (partial) => {
    state = { ...state, ...partial };
    notify();
};

const store = {
    subscribe(cb) {
        subscribers.add(cb);
        return () => subscribers.delete(cb);
    },
    getSnapshot() {
        return state;
    },
};

// Actions
const login = async (...args) => {
    setState({ isLoading: true, error: null });
    try {
        let payload;
        if (args.length === 1 && typeof args[0] === 'object') {
            const { email, password, rememberMe } = args[0] || {};
            payload = { email, password, rememberMe };
        } else if (args.length === 2 && typeof args[0] === 'string') {
            payload = { email: args[0], password: args[1] };
        } else {
            throw new Error('Invalid login parameters');
        }

        const res = await authService.login(payload);

        // Extract token and user from response
        const token = res?.data?.accessToken || res?.token;
        const user = res?.user;

        // authService.login already calls api.setAuthToken which saves to localStorage
        // So we DON'T need to save again here, just handle rememberEmail

        // Handle remember email separately (not part of auth data)
        if (payload?.rememberMe && payload?.email) {
            saveAuthData({ rememberEmail: payload.email });
        } else {
            saveAuthData({ rememberEmail: false });
        }

        // Update state immediately after persisting
        setState({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });

        return res;
    } catch (err) {
        console.error('Login error in useAuth:', err);
        console.error('Error response:', err?.response);
        console.error('Error status:', err?.status, err?.response?.status);

        const message = err?.response?.data?.message || err?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        const status = err?.status || err?.response?.status;

        setState({ user: null, token: null, isAuthenticated: false, isLoading: false, error: message });

        // Throw error with complete info
        throw {
            message: message,
            status: status,
            response: err?.response,
            data: err?.response?.data || err?.data
        };
    }
};

const register = async (userData) => {
    setState({ isLoading: true, error: null });
    try {
        const res = await authService.register(userData);

        const token = res?.token;
        const user = res?.user;

        // Save to localStorage and set in API client - ONE PLACE
        if (token) {
            api.setAuthToken(token, null, user);
        }

        // Update state immediately
        setState({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null
        });

        return res;
    } catch (err) {
        setState({ isLoading: false, error: err?.message || 'Đăng ký thất bại.' });
        throw err;
    }
};

const logout = async () => {
    try { await authService.logout(); } catch (_) { /* ignore */ }

    // authService.logout -> api.removeAuthToken() -> clearAuthData()
    // So localStorage is already cleared, just update state

    // Update state immediately
    setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    });
};

const updateProfile = async (userData) => {
    setState({ isLoading: true, error: null });
    try {
        const res = await authService.updateProfile(userData);
        const user = res?.user;

        // Update user info via apiClient (which will save to localStorage)
        if (user && state.token) {
            api.setAuthToken(state.token, null, user);
        }

        // Update state immediately
        setState({
            user: user,
            isAuthenticated: !!state.token,
            isLoading: false,
            error: null
        });

        return res;
    } catch (err) {
        setState({ isLoading: false, error: err?.message || 'Cập nhật thất bại.' });
        throw err;
    }
};

const loginWithGoogle = async (googleToken) => {
    setState({ isLoading: true, error: null });
    try {
        const res = await authService.loginWithGoogle(googleToken);

        const token = res?.data?.accessToken || res?.token;
        const user = res?.user || res?.data?.userAuth;

        // Update state immediately after persisting
        setState({
            user: user,
            token: token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
        });

        return res;
    } catch (err) {
        console.error('Google login error in useAuth:', err);
        const message = err?.response?.data?.message || err?.message || 'Đăng nhập bằng Google thất bại.';
        const status = err?.status || err?.response?.status;

        setState({ user: null, token: null, isAuthenticated: false, isLoading: false, error: message });

        throw {
            message: message,
            status: status,
            response: err?.response,
            data: err?.response?.data || err?.data
        };
    }
};

const clearError = () => setState({ error: null });

const setMockUser = (mockUser, token = 'mock-jwt-token-' + Date.now()) => {
    // Save to localStorage via api.setAuthToken - ONE PLACE
    api.setAuthToken(token, null, mockUser);

    // Update state immediately
    setState({
        user: mockUser,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null
    });
};

// Hook
export const useAuth = () => {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    // One-time init/verification on first consumer mount
    useEffect(() => {
        if (initialized) return;
        initialized = true;

        const token = getAccessToken();
        const user = getStoredUser();

        if (token && user) {
            // Set token in API client immediately
            api.setAuthToken(token);

            // Update state with user info immediately (optimistic)
            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: true, // Still verifying in background
                error: null
            });

            // Verify token with backend in background
            authService
                .verify()
                .then(() => {
                    // Token is valid, just mark as not loading
                    setState({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                })
                .catch(() => {
                    // Invalid token -> clear everything via api.removeAuthToken
                    api.removeAuthToken();
                    setState({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                });
        } else {
            setState({ isLoading: false });
        }
    }, []);

    const actions = useMemo(
        () => ({
            login,
            register,
            logout,
            loginWithGoogle,
            updateProfile,
            updateUser: updateProfile,
            clearError,
            setMockUser,
        }),
        []
    );

    return { ...snapshot, ...actions };
};

export default useAuth;
