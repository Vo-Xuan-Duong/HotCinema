import { useCallback, useEffect, useMemo, useState } from 'react';
import { BriefcaseBusiness, Edit, Eye, Loader2, Plus, Store, Trash2, UserRoundCog, Users } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import cinemaService from '@/services/cinemaService';
import employeeCinemaService from '@/services/employeeCinemaService';
import userService from '@/services/userService';
import useNotification from '@/hooks/useNotification';
import { sameResourceId } from '@/utils/resourceId';

const EMPTY_FORM = {
  userId: '',
  cinemaId: '',
  position: 'STAFF',
  isActive: true,
  assignedAt: '',
  endedAt: '',
};

const extractRows = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
};

const toLocalDateTimeInput = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

const toIsoDateTime = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};

const initialsFor = (name) => String(name || 'NV')
  .trim()
  .split(/\s+/)
  .filter(Boolean)
  .slice(-2)
  .map((part) => part[0])
  .join('')
  .toUpperCase() || 'NV';

const Staff = () => {
  const notification = useNotification();
  const [users, setUsers] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [formValues, setFormValues] = useState(EMPTY_FORM);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      setMetadataLoading(true);
      try {
        const [userPage, cinemaRows] = await Promise.all([
          userService.getAllUsers({ page: 0, size: 500 }),
          cinemaService.getAllCinemasNoPagination(),
        ]);
        if (cancelled) return;

        const userRows = extractRows(userPage)
          .filter((user) => String(user.status || 'ACTIVE').toUpperCase() !== 'DISABLED')
          .sort((left, right) => String(left.fullName || left.email || '').localeCompare(String(right.fullName || right.email || ''), 'vi'));
        const activeCinemas = (Array.isArray(cinemaRows) ? cinemaRows : [])
          .filter((cinema) => String(cinema.status || 'ACTIVE').toUpperCase() !== 'INACTIVE');

        setUsers(userRows);
        setCinemas(activeCinemas);
      } catch (error) {
        if (cancelled) return;
        setUsers([]);
        setCinemas([]);
        notification.error(error?.message || 'Không thể tải user và rạp để phân công nhân viên');
      } finally {
        if (!cancelled) setMetadataLoading(false);
      }
    };

    loadMetadata();
    return () => { cancelled = true; };
  }, [notification]);

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await employeeCinemaService.listPage({
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
      const rows = extractRows(response);
      setAssignments(rows);
      setPagination((current) => ({
        ...current,
        total: Number(response?.totalElements ?? rows.length),
      }));
    } catch (error) {
      console.error('Error loading employee cinema assignments:', error);
      setAssignments([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error(error?.message || 'Không thể tải danh sách phân công nhân viên');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const userById = useMemo(
    () => new Map(users.map((user) => [String(user.id), user])),
    [users],
  );
  const cinemaById = useMemo(
    () => new Map(cinemas.map((cinema) => [String(cinema.id), cinema])),
    [cinemas],
  );

  const rows = useMemo(() => assignments.map((assignment) => {
    const user = userById.get(String(assignment.userId)) || {};
    const cinema = cinemaById.get(String(assignment.cinemaId)) || {};
    return {
      ...assignment,
      user,
      cinema,
      name: user.fullName || user.email || 'User chưa tải được',
      email: user.email || '—',
      phone: user.phone || '—',
      avatarUrl: user.avatarUrl || '',
      userStatus: String(user.status || '').toUpperCase(),
      cinemaName: cinema.name || 'Rạp chưa tải được',
    };
  }), [assignments, cinemaById, userById]);

  const stats = useMemo(() => ({
    active: rows.filter((item) => item.isActive).length,
    managers: rows.filter((item) => item.position === 'MANAGER').length,
    cinemas: new Set(rows.map((item) => String(item.cinemaId))).size,
  }), [rows]);

  const openCreate = () => {
    if (users.length === 0 || cinemas.length === 0) {
      notification.warning('Cần có ít nhất một user và một rạp hoạt động để tạo phân công.');
      return;
    }
    setSelectedAssignment(null);
    setFormValues({
      ...EMPTY_FORM,
      cinemaId: String(cinemas[0]?.id || ''),
      assignedAt: toLocalDateTimeInput(new Date()),
    });
    setFormOpen(true);
  };

  const openEdit = (record) => {
    setSelectedAssignment(record);
    setFormValues({
      userId: String(record.userId || ''),
      cinemaId: String(record.cinemaId || ''),
      position: record.position || 'STAFF',
      isActive: Boolean(record.isActive),
      assignedAt: toLocalDateTimeInput(record.assignedAt),
      endedAt: toLocalDateTimeInput(record.endedAt),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setSelectedAssignment(null);
    setFormValues(EMPTY_FORM);
  };

  const validateForm = () => {
    if (!formValues.userId) return 'Vui lòng chọn user';
    if (!formValues.cinemaId) return 'Vui lòng chọn rạp';
    if (!['STAFF', 'MANAGER'].includes(formValues.position)) return 'Vị trí nhân viên không hợp lệ';
    if (!formValues.assignedAt) return 'Vui lòng nhập thời điểm bắt đầu';
    if (!formValues.endedAt) return 'Backend yêu cầu thời điểm kết thúc phân công';

    const assignedAt = new Date(formValues.assignedAt);
    const endedAt = new Date(formValues.endedAt);
    if (Number.isNaN(assignedAt.getTime()) || Number.isNaN(endedAt.getTime())) return 'Thời gian phân công không hợp lệ';
    if (endedAt <= assignedAt) return 'Thời điểm kết thúc phải sau thời điểm bắt đầu';
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
      userId: formValues.userId,
      cinemaId: formValues.cinemaId,
      position: formValues.position,
      isActive: formValues.isActive,
      assignedAt: toIsoDateTime(formValues.assignedAt),
      endedAt: toIsoDateTime(formValues.endedAt),
    };

    setSaving(true);
    try {
      if (selectedAssignment) {
        await employeeCinemaService.update(selectedAssignment.id, payload);
        notification.success('Đã cập nhật phân công nhân viên');
      } else {
        await employeeCinemaService.create(payload);
        notification.success('Đã phân công user vào rạp');
      }
      closeForm();
      await loadAssignments();
    } catch (error) {
      console.error('Error saving employee assignment:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu phân công nhân viên');
    } finally {
      setSaving(false);
    }
  };

  const toggleAssignment = async (record) => {
    setBusyId(record.id);
    try {
      await employeeCinemaService.setActive(record, !record.isActive);
      notification.success(record.isActive ? 'Đã tạm dừng phân công' : 'Đã kích hoạt lại phân công');
      await loadAssignments();
    } catch (error) {
      console.error('Error updating assignment status:', error);
      notification.error(error?.message || 'Không thể thay đổi trạng thái phân công');
    } finally {
      setBusyId(null);
    }
  };

  const deleteAssignment = async (record) => {
    if (!window.confirm(`Xóa phân công của ${record.name} tại ${record.cinemaName}? Tài khoản user sẽ không bị xóa.`)) return;
    setBusyId(record.id);
    try {
      await employeeCinemaService.delete(record.id);
      notification.success('Đã xóa phân công; tài khoản user vẫn được giữ nguyên');
      if (rows.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa phân công');
    } finally {
      setBusyId(null);
    }
  };

  const columns = [
    {
      title: 'Nhân viên',
      key: 'staff',
      render: (_, record) => (
        <div className="flex min-w-[230px] items-center gap-3">
          <Avatar className="h-10 w-10"><AvatarImage src={record.avatarUrl} alt={record.name} /><AvatarFallback>{initialsFor(record.name)}</AvatarFallback></Avatar>
          <div className="min-w-0">
            <button type="button" onClick={() => { setSelectedAssignment(record); setDetailOpen(true); }} className="block max-w-full truncate text-left font-medium hover:text-primary">{record.name}</button>
            <p className="truncate text-xs text-muted-foreground">{record.email}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Rạp',
      key: 'cinema',
      render: (_, record) => <div className="min-w-[180px]"><p className="font-medium">{record.cinemaName}</p><p className="text-xs text-muted-foreground">{record.cinema?.city || record.cinema?.address || '—'}</p></div>,
    },
    {
      title: 'Vị trí',
      dataIndex: 'position',
      key: 'position',
      render: (position) => <StatusBadge tone={position === 'MANAGER' ? 'warning' : 'info'}>{position === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}</StatusBadge>,
    },
    {
      title: 'Phân công',
      key: 'assignmentStatus',
      render: (_, record) => <StatusBadge tone={record.isActive ? 'success' : 'neutral'}>{record.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</StatusBadge>,
    },
    {
      title: 'Thời hạn',
      key: 'period',
      render: (_, record) => <div className="min-w-[180px] text-xs text-muted-foreground"><p>{formatDateTime(record.assignedAt)}</p><p>→ {formatDateTime(record.endedAt)}</p></div>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => {
        const busy = busyId === record.id;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => { setSelectedAssignment(record); setDetailOpen(true); }} aria-label="Xem phân công"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => openEdit(record)} aria-label="Sửa phân công"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => toggleAssignment(record)} aria-label="Đổi trạng thái phân công">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BriefcaseBusiness className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>{record.isActive ? 'Tạm dừng phân công' : 'Kích hoạt phân công'}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => deleteAssignment(record)} aria-label="Xóa phân công"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa phân công, giữ user</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Quản lý nhân viên"
        description="Quản lý phân công user vào từng rạp theo EmployeeCinema."
        breadcrumbs={[{ title: 'Dashboard', href: '/admin/dashboard' }, { title: 'Nhân viên' }]}
        actions={<Button onClick={openCreate} disabled={metadataLoading || users.length === 0 || cinemas.length === 0}><Plus className="h-4 w-4" />Phân công nhân viên</Button>}
      />

      <Alert
        type="info"
        showIcon
        message="Phân công rạp không đồng nghĩa cấp quyền đăng nhập"
        description="Màn hình này chỉ quản lý EmployeeCinema. Role/JWT authorization phải được backend cung cấp bằng command phân quyền riêng; FE không tự ghi role vào User CRUD."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Tổng phân công</p><p className="mt-1 text-2xl font-semibold">{pagination.total}</p></div><Users className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Đang hoạt động trên trang</p><p className="mt-1 text-2xl font-semibold">{stats.active}</p></div><UserRoundCog className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Rạp có nhân sự trên trang</p><p className="mt-1 text-2xl font-semibold">{stats.cinemas}</p></div><Store className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách phân công</CardTitle></CardHeader>
        <CardContent>
          {loading || metadataLoading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải phân công...</div>
          ) : rows.length === 0 ? (
            <Empty description="Chưa có phân công nhân viên nào" />
          ) : (
            <DataTable fields={columns} rows={rows} getRowId="id" pageControls={false} />
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
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} phân công`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedAssignment ? 'Chỉnh sửa phân công' : 'Phân công nhân viên'}
        description="Chọn user đã tồn tại và gán user đó vào một rạp."
        open={formOpen}
        onClose={closeForm}
        maxWidth={680}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block space-y-2 text-sm font-medium">
            <span>User *</span>
            <Select value={formValues.userId} onValueChange={(value) => setFormValues((current) => ({ ...current, userId: value }))}>
              <SelectTrigger><SelectValue placeholder="Chọn user" /></SelectTrigger>
              <SelectContent>{users.map((user) => <SelectItem key={user.id} value={String(user.id)}>{user.fullName || user.email} · {user.email}</SelectItem>)}</SelectContent>
            </Select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Rạp *</span><Select value={formValues.cinemaId} onValueChange={(value) => setFormValues((current) => ({ ...current, cinemaId: value }))}><SelectTrigger><SelectValue placeholder="Chọn rạp" /></SelectTrigger><SelectContent>{cinemas.map((cinema) => <SelectItem key={cinema.id} value={String(cinema.id)}>{cinema.name}{cinema.city ? ` · ${cinema.city}` : ''}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium"><span>Vị trí *</span><Select value={formValues.position} onValueChange={(value) => setFormValues((current) => ({ ...current, position: value }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="STAFF">Nhân viên</SelectItem><SelectItem value="MANAGER">Quản lý</SelectItem></SelectContent></Select></label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-sm font-medium"><span>Bắt đầu *</span><Input type="datetime-local" value={formValues.assignedAt} onChange={(event) => setFormValues((current) => ({ ...current, assignedAt: event.target.value }))} required /></label>
            <label className="space-y-2 text-sm font-medium"><span>Kết thúc *</span><Input type="datetime-local" value={formValues.endedAt} onChange={(event) => setFormValues((current) => ({ ...current, endedAt: event.target.value }))} required /><span className="block text-xs font-normal text-muted-foreground">DTO backend hiện đánh dấu endedAt là bắt buộc.</span></label>
          </div>

          <label className="block space-y-2 text-sm font-medium"><span>Trạng thái phân công</span><Select value={formValues.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormValues((current) => ({ ...current, isActive: value === 'active' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Đang hoạt động</SelectItem><SelectItem value="inactive">Tạm dừng</SelectItem></SelectContent></Select></label>

          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedAssignment ? 'Lưu thay đổi' : 'Tạo phân công'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết phân công"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedAssignment(null); }}
        maxWidth={660}
        actions={selectedAssignment ? [
          <Button key="close" variant="outline" onClick={() => { setDetailOpen(false); setSelectedAssignment(null); }}>Đóng</Button>,
          <Button key="edit" onClick={() => { const assignment = selectedAssignment; setDetailOpen(false); openEdit(assignment); }}><Edit className="h-4 w-4" />Chỉnh sửa</Button>,
        ] : null}
      >
        {selectedAssignment && (
          <DetailList columns={2}>
            <DetailItem label="User">{selectedAssignment.name}</DetailItem>
            <DetailItem label="Email">{selectedAssignment.email}</DetailItem>
            <DetailItem label="Điện thoại">{selectedAssignment.phone}</DetailItem>
            <DetailItem label="Trạng thái user">{selectedAssignment.userStatus || '—'}</DetailItem>
            <DetailItem label="Rạp">{selectedAssignment.cinemaName}</DetailItem>
            <DetailItem label="Vị trí">{selectedAssignment.position === 'MANAGER' ? 'Quản lý' : 'Nhân viên'}</DetailItem>
            <DetailItem label="Phân công">{selectedAssignment.isActive ? 'Đang hoạt động' : 'Tạm dừng'}</DetailItem>
            <DetailItem label="Assignment ID">{selectedAssignment.id}</DetailItem>
            <DetailItem label="Bắt đầu">{formatDateTime(selectedAssignment.assignedAt)}</DetailItem>
            <DetailItem label="Kết thúc">{formatDateTime(selectedAssignment.endedAt)}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Staff;
