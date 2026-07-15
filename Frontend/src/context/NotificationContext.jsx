import React, { createContext, useCallback, useContext, useState } from 'react';
import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const shouldShowNotification = useCallback((type, important) => {
        if (type === 'error' || type === 'success') {
            return true;
        }
        return important === true;
    }, []);

    const closeToast = useCallback((id) => {
        setToasts((items) =>
            items.map((item) => (item.id === id ? { ...item, open: false } : item))
        );
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((items) => items.filter((item) => item.id !== id));
    }, []);

    const showNotification = useCallback((type, message, duration = 2500, important = false) => {
        if (!shouldShowNotification(type, important)) {
            console.log(`[Notification skipped] ${type}: ${message}`);
            return;
        }

        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((items) => [
            ...items,
            { id, type, message, duration, open: true },
        ]);
    }, [shouldShowNotification]);

    const success = useCallback((message, duration) => {
        showNotification('success', message, duration, true);
    }, [showNotification]);

    const error = useCallback((message, duration) => {
        showNotification('error', message, duration, true);
    }, [showNotification]);

    const warning = useCallback((message, duration, important = false) => {
        showNotification('warning', message, duration, important);
    }, [showNotification]);

    const info = useCallback((message, duration, important = false) => {
        showNotification('info', message, duration, important);
    }, [showNotification]);

    const value = {
        showNotification,
        success,
        error,
        warning,
        info,
    };

    const titleMap = {
        success: 'Thành công',
        error: 'Lỗi',
        warning: 'Cảnh báo',
        info: 'Thông báo',
    };

    return (
        <NotificationContext.Provider value={value}>
            <ToastProvider swipeDirection="right">
                {children}
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        open={toast.open}
                        onOpenChange={(open) => !open && closeToast(toast.id)}
                        onAnimationEnd={() => !toast.open && removeToast(toast.id)}
                        duration={toast.duration}
                        variant={toast.type === 'error' ? 'destructive' : toast.type}
                    >
                        <div className="grid gap-1">
                            <ToastTitle>{titleMap[toast.type] || titleMap.info}</ToastTitle>
                            <ToastDescription>{toast.message}</ToastDescription>
                        </div>
                        <ToastClose />
                    </Toast>
                ))}
                <ToastViewport />
            </ToastProvider>
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
