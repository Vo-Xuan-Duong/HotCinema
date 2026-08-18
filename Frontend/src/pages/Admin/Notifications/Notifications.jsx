import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, Loader2, Plus, Search, Send } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import useNotification from '@/hooks/useNotification';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import notificationService from '@/services/notificationService';
import userService from '@/services/userService';

const makeDefaultForm = () => ({
  delivery: MOCK_API_ENABLED ? 'broadcast' : 'user',
  userId: '',
  title: '',
  content: '',
  type: 'SYSTEM',
});

const NOTIFICATION_TYPES = [
  ['SYSTEM', 'Hệ thống'],
  ['PROMOTION', 'Khuyến mãi'],
  ['BOOKING_SUCCESS', 'Đặt vé thành công'],
  ['PAYMENT_SUCCESS', 'Thanh toán thành công'],
  ['PAYMENT_FAILED', 'Thanh toán thất bại'],
  ['SHOWTIME_CHANGED', 'Thay đổi lịch chiếu'],
];

const typeMeta = (type) => {
  const normalized = String(type || 'SYSTEM').toUpperCase();
  if (normalized === 'PROMOTION') return { label: 'Khuyến mãi', tone: 'warning' };
  if (normalized === 'BOOKING_SUCCESS') return { label: 'Đặt vé', tone: 'info' };
  if (normalized === 'PAYMENT_SUCCESS') return { label: 'Thanh toán', tone: 'success' };
  if (normalized === 'PAYMENT_FAILED') return { label: 'Thanh toán lỗi', tone: 'destructive' };
  if (normalized === 'SHOWTIME_CHANGED') return { label: 'Lịch chiếu', tone: 'info' };
  return { label: 'Hệ thống', tone: 'neutral' };
};

const extractItems = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

function AdminNotifications() {
  const notification = useNotification();
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(!MOCK_API_ENABLED);
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(makeDefaultForm);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.list({ page: 0, size: 500, sort: 'createdAt,desc' });
      setItems(extractItems(response));
    } catch (error) {
      console.error('Error loading admin notifications:', error);
      setItems([]);
      notification.error(error?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [notification]);

  const loadUsers = useCallback(async () => {
    if (MOCK_API_ENABLED) {
      setUsers([]);
      setUsersLoading(false);
      return;
    }
    setUsersLoading(true);
    try {
      const response = await userService.getAllUsers({ page: 0, size: 500 });
      const rows = extractItems(response)
        .filter((user) => String(user.status || 'ACTIVE').toUpperCase() !== 'DISABLED')
        .sort((left, right) => String(left.fullName || left.email || '').localeCompare(String(right.fullName || right.email || ''), 'vi'));
      setUsers(rows);
    } catch (error) {
      console.error('Error loading notification recipients:', error);
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);
  useEffect(() => { loadUsers(); }, [loadUsers]);

  const userById = useMemo(() => new Map(users.map((user) => [String(user.id), user])), [users]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => {
      const recipient = userById.get(String(item.userId));
      return `${item.title || ''} ${item.content || item.message || ''} ${item.type || ''} ${recipient?.fullName || ''} ${recipient?.email || ''}`.toLowerCase().includes(needle);
    });
  }, [items, query, userById]);

  const closeForm = () => {
    setOpen(false);
    setForm(makeDefaultForm());
  };

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      notification.error('Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    if (!MOCK_API_ENABLED && !form.userId) {
      notification.error('Vui lòng chọn người nhận');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
      };
      if (MOCK_API_ENABLED) {
        await notificationService.broadcast(payload);
        notification.success('Đã gửi broadcast trong mock mode');
      } else {
        await notificationService.create({
          ...payload,
          userId: form.userId,
          isRead: false,
        });
        notification.success('Đã tạo thông báo cho người dùng');
      }
      closeForm();
      await loadNotifications();
    } catch (error) {
      console.error('Error creating notification:', error);
      notification.error(error?.message || 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Thông báo"
        description="Quản lý Notification CRUD theo người nhận; broadcast phụ thuộc capability backend."
        breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Thông báo' }]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Tạo thông báo</Button>}
      />

      <Alert
        type="info"
        showIcon
        message={MOCK_API_ENABLED ? 'Mock mode sử dụng broadcast' : 'Real backend sử dụng Notification CRUD theo userId'}
        description={MOCK_API_ENABLED
          ? 'Mock adapter hiện chỉ có broadcast notification; FE không giả create trực tiếp cho một user.'
          : 'Broadcast không được giả lập bằng cách client tự tạo hàng loạt notification cho toàn bộ user.'}
      />

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Trung tâm thông báo</CardTitle>
            <CardDescription>{items.length} thông báo đã tải</CardDescription>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm nội dung hoặc người nhận..." className="pl-9" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải thông báo...</div>
          ) : filtered.length === 0 ? (
            <Empty description={query ? 'Không tìm thấy thông báo phù hợp' : 'Chưa có thông báo'} />
          ) : filtered.map((item) => {
            const meta = typeMeta(item.type);
            const recipient = userById.get(String(item.userId));
            return (
              <article key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="rounded-md border bg-muted/40 p-2"><BellRing className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{item.title || 'Không có tiêu đề'}</p><StatusBadge tone={item.isRead ? 'neutral' : 'info'}>{item.isRead ? 'Đã đọc' : 'Chưa đọc'}</StatusBadge></div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{item.content || item.message || 'Không có nội dung'}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Người nhận: {recipient?.fullName || recipient?.email || String(item.userId || (MOCK_API_ENABLED ? 'broadcast' : '—'))}</p>
                  </div>
                </div>
                <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={open}
        onClose={closeForm}
        heading="Tạo thông báo"
        description={MOCK_API_ENABLED ? 'Thông báo sẽ broadcast trong mock mode.' : 'Payload được gửi theo NotificationCreateRequest của backend.'}
        maxWidth={620}
        actions={[
          <Button key="cancel" variant="outline" onClick={closeForm}>Hủy</Button>,
          <Button key="send" disabled={sending || usersLoading} onClick={submit}>{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? 'Đang gửi...' : 'Gửi thông báo'}</Button>,
        ]}
      >
        <div className="space-y-4">
          {!MOCK_API_ENABLED && (
            <div className="space-y-2"><Label>Người nhận</Label><Select value={form.userId} onValueChange={(userId) => setForm((current) => ({ ...current, userId }))} disabled={usersLoading}><SelectTrigger><SelectValue placeholder={usersLoading ? 'Đang tải user...' : 'Chọn người nhận'} /></SelectTrigger><SelectContent>{users.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.fullName || user.email} · {user.email}</SelectItem>)}</SelectContent></Select></div>
          )}
          <div className="space-y-2"><Label htmlFor="notification-title">Tiêu đề</Label><Input id="notification-title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} /></div>
          <div className="space-y-2"><Label>Loại thông báo</Label><Select value={form.type} onValueChange={(type) => setForm((current) => ({ ...current, type }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{NOTIFICATION_TYPES.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label htmlFor="notification-content">Nội dung</Label><Textarea id="notification-content" rows={6} value={form.content} onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))} /></div>
        </div>
      </ResponsiveDialog>
    </section>
  );
}

export default AdminNotifications;
