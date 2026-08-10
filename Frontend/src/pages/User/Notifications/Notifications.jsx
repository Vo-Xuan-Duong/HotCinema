import React, { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { StatusBadge } from '@/components/ui/status-badge';
import { Empty } from '@/components/ui/empty';
import { ContentList } from '@/components/ui/content-list';
import notificationService from '@/services/notificationService';
import useNotification from '@/hooks/useNotification';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const notification = useNotification();

    useEffect(() => {
        const fetchNotifications = async () => {
            setLoading(true);
            try {
                const response = await notificationService.list();
                // Response structure: { data: { content: [...] } }
                const items = response?.data?.content || response?.content || [];

                setNotifications(items.map(n => ({
                    id: n.id,
                    type: n.type || 'system',
                    title: n.title,
                    message: n.message,
                    time: n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : '',
                    read: n.isRead,
                    priority: 'medium' // Backend doesn't return priority yet, default to medium
                })));
            } catch (err) {
                notification.error(err.message || 'Không tải được danh sách thông báo');
            } finally {
                setLoading(false);
            }
        };
        fetchNotifications();
    }, [notification]);

    const getNotificationIcon = (type) => {
        const icons = {
            booking: '🎫',
            promotion: '🎁',
            reminder: '⏰',
            system: '⚙️'
        };
        return icons[type] || '📬';
    };

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'red',
            medium: 'orange',
            low: 'blue'
        };
        return colors[priority] || 'default';
    };

    const markAsRead = async (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await notificationService.markAsRead(id);
        } catch (err) {
            notification.error('Không thể đánh dấu đã đọc');
        }
    };

    const deleteNotification = async (id) => {
        const prev = notifications;
        setNotifications(prev.filter(n => n.id !== id));
        try {
            await notificationService.delete(id);
        } catch (err) {
            notification.error('Xóa thất bại');
            setNotifications(prev);
        }
    };

    const markAllAsRead = async () => {
        const prev = notifications;
        setNotifications(prev.map(n => ({ ...n, read: true })));
        try {
            await notificationService.markAllAsRead();
        } catch (err) {
            notification.error('Không thể đánh dấu tất cả đã đọc');
            setNotifications(prev);
        }
    };

    const unreadCount = notifications.filter(notif => !notif.read).length;

    return (
        <div className="min-h-screen bg-background py-8 px-4">
            <div className="max-w-[1200px] mx-auto">
                <div className="bg-card rounded-xl shadow-md border border-border p-6 mb-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div>
                            <h2 className="text-foreground mb-2 text-2xl font-bold flex items-center gap-2">
                                <Bell className="h-6 w-6" />
                                Thông báo
                            </h2>
                            <p className="text-muted-foreground">
                                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                onClick={markAllAsRead}
                                className="rounded-lg"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                Đánh dấu tất cả đã đọc
                            </Button>
                        )}
                    </div>
                </div>

                <div>
                    {notifications.length === 0 && !loading ? (
                        <Empty description="Không có thông báo nào" />
                    ) : (
                        <ContentList
                            loading={loading}
                            entries={notifications.map((notification) => ({
                                key: notification.id,
                                content: (
                                    <Card
                                        className={`w-full rounded-lg shadow-sm border transition-all duration-300 ${!notification.read
                                                ? 'bg-blue-50 border-blue-200 hover:shadow-md'
                                                : 'bg-card border-border hover:shadow-md'
                                            }`}
                                    >
                                        <div className="flex gap-4 p-4">
                                            <Avatar className={`text-2xl ${notification.type === 'booking' ? 'bg-blue-100' :
                                                    notification.type === 'promotion' ? 'bg-pink-100' :
                                                        notification.type === 'reminder' ? 'bg-yellow-100' :
                                                            'bg-gray-100'
                                                }`}>
                                                {getNotificationIcon(notification.type)}
                                            </Avatar>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                                                    <span className="text-foreground font-semibold">{notification.title}</span>
                                                    <div className="flex gap-2">
                                                        <StatusBadge tone={getPriorityColor(notification.priority)}>
                                                            {notification.priority === 'high' ? 'Quan trọng' :
                                                                notification.priority === 'medium' ? 'Thông thường' : 'Thấp'}
                                                        </StatusBadge>
                                                        {!notification.read && (
                                                            <StatusBadge tone="red">Mới</StatusBadge>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 block mb-2">{notification.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </p>
                                                <div className="flex gap-2 mt-3">
                                                    {!notification.read && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="rounded"
                                                        >
                                                            <Eye className="h-4 w-4 mr-1" />
                                                            Đã đọc
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="rounded text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                )
                            }))}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notifications;
