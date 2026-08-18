import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Eye, Film, Gift, Loader2, Settings, Ticket, Trash2, WalletCards } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import notificationService from '@/services/notificationService';
import useNotification from '@/hooks/useNotification';

const notificationMeta = (type) => {
  const normalized = String(type || 'SYSTEM').toUpperCase();
  if (normalized === 'BOOKING_SUCCESS') return { label: 'Đặt vé', tone: 'info', icon: Ticket };
  if (normalized === 'PAYMENT_SUCCESS') return { label: 'Thanh toán', tone: 'success', icon: WalletCards };
  if (normalized === 'PAYMENT_FAILED') return { label: 'Thanh toán lỗi', tone: 'destructive', icon: WalletCards };
  if (normalized === 'SHOWTIME_CHANGED') return { label: 'Suất chiếu', tone: 'warning', icon: Film };
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
  const [capabilityMessage, setCapabilityMessage] = useState('');

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setCapabilityMessage('');
      const response = await notificationService.listMine({ page: 0, size: 100, sort: 'createdAt,desc' });
      setItems(extractItems(response));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setItems([]);
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') {
        setCapabilityMessage(error.message);
      } else {
        notification.error(error?.message || 'Không tải được danh sách thông báo');
      }
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
      notification.error(error?.message || 'Không thể đánh dấu đã đọc');
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
      notification.error(error?.message || 'Xóa thông báo thất bại');
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
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') setCapabilityMessage(error.message);
      notification.error(error?.message || 'Không thể đánh dấu tất cả đã đọc');
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <main className="min-h-screen bg-background px-4 pb-8 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Thông báo</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Thông báo dành riêng cho tài khoản đang đăng nhập'}
            </p>
          </div>

          {unreadCount > 0 && !capabilityMessage && (
            <Button size="sm" onClick={markAllAsRead} disabled={markingAll}>
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </header>

        {capabilityMessage && (
          <Alert
            variant="warning"
            showIcon
            message="Backend chưa có API thông báo cá nhân an toàn"
            description={`${capabilityMessage} FE không tải collection thông báo toàn hệ thống để lọc theo user vì thao tác đó có thể làm lộ dữ liệu của tài khoản khác.`}
            className="mb-4"
          />
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải thông báo...
              </div>
            ) : items.length === 0 ? (
              <Empty description={capabilityMessage ? 'Chưa thể tải thông báo cá nhân từ backend hiện tại' : 'Không có thông báo nào'} className="min-h-40" />
            ) : (
              <div className="divide-y divide-border">
                {items.map((item) => {
                  const meta = notificationMeta(item.type);
                  const Icon = meta.icon;
                  const isRead = item.isRead ?? item.read ?? false;
                  const busy = busyId === item.id;

                  return (
                    <article
                      key={item.id}
                      className={`grid gap-3 p-3 transition-colors sm:grid-cols-[36px_minmax(0,1fr)_auto] sm:items-start ${isRead ? 'bg-card' : 'bg-primary/[0.035]'}`}
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-muted/40">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h2 className="min-w-0 font-medium text-foreground">{item.title || 'Thông báo'}</h2>
                          <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                          {!isRead && <StatusBadge tone="info">Mới</StatusBadge>}
                        </div>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-muted-foreground">
                          {item.content || item.message || 'Không có nội dung'}
                        </p>
                        {item.createdAt && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {new Date(item.createdAt).toLocaleString('vi-VN')}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 sm:justify-end">
                        {!isRead && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            disabled={busy}
                            onClick={() => markAsRead(item)}
                            aria-label="Đánh dấu đã đọc"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={busy}
                          onClick={() => deleteNotification(item)}
                          aria-label="Xóa thông báo"
                        >
                          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Notifications;
