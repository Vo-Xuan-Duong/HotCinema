import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Edit, Eye, Home, Loader2, LockKeyhole, Search, Trash2, User, Users as UsersIcon } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import useNotification from '@/hooks/useNotification';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import userService from '@/services/userService';
import { unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  gender: 'OTHER',
  avatarUrl: '',
  status: 'ACTIVE',
};

const normalizeStatus = (value) => {
  const status = String(value || 'ACTIVE').toUpperCase();
  return ['ACTIVE', 'LOCKED', 'DISABLED'].includes(status) ? status : 'ACTIVE';
};

const statusMeta = (status) => {
  const normalized = normalizeStatus(status);
  if (normalized === 'LOCKED') return { label: 'Đã khóa', tone: 'warning', icon: LockKeyhole };
  if (normalized === 'DISABLED') return { label: 'Vô hiệu hóa', tone: 'destructive', icon: Ban };
  return { label: 'Hoạt động', tone: 'success', icon: CheckCircle2 };
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const formatDateForInput = (value) => value ? String(value).slice(0, 10) : '';

const UserAvatar = ({ user, size = 'md' }) => (
  <Avatar className={size === 'lg' ? 'h-14 w-14' : 'h-9 w-9'}>
    <AvatarImage src={user?.avatarUrl} alt={user?.fullName || user?.email || 'Người dùng'} />
    <AvatarFallback><User className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} /></AvatarFallback>
  </Avatar>
);

const AdminUsers = () => {
  const notification = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0 });
  const [editorOpen, setEditorOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(searchText.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
      };
      const response = debouncedSearch
        ? await userService.searchUsers(debouncedSearch, params)
        : await userService.getAllUsers(params);
      const page = unwrapApiData(response) || {};
      const content = Array.isArray(page) ? page : Array.isArray(page.content) ? page.content : [];
      const total = Array.isArray(page) ? page.length : Number(page.totalElements ?? page.total ?? content.length);

      setUsers(content);
      setPagination((previous) => ({ ...previous, total }));
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setPagination((previous) => ({ ...previous, total: 0 }));
      notification.error(error?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const pageStats = useMemo(() => ({
    active: users.filter((user) => normalizeStatus(user.status) === 'ACTIVE').length,
    locked: users.filter((user) => normalizeStatus(user.status) === 'LOCKED').length,
    disabled: users.filter((user) => normalizeStatus(user.status) === 'DISABLED').length,
  }), [users]);

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormValues({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: formatDateForInput(user.dateOfBirth),
      gender: String(user.gender || 'OTHER').toUpperCase(),
      avatarUrl: user.avatarUrl || '',
      status: normalizeStatus(user.status),
    });
    setEditorOpen(true);
  };

  const openDetail = (user) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const validateForm = () => {
    if (!formValues.fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) return 'Email không hợp lệ';
    if (!formValues.phone.trim()) return 'Vui lòng nhập số điện thoại';
    if (!formValues.dateOfBirth) return 'Backend yêu cầu ngày sinh để cập nhật user';
    if (!['MALE', 'FEMALE', 'OTHER'].includes(formValues.gender)) return 'Giới tính không hợp lệ';
    if (!formValues.avatarUrl.trim()) return 'Backend yêu cầu avatarUrl để cập nhật user';
    return null;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    setSaving(true);
    try {
      await userService.updateUser(selectedUser.id, {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        dateOfBirth: formValues.dateOfBirth,
        gender: formValues.gender,
        avatarUrl: formValues.avatarUrl.trim(),
        status: formValues.status,
      });
      notification.success('Cập nhật người dùng thành công');
      setEditorOpen(false);
      setSelectedUser(null);
      setFormValues(EMPTY_FORM);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (user) => {
    const current = normalizeStatus(user.status);
    const next = current === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    const label = next === 'ACTIVE' ? 'kích hoạt' : 'vô hiệu hóa';
    if (!window.confirm(`Bạn có chắc muốn ${label} người dùng “${user.fullName || user.email}”?`)) return;

    setBusyId(user.id);
    try {
      if (next === 'ACTIVE') await userService.activateUser(user.id);
      else await userService.deactivateUser(user.id);
      notification.success(`Đã ${label} người dùng`);
      await loadUsers();
    } catch (error) {
      console.error('Error changing user status:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể thay đổi trạng thái người dùng');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa mềm người dùng “${user.fullName || user.email}”? Các quan hệ lịch sử có thể vẫn được backend giữ lại.`)) return;
    setBusyId(user.id);
    try {
      await userService.deleteUser(user.id);
      notification.success('Đã xóa người dùng');
      if (users.length === 1 && pagination.current > 1) {
        setPagination((previous) => ({ ...previous, current: previous.current - 1 }));
      } else {
        await loadUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa người dùng');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div className="flex min-w-[280px] items-center gap-2.5">
          <UserAvatar user={record} />
          <div className="min-w-0">
            <button type="button" className="block max-w-full truncate text-left font-semibold hover:text-primary" onClick={() => openDetail(record)}>{record.fullName || 'Chưa có tên'}</button>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.email || 'Chưa có email'}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.phone || 'Chưa có SĐT'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Xác minh',
      key: 'verification',
      render: (_, record) => (
        <div className="flex flex-wrap gap-1.5">
          <StatusBadge tone={record.emailVerified ? 'success' : 'neutral'}>Email {record.emailVerified ? '✓' : '—'}</StatusBadge>
          <StatusBadge tone={record.phoneVerified ? 'success' : 'neutral'}>SĐT {record.phoneVerified ? '✓' : '—'}</StatusBadge>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const meta = statusMeta(record.status);
        const Icon = meta.icon;
        return <StatusBadge tone={meta.tone} leading={<Icon className="h-3 w-3" />}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLoginAt',
      key: 'lastLoginAt',
      render: (value) => <span className="text-sm text-muted-foreground">{formatDateTime(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const busy = busyId === record.id;
        const active = normalizeStatus(record.status) === 'ACTIVE';
        return (
          <div className="flex items-center gap-0.5">
            <Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => openDetail(record)} aria-label="Xem người dùng"><Eye className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" disabled={busy} onClick={() => openEdit(record)} aria-label="Sửa người dùng"><Edit className="h-4 w-4" /></Button>
            <Button type="button" variant="ghost" size="icon" disabled={busy} className={active ? 'text-destructive hover:text-destructive' : ''} onClick={() => handleStatusChange(record)} aria-label={active ? 'Vô hiệu hóa' : 'Kích hoạt'}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : active ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
            </Button>
            <Button type="button" variant="ghost" size="icon" disabled={busy} className="text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa người dùng"><Trash2 className="h-4 w-4" /></Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý hồ sơ và trạng thái User theo contract backend hiện tại."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý người dùng', icon: <UsersIcon className="h-4 w-4" /> },
        ]}
      />

      <Alert
        type="info"
        showIcon
        message="Tạo user và đổi role đang bị khóa ở FE"
        description="Generic User CRUD của backend không hash password và UserResponse không chứa roles. FE không gửi password/role vào endpoint này để tránh tạo tài khoản không đăng nhập được hoặc giả lập phân quyền."
      />

      <Card>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border bg-muted/25 px-3 py-1.5"><span className="text-xs text-muted-foreground">Tổng</span><strong className="ml-2 text-sm tabular-nums">{pagination.total.toLocaleString('vi-VN')}</strong></div>
              <div className="rounded-md border bg-muted/25 px-3 py-1.5"><span className="text-xs text-muted-foreground">Hoạt động</span><strong className="ml-2 text-sm tabular-nums">{pageStats.active}</strong></div>
              <div className="rounded-md border bg-muted/25 px-3 py-1.5"><span className="text-xs text-muted-foreground">Đã khóa</span><strong className="ml-2 text-sm tabular-nums">{pageStats.locked}</strong></div>
              <div className="rounded-md border bg-muted/25 px-3 py-1.5"><span className="text-xs text-muted-foreground">Vô hiệu hóa</span><strong className="ml-2 text-sm tabular-nums">{pageStats.disabled}</strong></div>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={searchText} onChange={(event) => { setSearchText(event.target.value); setPagination((previous) => ({ ...previous, current: 1 })); }} placeholder="Tìm theo họ tên, email hoặc SĐT..." className="pl-9" />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-primary" /><span className="text-sm">Đang tải danh sách người dùng...</span></div>
          ) : users.length ? (
            <DataTable fields={columns} rows={users} getRowId="id" framed={false} pageControls={false} />
          ) : (
            <Empty description="Không tìm thấy người dùng phù hợp" className="min-h-48" />
          )}

          {pagination.total > 0 && (
            <Pagination
              className="border-t p-3"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((previous) => ({ ...previous, current: page }))}
              onPageSizeChange={(size) => setPagination((previous) => ({ ...previous, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} người dùng`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading="Chỉnh sửa người dùng"
        description="Chỉ cập nhật các field UserUpdateRequest; verification và lastLogin được bảo toàn từ server."
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setSelectedUser(null); setFormValues(EMPTY_FORM); }}
        maxWidth={700}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Họ tên *</span><Input value={formValues.fullName} onChange={(event) => setFormValues((current) => ({ ...current, fullName: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Email *</span><Input type="email" value={formValues.email} onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))} required /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Số điện thoại *</span><Input value={formValues.phone} onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Ngày sinh *</span><Input type="date" value={formValues.dateOfBirth} onChange={(event) => setFormValues((current) => ({ ...current, dateOfBirth: event.target.value }))} required /></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Giới tính *</span><Select value={formValues.gender} onValueChange={(value) => setFormValues((current) => ({ ...current, gender: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MALE">Nam</SelectItem><SelectItem value="FEMALE">Nữ</SelectItem><SelectItem value="OTHER">Khác</SelectItem></SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Trạng thái *</span><Select value={formValues.status} onValueChange={(value) => setFormValues((current) => ({ ...current, status: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVE">Hoạt động</SelectItem><SelectItem value="LOCKED">Đã khóa</SelectItem><SelectItem value="DISABLED">Vô hiệu hóa</SelectItem></SelectContent></Select></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Avatar URL *</span><Input value={formValues.avatarUrl} onChange={(event) => setFormValues((current) => ({ ...current, avatarUrl: event.target.value }))} placeholder="https://..." required /></label>
          {formValues.avatarUrl && <img src={formValues.avatarUrl} alt="Avatar preview" className="h-20 w-20 rounded-full border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />}

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => { setEditorOpen(false); setSelectedUser(null); }}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Lưu thay đổi</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết người dùng"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedUser(null); }}
        maxWidth={700}
        actions={selectedUser ? [
          <Button key="close" variant="outline" onClick={() => { setDetailOpen(false); setSelectedUser(null); }}>Đóng</Button>,
          <Button key="edit" onClick={() => { const user = selectedUser; setDetailOpen(false); openEdit(user); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedUser && (
          <div className="space-y-5">
            <div className="flex items-center gap-4"><UserAvatar user={selectedUser} size="lg" /><div><h3 className="font-semibold">{selectedUser.fullName || 'Chưa có tên'}</h3><p className="text-sm text-muted-foreground">{selectedUser.email}</p></div></div>
            <DetailList columns={2}>
              <DetailItem label="ID">{selectedUser.id}</DetailItem>
              <DetailItem label="Trạng thái">{statusMeta(selectedUser.status).label}</DetailItem>
              <DetailItem label="Số điện thoại">{selectedUser.phone || '—'}</DetailItem>
              <DetailItem label="Ngày sinh">{formatDate(selectedUser.dateOfBirth)}</DetailItem>
              <DetailItem label="Giới tính">{selectedUser.gender || '—'}</DetailItem>
              <DetailItem label="Email xác minh">{selectedUser.emailVerified ? 'Đã xác minh' : 'Chưa xác minh'}</DetailItem>
              <DetailItem label="SĐT xác minh">{selectedUser.phoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}</DetailItem>
              <DetailItem label="Đăng nhập cuối">{formatDateTime(selectedUser.lastLoginAt)}</DetailItem>
              <DetailItem label="Tạo lúc">{formatDateTime(selectedUser.createdAt)}</DetailItem>
              <DetailItem label="Cập nhật lúc">{formatDateTime(selectedUser.updatedAt)}</DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default AdminUsers;
