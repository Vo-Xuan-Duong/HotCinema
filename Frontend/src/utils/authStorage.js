/**
 * Centralized authentication storage management
 * All localStorage operations for authentication should go through this utility
 */

import { STORAGE_KEYS } from '@/utils/constants.js';

/**
 * Save authentication data to localStorage
 * This is the ONLY function that should write auth data to localStorage
 */
export const saveAuthData = ({ accessToken, refreshToken, user, rememberEmail }) => {
    try {
        // Save access token
        if (accessToken) {
            localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
            localStorage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken); // Legacy support
        }

        // Save refresh token
        if (refreshToken) {
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
        }

        // Save user info
        if (user) {
            localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(user));
            if (user.id) {
                localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
            }
        }

        // Save remember email
        if (rememberEmail !== undefined) {
            if (rememberEmail) {
                localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, rememberEmail);
            } else {
                localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
            }
        }
    } catch (error) {
        console.error('Error saving auth data to localStorage:', error);
    }
};

/**
 * Clear all authentication data from localStorage
 * This is the ONLY function that should clear auth data from localStorage
 */
export const clearAuthData = () => {
    try {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_INFO);
        localStorage.removeItem(STORAGE_KEYS.USER_ID);
        // Note: We don't clear REMEMBER_EMAIL on logout
    } catch (error) {
        console.error('Error clearing auth data from localStorage:', error);
    }
};

/**
 * Get access token from localStorage
 */
export const getAccessToken = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
            localStorage.getItem(STORAGE_KEYS.USER_TOKEN); // Fallback to legacy
    } catch {
        return null;
    }
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch {
        return null;
    }
};

/**
 * Get user info from localStorage
 */
export const getUserInfo = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.USER_INFO);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

/**
 * Get remembered email from localStorage
 */
export const getRememberedEmail = () => {
    try {
        return localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL);
    } catch {
        return null;
    }
};

/**
 * Check if user is authenticated based on localStorage
 */
export const isAuthenticatedInStorage = () => {
    const token = getAccessToken();
    const user = getUserInfo();
    return !!(token && user);
};
