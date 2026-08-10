import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Edit, Eye, Loader2, Plus, Trash2, UserRoundCog, Users } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import userService from '@/services/userService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_FORM = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  address: '',
  dateOfBirth: '',
  role: 'staff',
  isActive: true,
};

const normalizeRole = (role) => String(role || 'staff').replace(/^ROLE_/i, '').toLowerCase();

const roleMeta = (role) => {
  const normalized = normalizeRole(role);
  if (normalized === 'admin') return { label: 'Quản trị viên', tone: 'destructive' };
  if (normalized === 'manager') return { label: 'Quản lý', tone: 'warning' };
  return { label: 'Nhân viên', tone: 'info' };
};

const formatDate = (value) => {
  if (!value) return 'Chưa có';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${String(value.day).padStart(2, '0')}/${String(value.month).padStart(2, '0')}/${value.year}`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const formatDateForInput = (value) => {
  if (!value) return '';
  if (typeof value === 'object' && value.year && value.month && value.day) {
    return `${value.year}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
  }
  return String(value).split('T')[0];
};

const extractStaffPage = (response) => {
  const payload = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(payload)) {
    return { content: payload, totalElements: payload.length };
  }
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return {
    content,
    totalElements: Number(payload?.totalElements ?? payload?.total ?? content.length),
  };
};

const mapStaff = (user) => {
  const fullName = user?.fullName || user?.name || 'N/A';
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || 'ST';

  return {
    ...user,
    name: fullName,
    avatarUrl: user?.avatarUrl || user?.avatar || '',
    initials,
    role: normalizeRole(user?.role),
    isActive: user?.isActive !== false,
  };
};

const Staff = () => {
  const notification = useNotification();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_FORM);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadStaff = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userService.getAllStaff({
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
      const page = extractStaffPage(response);
      setStaff(page.content.map(mapStaff));
      setPagination((current) => ({ ...current, total: page.totalElements }));
    } catch (error) {
      console.error('Error loading staff:', error);
      setStaff([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const activeOnPage = useMemo(() => staff.filter((item) => item.isActive).length, [staff]);

  const openCreate = () => {
    setSelectedStaff(null);
    setFormValues(DEFAULT_FORM);
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setSelectedStaff(record);
    setFormValues({
      fullName: record.name || '',
      email: record.email || '',
      password: '',
      phone: record.phone || '',
      address: record.address || '',
      dateOfBirth: formatDateForInput(record.dateOfBirth),
      role: normalizeRole(record.role),
      isActive: record.isActive !== false,
    });
    setFormOpen(true);
  };

  const openDetail = (record) => {
    setSelectedStaff(record);
    setDetailOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedStaff(null);
    setFormValues(DEFAULT_FORM);
  };

  const validateForm = () => {
    if (!formValues.fullName.trim()) return 'Vui lòng nhập họ tên';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email.trim())) return 'Email không hợp lệ';
    if (!selectedStaff && formValues.password.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      fullName: formValues.fullName.trim(),
      email: formValues.email.trim(),
      phone: formValues.phone.trim(),
      address: formValues.address.trim(),
      dateOfBirth: formValues.dateOfBirth || null,
      role: formValues.role,
      isActive: formValues.isActive,
    };

    try {
      setSaving(true);
      if (selectedStaff) {
        await userService.updateUser(selectedStaff.id, payload);
        notification.success('Đã cập nhật nhân viên');
      } else {
        await userService.createUser({ ...payload, password: formValues.password });
        notification.success('Đã thêm nhân viên mới');
      }
      closeForm();
      await loadStaff();
    } catch (error) {
      console.error('Error saving staff:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu thông tin nhân viên');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (record) => {
    try {
      if (record.isActive) {
        await userService.deactivateUser(record.id);
        notification.success(`Đã vô hiệu hóa ${record.name}`);
      } else {
        await userService.activateUser(record.id);
        notification.success(`Đã kích hoạt ${record.name}`);
      }
      await loadStaff();
    } catch (error) {
      console.error('Error updating staff status:', error);
      notification.error('Không thể thay đổi trạng thái nhân viên');
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Xóa nhân viên ${record.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      await userService.deleteUser(record.id);
      notification.success(`Đã xóa ${record.name}`);
      const lastItemOnPage = staff.length === 1 && pagination.current > 1;
      if (lastItemOnPage) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadStaff();
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa nhân viên');
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={record.avatarUrl} alt={record.name} />
            <AvatarFallback>{record.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <button type="button" onClick={() => openDetail(record)} className="block max-w-full truncate text-left font-medium text-foreground hover:text-primary">
              {record.name}
            </button>
            <p className="truncate text-xs text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const meta = roleMeta(role);
        return <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => (
        <StatusBadge tone={record.isActive ? 'success' : 'neutral'}>
          {record.isActive ? 'Hoạt động' : 'Không hoạt động'}
        </StatusBadge>
      ),
    },
    {
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (value) => <span className="text-sm text-muted-foreground">{formatDate(value)}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDetail(record)} aria-label="Xem chi tiết nhân viên">
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiết</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(record)} aria-label="Chỉnh sửa nhân viên">
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleStatusChange(record)} aria-label={record.isActive ? 'Vô hiệu hóa nhân viên' : 'Kích hoạt nhân viên'}>
                  <CheckCircle2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{record.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(record)} aria-label="Xóa nhân viên">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý nhân viên"
        description="Quản lý tài khoản nhân viên, vai trò và trạng thái truy cập hệ thống."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Nhân viên' },
        ]}
        actions={(
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Thêm nhân viên
          </Button>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Tổng nhân viên</p>
              <p className="mt-1 text-2xl font-semibold">{pagination.total}</p>
            </div>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Đang hoạt động trên trang</p>
              <p className="mt-1 text-2xl font-semibold">{activeOnPage}</p>
            </div>
            <UserRoundCog className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Danh sách nhân viên</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải nhân viên...
            </div>
          ) : staff.length === 0 ? (
            <Empty description="Chưa có nhân viên nào" />
          ) : (
            <DataTable fields={columns} rows={staff} getRowId="id" pageControls={false} />
          )}

          {pagination.total > 0 && (
            <Pagination
              className="mt-5 border-t pt-5"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} nhân viên`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
        description="Thông tin này được sử dụng cho tài khoản nhân viên trong hệ thống."
        open={formOpen}
        onClose={closeForm}
        maxWidth={680}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Họ và tên <span className="text-destructive">*</span></span>
              <Input value={formValues.fullName} onChange={(event) => setFormValues((current) => ({ ...current, fullName: event.target.value }))} placeholder="Nguyễn Văn A" required />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Email <span className="text-destructive">*</span></span>
              <Input type="email" value={formValues.email} onChange={(event) => setFormValues((current) => ({ ...current, email: event.target.value }))} placeholder="staff@hotcinema.vn" required />
            </label>
          </div>

          {!selectedStaff && (
            <label className="block space-y-2 text-sm font-medium">
              <span>Mật khẩu <span className="text-destructive">*</span></span>
              <InputPassword value={formValues.password} onChange={(event) => setFormValues((current) => ({ ...current, password: event.target.value }))} placeholder="Tối thiểu 6 ký tự" required minLength={6} />
            </label>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Số điện thoại</span>
              <Input value={formValues.phone} onChange={(event) => setFormValues((current) => ({ ...current, phone: event.target.value }))} placeholder="0901234567" />
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Ngày sinh</span>
              <Input type="date" value={formValues.dateOfBirth} onChange={(event) => setFormValues((current) => ({ ...current, dateOfBirth: event.target.value }))} />
            </label>
          </div>

          <label className="block space-y-2 text-sm font-medium">
            <span>Địa chỉ</span>
            <Textarea value={formValues.address} onChange={(event) => setFormValues((current) => ({ ...current, address: event.target.value }))} placeholder="Nhập địa chỉ" rows={3} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium">
              <span>Vai trò</span>
              <Select value={formValues.role} onValueChange={(value) => setFormValues((current) => ({ ...current, role: value }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="manager">Quản lý</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <label className="space-y-2 text-sm font-medium">
              <span>Trạng thái</span>
              <Select value={formValues.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormValues((current) => ({ ...current, isActive: value === 'active' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoạt động</SelectItem>
                  <SelectItem value="inactive">Không hoạt động</SelectItem>
                </SelectContent>
              </Select>
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedStaff ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết nhân viên"
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth={620}
        actions={selectedStaff ? [
          <Button key="close" variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>,
          <Button key="edit" onClick={() => { setDetailOpen(false); openEdit(selectedStaff); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedStaff && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={selectedStaff.avatarUrl} alt={selectedStaff.name} />
                <AvatarFallback>{selectedStaff.initials}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{selectedStaff.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedStaff.email}</p>
              </div>
            </div>
            <DetailList columns={2}>
              <DetailItem label="Vai trò"><StatusBadge tone={roleMeta(selectedStaff.role).tone}>{roleMeta(selectedStaff.role).label}</StatusBadge></DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={selectedStaff.isActive ? 'success' : 'neutral'}>{selectedStaff.isActive ? 'Hoạt động' : 'Không hoạt động'}</StatusBadge></DetailItem>
              <DetailItem label="Số điện thoại">{selectedStaff.phone || 'Chưa có'}</DetailItem>
              <DetailItem label="Ngày sinh">{formatDate(selectedStaff.dateOfBirth)}</DetailItem>
              <DetailItem label="Đăng nhập cuối">{formatDate(selectedStaff.lastLogin)}</DetailItem>
              <DetailItem label="Ngày tạo">{formatDate(selectedStaff.createdAt)}</DetailItem>
              <DetailItem label="Địa chỉ" wide>{selectedStaff.address || 'Chưa có'}</DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Staff;
