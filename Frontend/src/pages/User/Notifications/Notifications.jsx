import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Check, Eye, Gift, Loader2, RefreshCw, Settings, Ticket, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  const [loadError, setLoadError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await notificationService.list({ page: 0, size: 100, sort: 'createdAt,desc' });
      setItems(extractItems(response));
    } catch (error) {
      console.error('Error loading notifications:', error);
      setItems([]);
      setLoadError(error?.message || 'Không tải được danh sách thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

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
    <main className="min-h-screen bg-background px-4 pb-8 pt-20 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Thông báo</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {loading
                ? 'Đang đồng bộ thông báo...'
                : loadError
                  ? 'Không thể đồng bộ thông báo'
                  : unreadCount > 0
                    ? `${unreadCount} thông báo chưa đọc`
                    : 'Tất cả thông báo đã được đọc'}
            </p>
          </div>

          {!loadError && unreadCount > 0 && (
            <Button size="sm" onClick={markAllAsRead} disabled={markingAll}>
              {markingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </header>

        {loadError && (
          <Alert
            variant="destructive"
            showIcon
            message="Không thể tải thông báo"
            description={loadError}
            className="mb-4"
          />
        )}

        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang tải thông báo...
              </div>
            ) : loadError ? (
              <div className="flex min-h-48 flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                <Bell className="h-10 w-10 text-muted-foreground/35" />
                <div>
                  <p className="text-sm font-medium">Danh sách thông báo chưa khả dụng</p>
                  <p className="mt-1 text-sm text-muted-foreground">Kiểm tra kết nối và thử tải lại.</p>
                </div>
                <Button type="button" variant="outline" onClick={loadNotifications}>
                  <RefreshCw className="h-4 w-4" />
                  Thử lại
                </Button>
              </div>
            ) : items.length === 0 ? (
              <Empty description="Không có thông báo nào" className="min-h-40" />
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
