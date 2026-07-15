import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import { useAuthModal } from '@/context/AuthModalContext';

/**
 * Hook to guard actions that require authentication
 * Returns a function that checks if user is authenticated
 * - If authenticated: executes the callback
 * - If not authenticated: opens auth modal (for booking flow) or redirects to login page
 * 
 * @param {boolean} useModal - If true, opens modal instead of redirecting to /login
 * @returns {Function} guardedAction function
 */
export const useAuthGuard = (useModal = false) => {
    const { isAuthenticated } = useAuth();
    const { openAuthModal } = useAuthModal();
    const navigate = useNavigate();

    const guardedAction = useCallback((callback, redirectPath = null) => {
        if (isAuthenticated) {
            // User is logged in, execute the callback
            if (callback && typeof callback === 'function') {
                callback();
            }
            return true;
        } else {
            // User is not logged in
            if (useModal) {
                // Open modal for booking/seat selection flow
                openAuthModal('login', redirectPath);
            } else {
                // Redirect to login page for header/menu actions
                navigate('/login', { state: { from: redirectPath || window.location.pathname } });
            }
            return false;
        }
    }, [isAuthenticated, useModal, openAuthModal, navigate]);

    return guardedAction;
};

export default useAuthGuard;
