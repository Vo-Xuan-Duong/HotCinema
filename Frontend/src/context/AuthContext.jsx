import React, { createContext, useReducer, useEffect } from 'react';
import api from '@/utils/apiClient.js';
import { authService } from '@/services/authService.js';
import { initialState, AUTH_ACTIONS, authReducer } from '@/context/AuthContextUtils.js';
import { getUserInfo, getAccessToken, saveAuthData } from '@/utils/authStorage.js';

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      const userInfo = getUserInfo();

      if (token && userInfo) {
        try {
          // verify token with backend
          await authService.verify();
          dispatch({
            type: AUTH_ACTIONS.LOGIN_SUCCESS,
            payload: { user: userInfo, token }
          });
        } catch (err) {
          // invalid token, clear
          api.removeAuthToken();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Clear error helper
  const clearError = () => dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });

  // Login function (supports legacy and new signatures)
  const login = async (...args) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      let payload;
      if (args.length === 1 && typeof args[0] === 'object') {
        const { usernameOrEmail, password, rememberMe } = args[0] || {};
        payload = { usernameOrEmail, password, rememberMe };
      } else if (args.length === 2 && typeof args[0] === 'string') {
        payload = { usernameOrEmail: args[0], password: args[1] };
      } else {
        throw new Error('Invalid login parameters');
      }

      const response = await authService.login(payload);

      // authService.login should call api.setAuthToken but keep remember email handling here
      if (payload?.rememberMe && payload?.usernameOrEmail) {
        saveAuthData({ rememberEmail: payload.usernameOrEmail });
      } else {
        saveAuthData({ rememberEmail: false });
      }

      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: response.user, token: response.token }
      });

      return response;
    } catch (error) {
      const message = error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: message });
      const forwarded = new Error(message);
      forwarded.status = error?.status;
      throw forwarded;
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START });
    try {
      const response = await authService.register(userData);

      if (response?.token) {
        api.setAuthToken(response.token, null, response.user);
      }

      dispatch({
        type: AUTH_ACTIONS.REGISTER_SUCCESS,
        payload: { user: response.user, token: response.token }
      });

      return response;
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: error?.message || error });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (_) {
      // ignore
    }
    api.removeAuthToken();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile
  const updateProfile = async (userData) => {
    const response = await authService.updateProfile(userData);

    // Update stored user info (keep token)
    if (response?.user && state.token) {
      api.setAuthToken(state.token, null, response.user);
    }

    dispatch({
      type: AUTH_ACTIONS.LOGIN_SUCCESS,
      payload: { user: response.user, token: state.token }
    });

    return response;
  };

  // Set mock user (for demo/testing)
  const setMockUser = (mockUser, token = 'mock-jwt-token-' + Date.now()) => {
    api.setAuthToken(token, null, mockUser);
    dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user: mockUser, token } });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    setMockUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider; 