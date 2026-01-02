import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import './NotificationModal.css';

const NotificationModal = ({ visible, type, message, onClose, duration = 3000 }) => {
    const timerRef = useRef(null);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (visible) {
            setIsExiting(false);
            // Clear any existing timer
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }

            // Tự động đóng sau duration (mặc định 3 giây)
            timerRef.current = setTimeout(() => {
                handleClose();
            }, duration);

            return () => {
                if (timerRef.current) {
                    clearTimeout(timerRef.current);
                }
            };
        }
    }, [visible, duration]);

    const handleClose = () => {
        setIsExiting(true);
        // Đợi animation exit hoàn thành trước khi gọi onClose
        setTimeout(() => {
            onClose?.();
            setIsExiting(false);
        }, 300);
    };

    const getIcon = () => {
        const iconClasses = "h-5 w-5";
        switch (type) {
            case 'success':
                return <CheckCircle2 className={cn(iconClasses, "text-green-600")} />;
            case 'error':
                return <XCircle className={cn(iconClasses, "text-red-600")} />;
            case 'warning':
                return <AlertCircle className={cn(iconClasses, "text-yellow-600")} />;
            case 'info':
            default:
                return <Info className={cn(iconClasses, "text-blue-600")} />;
        }
    };

    const getTitle = () => {
        switch (type) {
            case 'success':
                return 'Thành công';
            case 'error':
                return 'Lỗi';
            case 'warning':
                return 'Cảnh báo';
            case 'info':
            default:
                return 'Thông báo';
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-white border-l-4 border-green-500 shadow-lg';
            case 'error':
                return 'bg-white border-l-4 border-red-500 shadow-lg';
            case 'warning':
                return 'bg-white border-l-4 border-yellow-500 shadow-lg';
            case 'info':
            default:
                return 'bg-white border-l-4 border-blue-500 shadow-lg';
        }
    };

    const getIconBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100';
            case 'error':
                return 'bg-red-100';
            case 'warning':
                return 'bg-yellow-100';
            case 'info':
            default:
                return 'bg-blue-100';
        }
    };

    if (!visible && !isExiting) return null;

    return (
        <div
            className={cn(
                "fixed top-4 right-4 z-[10000] min-w-[320px] max-w-[420px]",
                visible && !isExiting ? "notification-slide-in" : "notification-slide-out"
            )}
            style={{ pointerEvents: visible ? 'auto' : 'none' }}
        >
            <div className={cn(
                "flex items-start gap-3 p-4 rounded-lg",
                "backdrop-blur-sm",
                getBackgroundColor()
            )}>
                {/* Icon */}
                <div className={cn(
                    "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
                    getIconBackgroundColor()
                )}>
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">
                                {getTitle()}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed break-words">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                            aria-label="Đóng thông báo"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationModal;

