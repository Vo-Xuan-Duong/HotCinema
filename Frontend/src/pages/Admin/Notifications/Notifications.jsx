import { useCallback, useEffect, useMemo, useState } from 'react';
import { BellRing, Loader2, Plus, RefreshCw, Search, Send } from 'lucide-react';
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
import notificationService from '@/services/notificationService';

const DEFAULT_FORM = { title: '', content: '', type: 'SYSTEM' };
const TITLE_LIMIT = 120;
const CONTENT_LIMIT = 1000;

const typeMeta = (type) => {
  const normalized = String(type || 'SYSTEM').toUpperCase();
  if (normalized === 'PROMOTION') return { label: 'Khuyến mãi', tone: 'warning' };
  if (normalized === 'BOOKING') return { label: 'Đặt vé', tone: 'info' };
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
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sending, setSending] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setLoadError('');
      const response = await notificationService.list({ page: 0, size: 100, sort: 'createdAt,desc' });
      setItems(extractItems(response));
    } catch (error) {
      console.error('Error loading admin notifications:', error);
      setItems([]);
      setLoadError(error?.message || 'Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) => `${item.title || ''} ${item.content || item.message || ''} ${item.type || ''}`.toLowerCase().includes(needle));
  }, [items, query]);

  const formValid = form.title.trim().length > 0 && form.content.trim().length > 0;

  const closeForm = () => {
    if (sending) return;
    setOpen(false);
    setForm(DEFAULT_FORM);
  };

  const submit = async () => {
    if (!formValid) {
      notification.warning('Vui lòng nhập tiêu đề và nội dung');
      return;
    }

    try {
      setSending(true);
      await notificationService.broadcast({
        title: form.title.trim(),
        content: form.content.trim(),
        type: form.type,
      });
      setOpen(false);
      setForm(DEFAULT_FORM);
      notification.success('Đã gửi thông báo');
      await loadNotifications();
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      notification.error(error?.message || 'Không thể gửi thông báo');
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Thông báo"
        description="Soạn và phát thông báo hệ thống, đặt vé hoặc khuyến mãi đến người dùng."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Thông báo' },
        ]}
        actions={<Button onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Tạo thông báo</Button>}
      />

      {loadError && (
        <Alert
          variant="destructive"
          showIcon
          message="Không thể tải trung tâm thông báo"
          description={loadError}
        />
      )}

      <Card>
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg">Trung tâm thông báo</CardTitle>
            <CardDescription>
              {loading ? 'Đang đồng bộ dữ liệu...' : loadError ? 'Dữ liệu chưa khả dụng' : `${items.length} thông báo đã tải`}
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm tiêu đề, nội dung, loại..."
              className="pl-9"
              disabled={loading || Boolean(loadError)}
              aria-label="Tìm thông báo"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground" role="status" aria-live="polite">
              <Loader2 className="h-5 w-5 animate-spin" />Đang tải thông báo...
            </div>
          ) : loadError ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center">
              <BellRing className="h-10 w-10 text-muted-foreground/35" />
              <div>
                <p className="text-sm font-medium">Không lấy được danh sách thông báo</p>
                <p className="mt-1 text-sm text-muted-foreground">Thử tải lại trước khi tạo hoặc kiểm tra thông báo mới.</p>
              </div>
              <Button variant="outline" onClick={loadNotifications}>
                <RefreshCw className="h-4 w-4" />Thử lại
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <Empty description={query ? 'Không tìm thấy thông báo phù hợp' : 'Chưa có thông báo'} />
          ) : filtered.map((item) => {
            const meta = typeMeta(item.type);
            return (
              <article key={item.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div className="shrink-0 rounded-md border bg-muted/40 p-2"><BellRing className="h-4 w-4 text-muted-foreground" /></div>
                  <div className="min-w-0">
                    <p className="break-words font-medium text-foreground">{item.title || 'Không có tiêu đề'}</p>
                    <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.content || item.message || 'Không có nội dung'}</p>
                  </div>
                </div>
                <StatusBadge tone={meta.tone} className="shrink-0">{meta.label}</StatusBadge>
              </article>
            );
          })}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={open}
        onClose={closeForm}
        heading="Tạo thông báo"
        description="Thông báo sẽ được gửi đến người dùng qua endpoint broadcast của hệ thống."
        maxWidth={560}
        actions={[
          <Button key="cancel" variant="outline" onClick={closeForm} disabled={sending}>Hủy</Button>,
          <Button key="send" disabled={sending || !formValid} onClick={submit}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? 'Đang gửi...' : 'Gửi thông báo'}
          </Button>,
        ]}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="notification-title">Tiêu đề</Label>
              <span className="text-xs text-muted-foreground">{form.title.length}/{TITLE_LIMIT}</span>
            </div>
            <Input
              id="notification-title"
              value={form.title}
              maxLength={TITLE_LIMIT}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Ví dụ: Lịch chiếu mới đã mở bán"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notification-type">Loại thông báo</Label>
            <Select value={form.type} onValueChange={(type) => setForm((current) => ({ ...current, type }))}>
              <SelectTrigger id="notification-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="SYSTEM">Hệ thống</SelectItem>
                <SelectItem value="PROMOTION">Khuyến mãi</SelectItem>
                <SelectItem value="BOOKING">Đặt vé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="notification-content">Nội dung</Label>
              <span className="text-xs text-muted-foreground">{form.content.length}/{CONTENT_LIMIT}</span>
            </div>
            <Textarea
              id="notification-content"
              rows={6}
              maxLength={CONTENT_LIMIT}
              value={form.content}
              onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="Nhập nội dung người dùng sẽ nhận được..."
            />
          </div>
        </div>
      </ResponsiveDialog>
    </section>
  );
}

export default AdminNotifications;
