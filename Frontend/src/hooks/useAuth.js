import { useEffect, useMemo, useSyncExternalStore } from 'react';
import api from '@/utils/apiClient.js';
import { authService } from '@/services/authService.js';
import {
    getUserInfo,
    getAccessToken,
    getRefreshToken,
    saveAuthData
} from '@/utils/authStorage.js';

const subscribers = new Set();

const notify = () => {
    subscribers.forEach((cb) => {
        try { cb(); } catch (_) { /* noop */ }
    });
};

const getStoredUser = () => getUserInfo();

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
        const token = res?.token;
        const user = res?.user || state.user;

        if (payload?.rememberMe && payload?.email) {
            saveAuthData({ rememberEmail: payload.email });
        } else {
            saveAuthData({ rememberEmail: false });
        }

        setState({
            user,
            token,
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

        const loginError = new Error(message);
        loginError.status = status;
        loginError.response = err?.response;
        throw loginError;
    }
};

const register = async (userData) => {
    setState({ isLoading: true, error: null });
    try {
        const res = await authService.register(userData);
        setState({
            user: null,
            token: null,
            isAuthenticated: false,
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
    setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
    });
};

const syncUser = (user) => {
    if (!user) return;

    if (state.token) {
        api.setAuthToken(state.token, getRefreshToken(), user);
    } else {
        saveAuthData({ user });
    }

    setState({
        user,
        isAuthenticated: Boolean(state.token),
        error: null,
    });
};

const updateProfile = async (userData) => {
    setState({ isLoading: true, error: null });
    try {
        const res = await authService.updateProfile(userData);
        const user = res?.user;

        if (user) syncUser(user);

        setState({
            user: user || state.user,
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
        const token = res?.token;
        const user = res?.user;

        setState({
            user,
            token,
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

        const googleError = new Error(message);
        googleError.status = status;
        googleError.response = err?.response;
        throw googleError;
    }
};

const clearError = () => setState({ error: null });

export const useAuth = () => {
    const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);

    useEffect(() => {
        if (initialized) return;
        initialized = true;

        const token = getAccessToken();
        const user = getStoredUser();

        if (token && user) {
            api.setAuthToken(token, getRefreshToken(), user);
            setState({
                user,
                token,
                isAuthenticated: true,
                isLoading: true,
                error: null
            });

            authService
                .verify()
                .then(() => {
                    setState({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });
                })
                .catch(() => {
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
            syncUser,
            clearError,
        }),
        []
    );

    return { ...snapshot, ...actions };
};

export default useAuth;
