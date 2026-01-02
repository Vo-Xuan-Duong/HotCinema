import React, { createContext, useContext, useState, useCallback } from 'react';
import NotificationModal from '../components/Notification/NotificationModal';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [notification, setNotification] = useState({
        visible: false,
        type: 'info',
        message: '',
        duration: 2000,
        important: false,
    });

    // Chỉ hiển thị thông báo quan trọng hoặc error/success
    const shouldShowNotification = useCallback((type, important) => {
        // Luôn hiển thị error và success
        if (type === 'error' || type === 'success') {
            return true;
        }
        // Chỉ hiển thị warning và info nếu được đánh dấu là quan trọng
        return important === true;
    }, []);

    const showNotification = useCallback((type, message, duration = 2000, important = false) => {
        // Chỉ hiển thị nếu thông báo quan trọng hoặc là error/success
        if (!shouldShowNotification(type, important)) {
            // Log để debug nhưng không hiển thị
            console.log(`[Notification skipped] ${type}: ${message}`);
            return;
        }

        setNotification({
            visible: true,
            type,
            message,
            duration,
            important,
        });
    }, [shouldShowNotification]);

    const hideNotification = useCallback(() => {
        setNotification(prev => ({
            ...prev,
            visible: false,
        }));
    }, []);

    // Success và Error luôn được hiển thị
    const success = useCallback((message, duration) => {
        showNotification('success', message, duration, true);
    }, [showNotification]);

    const error = useCallback((message, duration) => {
        showNotification('error', message, duration, true);
    }, [showNotification]);

    // Warning và Info chỉ hiển thị nếu được đánh dấu là quan trọng
    const warning = useCallback((message, duration, important = false) => {
        showNotification('warning', message, duration, important);
    }, [showNotification]);

    const info = useCallback((message, duration, important = false) => {
        showNotification('info', message, duration, important);
    }, [showNotification]);

    const value = {
        showNotification,
        hideNotification,
        success,
        error,
        warning,
        info,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <NotificationModal
                visible={notification.visible}
                type={notification.type}
                message={notification.message}
                duration={notification.duration}
                onClose={hideNotification}
            />
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return context;
};

export default NotificationContext;

