import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Ban, CheckCircle2, Edit, Eye, Home, Loader2, Plus, Search, Trash2, User, Users as UsersIcon } from 'lucide-react';
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
import roleService from '@/services/roleService';
import userService from '@/services/userService';
import { unwrapApiArray, unwrapApiData } from '@/utils/apiResponse';

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_FORM = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  role: '',
  status: 'active',
};

const getRoleValue = (role) => {
  if (!role) return '';
  if (typeof role === 'string') return role;
  return role.code || role.name || role.roleName || '';
};

const getRoleLabel = (role) => {
  const value = getRoleValue(role);
  const normalized = value.toLowerCase();
  if (normalized.includes('admin')) return 'Quản trị viên';
  if (normalized.includes('manager')) return 'Quản lý';
  if (normalized.includes('staff')) return 'Nhân viên';
  if (normalized.includes('moderator')) return 'Kiểm duyệt viên';
  if (normalized.includes('vip')) return 'VIP';
  if (normalized.includes('customer') || normalized.includes('user')) return 'Khách hàng';
  return value || 'Chưa có vai trò';
};

const getRoleTone = (role) => {
  const normalized = getRoleValue(role).toLowerCase();
  if (normalized.includes('admin')) return 'destructive';
  if (normalized.includes('manager') || normalized.includes('staff')) return 'info';
  if (normalized.includes('vip')) return 'warning';
  return 'neutral';
};

const getUserStatus = (user) => user?.isActive === false ? 'inactive' : 'active';

const UserAvatar = ({ user, size = 'md' }) => (
  <Avatar className={size === 'lg' ? 'h-14 w-14' : 'h-9 w-9'}>
    <AvatarImage src={user?.avatarUrl || user?.avatar} alt={user?.fullName || user?.email || 'Người dùng'} />
    <AvatarFallback><User className={size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} /></AvatarFallback>
  </Avatar>
);

const AdminUsers = () => {
  const notification = useNotification();
  const tableRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    let cancelled = false;
    roleService.getAllRolesList()
      .then((response) => {
        if (!cancelled) setRoles(unwrapApiArray(response));
      })
      .catch((error) => {
        console.error('Error loading roles:', error);
        if (!cancelled) {
          setRoles([]);
          notification.error('Không thể tải danh sách vai trò');
        }
      });
    return () => { cancelled = true; };
  }, [notification]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current - 1,
        size: pagination.pageSize,
        sortBy: 'id',
        sortDir: 'desc',
      };
      const response = debouncedSearch
        ? await userService.searchUsers(debouncedSearch, params)
        : await userService.getAllUsers(params);
      const page = unwrapApiData(response) || {};
      const content = Array.isArray(page) ? page : Array.isArray(page.content) ? page.content : [];
      const total = Array.isArray(page) ? page.length : Number(page.totalElements ?? page.total) || content.length;

      setUsers(content);
      setPagination((previous) => ({ ...previous, total }));
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
      setPagination((previous) => ({ ...previous, total: 0 }));
      notification.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const pageStats = useMemo(() => ({
    active: users.filter((user) => getUserStatus(user) === 'active').length,
    inactive: users.filter((user) => getUserStatus(user) === 'inactive').length,
  }), [users]);

  const openCreate = () => {
    setSelectedUser(null);
    setFormValues(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormValues({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      address: user.address || '',
      role: getRoleValue(user.role),
      status: getUserStatus(user),
    });
    setEditorOpen(true);
  };

  const openDetail = (user) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const validateForm = () => {
    if (!formValues.fullName.trim() || !formValues.email.trim() || !formValues.role) {
      notification.error('Vui lòng nhập đầy đủ họ tên, email và vai trò');
      return false;
    }
    if (!selectedUser && formValues.password.length < 6) {
      notification.error('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    return true;
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const payload = {
        fullName: formValues.fullName.trim(),
        email: formValues.email.trim(),
        phone: formValues.phone.trim(),
        address: formValues.address.trim(),
        role: formValues.role,
        isActive: formValues.status === 'active',
      };
      if (!selectedUser) payload.password = formValues.password;

      if (selectedUser) {
        await userService.updateUser(selectedUser.id, payload);
        notification.success('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(payload);
        notification.success('Thêm người dùng thành công');
      }

      setEditorOpen(false);
      setSelectedUser(null);
      setFormValues(EMPTY_FORM);
      await loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      notification.error(error.response?.data?.message || 'Không thể lưu người dùng');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (user) => {
    const activate = getUserStatus(user) !== 'active';
    const actionLabel = activate ? 'kích hoạt' : 'vô hiệu hóa';
    if (!window.confirm(`Bạn có chắc muốn ${actionLabel} người dùng “${user.fullName || user.email}”?`)) return;

    try {
      if (activate) await userService.activateUser(user.id);
      else await userService.deactivateUser(user.id);
      notification.success(`Đã ${actionLabel} người dùng`);
      await loadUsers();
    } catch (error) {
      console.error('Error changing user status:', error);
      notification.error(error.response?.data?.message || 'Không thể thay đổi trạng thái người dùng');
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Xóa người dùng “${user.fullName || user.email}”? Hành động này không thể hoàn tác.`)) return;
    try {
      await userService.deleteUser(user.id);
      notification.success('Xóa người dùng thành công');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      notification.error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  const columns = [
    {
      title: 'Người dùng',
      key: 'user',
      width: 360,
      render: (_, record) => (
        <div className="flex min-w-0 items-center gap-2.5">
          <UserAvatar user={record} />
          <div className="min-w-0">
            <Button type="button" variant="link" className="h-auto max-w-full justify-start p-0 font-semibold" onClick={() => openDetail(record)}>
              <span className="truncate">{record.fullName || 'Chưa có tên'}</span>
            </Button>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{record.email || 'Chưa có email'}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {record.phone || 'Chưa có SĐT'} · ID {record.id}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      key: 'role',
      render: (_, record) => <StatusBadge tone={getRoleTone(record.role)}>{getRoleLabel(record.role)}</StatusBadge>,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => getUserStatus(record) === 'active'
        ? <StatusBadge tone="success" leading={<CheckCircle2 className="h-3 w-3" />}>Hoạt động</StatusBadge>
        : <StatusBadge tone="destructive" leading={<Ban className="h-3 w-3" />}>Không hoạt động</StatusBadge>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-0.5">
          <Button type="button" variant="ghost" size="icon" onClick={() => openDetail(record)} aria-label={`Xem ${record.fullName || record.email}`}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(record)} aria-label={`Sửa ${record.fullName || record.email}`}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={getUserStatus(record) === 'active' ? 'text-destructive hover:text-destructive' : ''}
            onClick={() => handleStatusChange(record)}
            aria-label={getUserStatus(record) === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
          >
            {getUserStatus(record) === 'active' ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
          </Button>
          <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa người dùng">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Quản lý người dùng"
        description="Quản lý tài khoản, vai trò và trạng thái truy cập của người dùng trong HotCinema."
        breadcrumbs={[
          { title: 'Dashboard', icon: <Home className="h-4 w-4" />, href: '/admin/dashboard' },
          { title: 'Quản lý người dùng', icon: <UsersIcon className="h-4 w-4" /> },
        ]}
        actions={(
          <Button type="button" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        )}
      />

      <Card ref={tableRef}>
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-border p-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-md border bg-muted/25 px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Tổng</span>
                <strong className="ml-2 text-sm tabular-nums">{pagination.total.toLocaleString('vi-VN')}</strong>
              </div>
              <div className="rounded-md border bg-muted/25 px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Hoạt động</span>
                <strong className="ml-2 text-sm tabular-nums">{pageStats.active}</strong>
              </div>
              <div className="rounded-md border bg-muted/25 px-3 py-1.5">
                <span className="text-xs text-muted-foreground">Không hoạt động</span>
                <strong className="ml-2 text-sm tabular-nums">{pageStats.inactive}</strong>
              </div>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchText}
                onChange={(event) => {
                  setSearchText(event.target.value);
                  setPagination((previous) => ({ ...previous, current: 1 }));
                }}
                placeholder="Tìm theo họ tên hoặc email..."
                className="pl-9"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm">Đang tải danh sách người dùng...</span>
            </div>
          ) : users.length ? (
            <DataTable fields={columns} rows={users} getRowId="id" framed={false} />
          ) : (
            <Empty description="Không tìm thấy người dùng phù hợp" className="min-h-40" />
          )}

          {!loading && users.length > 0 && (
            <div className="border-t border-border p-3">
              <Pagination
                page={pagination.current}
                itemsPerPage={pagination.pageSize}
                totalItems={pagination.total}
                showSizeChanger
                showQuickJumper
                pageSizeOptions={[10, 20, 50]}
                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} người dùng`}
                onPageChange={(page) => {
                  setPagination((previous) => ({ ...previous, current: page }));
                  tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                onPageSizeChange={(size) => setPagination((previous) => ({ ...previous, current: 1, pageSize: size }))}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
        description={selectedUser ? 'Cập nhật thông tin tài khoản và vai trò.' : 'Tạo một tài khoản mới trong hệ thống.'}
        open={editorOpen}
        onClose={() => { setEditorOpen(false); setSelectedUser(null); setFormValues(EMPTY_FORM); }}
        actions={null}
        maxWidth={640}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="user-full-name" className="text-sm font-medium">Họ và tên <span className="text-destructive">*</span></label>
              <Input id="user-full-name" value={formValues.fullName} onChange={(event) => setFormValues((previous) => ({ ...previous, fullName: event.target.value }))} required />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="user-email" className="text-sm font-medium">Email <span className="text-destructive">*</span></label>
              <Input id="user-email" type="email" value={formValues.email} onChange={(event) => setFormValues((previous) => ({ ...previous, email: event.target.value }))} required />
            </div>
          </div>

          {!selectedUser && (
            <div className="space-y-1.5">
              <label htmlFor="user-password" className="text-sm font-medium">Mật khẩu <span className="text-destructive">*</span></label>
              <Input id="user-password" type="password" minLength={6} autoComplete="new-password" value={formValues.password} onChange={(event) => setFormValues((previous) => ({ ...previous, password: event.target.value }))} required />
              <p className="text-xs text-muted-foreground">Tối thiểu 6 ký tự.</p>
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="user-phone" className="text-sm font-medium">Số điện thoại</label>
              <Input id="user-phone" value={formValues.phone} onChange={(event) => setFormValues((previous) => ({ ...previous, phone: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Vai trò <span className="text-destructive">*</span></label>
              <Select value={formValues.role} onValueChange={(value) => setFormValues((previous) => ({ ...previous, role: value }))}>
                <SelectTrigger><SelectValue placeholder="Chọn vai trò" /></SelectTrigger>
                <SelectContent>
                  {roles.map((role) => {
                    const value = getRoleValue(role);
                    return value ? <SelectItem key={role.id ?? value} value={value}>{role.name || value}</SelectItem> : null;
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
            <div className="space-y-1.5">
              <label htmlFor="user-address" className="text-sm font-medium">Địa chỉ</label>
              <Input id="user-address" value={formValues.address} onChange={(event) => setFormValues((previous) => ({ ...previous, address: event.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Trạng thái</label>
              <Select value={formValues.status} onValueChange={(value) => setFormValues((previous) => ({ ...previous, status: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="outline" onClick={() => setEditorOpen(false)}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedUser ? 'Lưu thay đổi' : 'Thêm người dùng'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết người dùng"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedUser(null); }}
        actions={null}
        maxWidth={640}
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <UserAvatar user={selectedUser} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{selectedUser.fullName || 'Chưa có tên'}</p>
                <p className="truncate text-sm text-muted-foreground">{selectedUser.email}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <StatusBadge tone={getRoleTone(selectedUser.role)}>{getRoleLabel(selectedUser.role)}</StatusBadge>
                  {getUserStatus(selectedUser) === 'active'
                    ? <StatusBadge tone="success">Hoạt động</StatusBadge>
                    : <StatusBadge tone="destructive">Không hoạt động</StatusBadge>}
                </div>
              </div>
            </div>

            <DetailList columns={2}>
              <DetailItem label="ID">{selectedUser.id}</DetailItem>
              <DetailItem label="Số điện thoại">{selectedUser.phone || 'Chưa cập nhật'}</DetailItem>
              <DetailItem label="Địa chỉ" wide>{selectedUser.address || 'Chưa cập nhật'}</DetailItem>
              <DetailItem label="Điểm thành viên">{selectedUser.loyaltyPoints ?? '—'}</DetailItem>
              <DetailItem label="Hạng thành viên">{selectedUser.membershipTier || '—'}</DetailItem>
            </DetailList>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
              <Button type="button" onClick={() => { setDetailOpen(false); openEdit(selectedUser); }}>
                <Edit className="h-4 w-4" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default AdminUsers;