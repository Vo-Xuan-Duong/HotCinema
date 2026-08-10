import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Eye, Gift, Loader2, Settings, Ticket, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import notificationService from '@/services/notificationService';
import useNotification from '@/hooks/useNotification';

const notificationMeta = (type) => {
  const normalized = String(type || 'SYSTEM').toUpperCase();
  if (normalized === 'BOOKING') return { label: 'Đặt vé', tone: 'info', icon: Ticket };
  if (normalized === 'PROMOTION') return { label: 'Khuyến mãi', tone: 'warning', icon: Gift };
  return { label: 'Hệ thống', tone: 'neutral', icon: Settings };
};

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const Notifications = () => {
  const notification = useNotification();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.list({ page: 0, size: 100, sort: 'createdAt,desc' });
      setItems(extractItems(response));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setItems([]);
      notification.error(error?.message || 'Không tải được danh sách thông báo');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => items.filter((item) => item.isRead === false || item.read === false).length,
    [items]
  );

  const markAsRead = async (item) => {
    const isRead = item.isRead ?? item.read;
    if (isRead === true) return;
    try {
      setBusyId(item.id);
      await notificationService.markAsRead(item.id);
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, isRead: true, read: true } : entry));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      notification.error('Không thể đánh dấu đã đọc');
    } finally {
      setBusyId(null);
    }
  };

  const deleteNotification = async (item) => {
    const previous = items;
    setItems((current) => current.filter((entry) => entry.id !== item.id));
    try {
      setBusyId(item.id);
      await notificationService.delete(item.id);
    } catch (error) {
      console.error('Error deleting notification:', error);
      setItems(previous);
      notification.error('Xóa thông báo thất bại');
    } finally {
      setBusyId(null);
    }
  };

  const markAllAsRead = async () => {
    const previous = items;
    try {
      setMarkingAll(true);
      setItems((current) => current.map((entry) => ({ ...entry, isRead: true, read: true })));
      await notificationService.markAllAsRead();
      notification.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      setItems(previous);
      notification.error('Không thể đánh dấu tất cả đã đọc');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card>
          <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl"><Bell className="h-5 w-5" />Thông báo</CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">{unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Tất cả thông báo đã được đọc'}</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} disabled={markingAll}>
                {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Đánh dấu tất cả đã đọc
              </Button>
            )}
          </CardHeader>
        </Card>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông báo...</div>
        ) : items.length === 0 ? (
          <Empty description="Không có thông báo nào" />
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const meta = notificationMeta(item.type);
              const Icon = meta.icon;
              const isRead = item.isRead ?? item.read ?? false;
              const busy = busyId === item.id;
              return (
                <Card key={item.id} className={isRead ? '' : 'border-primary/30 bg-primary/[0.03]'}>
                  <CardContent className="flex gap-4 p-4 sm:p-5">
                    <div className="rounded-md border bg-muted/40 p-2.5"><Icon className="h-5 w-5 text-muted-foreground" /></div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-foreground">{item.title || 'Thông báo'}</h3>
                          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.content || item.message || 'Không có nội dung'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                          {!isRead && <StatusBadge tone="info">Mới</StatusBadge>}
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">{item.createdAt ? new Date(item.createdAt).toLocaleString('vi-VN') : ''}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {!isRead && (
                          <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={() => markAsRead(item)}>
                            <Eye className="h-4 w-4" />Đã đọc
                          </Button>
                        )}
                        <Button type="button" variant="ghost" size="sm" disabled={busy} className="text-destructive hover:text-destructive" onClick={() => deleteNotification(item)}>
                          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Xóa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
