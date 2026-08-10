import { useCallback, useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, Edit, Eye, Key, Loader2, Plus, Settings, Shield, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import roleService from '@/services/roleService';
import permissionService from '@/services/permissionService';
import useNotification from '@/hooks/useNotification';

const DEFAULT_ROLE = { name: '', code: '', description: '', isActive: true };

const unwrapData = (response) => response?.data?.data ?? response?.data ?? response;

const unwrapList = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  return [];
};

const unwrapPage = (response) => {
  const payload = unwrapData(response);
  if (Array.isArray(payload)) return { content: payload, totalElements: payload.length };
  const content = Array.isArray(payload?.content) ? payload.content : [];
  return { content, totalElements: Number(payload?.totalElements ?? payload?.total ?? content.length) };
};

const isRoleActive = (role) => role?.isActive ?? role?.active ?? false;
const permissionKey = (id) => String(id);

const RolesPermissions = () => {
  const notification = useNotification();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissionsLoading, setPermissionsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyRoleId, setBusyRoleId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_ROLE);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadRoles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRoles({
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'id,desc',
      });
      const page = unwrapPage(response);
      setRoles(page.content);
      setPagination((current) => ({ ...current, total: page.totalElements }));
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error('Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  const loadPermissions = useCallback(async () => {
    try {
      setPermissionsLoading(true);
      const response = await permissionService.getAllPermissionsList();
      setPermissions(unwrapList(response));
    } catch (error) {
      console.error('Error loading permissions:', error);
      setPermissions([]);
      notification.error('Không thể tải danh sách quyền');
    } finally {
      setPermissionsLoading(false);
    }
  }, [notification]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const activeOnPage = useMemo(() => roles.filter(isRoleActive).length, [roles]);

  const closeRoleForm = () => {
    setFormOpen(false);
    setSelectedRole(null);
    setFormValues(DEFAULT_ROLE);
  };

  const openCreate = () => {
    setSelectedRole(null);
    setFormValues(DEFAULT_ROLE);
    setFormOpen(true);
  };

  const openEdit = (role) => {
    setSelectedRole(role);
    setFormValues({
      name: role.name || '',
      code: role.code || '',
      description: role.description || '',
      isActive: isRoleActive(role),
    });
    setFormOpen(true);
  };

  const validateRole = () => {
    if (!formValues.name.trim()) return 'Vui lòng nhập tên vai trò';
    if (!formValues.code.trim()) return 'Vui lòng nhập mã vai trò';
    if (!/^[A-Z_]+$/.test(formValues.code.trim())) return 'Mã vai trò chỉ chứa chữ in hoa và dấu gạch dưới';
    return null;
  };

  const saveRole = async (event) => {
    event.preventDefault();
    const validationError = validateRole();
    if (validationError) {
      notification.error(validationError);
      return;
    }

    const payload = {
      name: formValues.name.trim(),
      code: formValues.code.trim(),
      description: formValues.description.trim(),
      isActive: formValues.isActive,
    };

    try {
      setSaving(true);
      if (selectedRole) {
        await roleService.updateRole(selectedRole.id, payload);
        notification.success('Cập nhật vai trò thành công');
      } else {
        await roleService.createRole(payload);
        notification.success('Thêm vai trò thành công');
      }
      closeRoleForm();
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      notification.error(error?.response?.data?.message || 'Không thể lưu vai trò');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (role) => {
    const active = isRoleActive(role);
    try {
      setBusyRoleId(role.id);
      if (active) {
        await roleService.deactivateRole(role.id);
        notification.success('Đã vô hiệu hóa vai trò');
      } else {
        await roleService.activateRole(role.id);
        notification.success('Đã kích hoạt vai trò');
      }
      await loadRoles();
    } catch (error) {
      console.error('Error changing role status:', error);
      notification.error(error?.response?.data?.message || 'Không thể thay đổi trạng thái vai trò');
    } finally {
      setBusyRoleId(null);
    }
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Xóa vai trò ${role.name}? Hành động này không thể hoàn tác.`)) return;
    try {
      setBusyRoleId(role.id);
      await roleService.deleteRole(role.id);
      notification.success('Đã xóa vai trò');
      if (roles.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      notification.error(error?.response?.data?.message || 'Không thể xóa vai trò');
    } finally {
      setBusyRoleId(null);
    }
  };

  const openPermissionEditor = async (role) => {
    try {
      setBusyRoleId(role.id);
      const response = await roleService.getRoleById(role.id);
      const fullRole = unwrapData(response);
      if (!fullRole || !fullRole.id || !Array.isArray(fullRole.permissions)) {
        throw new Error('Backend không trả về đầy đủ danh sách quyền của vai trò');
      }
      setSelectedRole(fullRole);
      setSelectedPermissionIds(fullRole.permissions.map((permission) => permissionKey(permission.id)));
      setPermissionOpen(true);
    } catch (error) {
      console.error('Error loading full role before permission edit:', error);
      notification.error('Không thể tải đầy đủ quyền hiện tại. Không mở trình chỉnh sửa để tránh làm mất quyền.');
    } finally {
      setBusyRoleId(null);
    }
  };

  const closePermissionEditor = () => {
    setPermissionOpen(false);
    setSelectedRole(null);
    setSelectedPermissionIds([]);
  };

  const togglePermission = (permissionId, checked) => {
    const key = permissionKey(permissionId);
    setSelectedPermissionIds((current) => checked
      ? [...new Set([...current, key])]
      : current.filter((id) => id !== key));
  };

  const savePermissions = async () => {
    if (!selectedRole || !Array.isArray(selectedRole.permissions)) return;

    const currentIds = selectedRole.permissions.map((permission) => permissionKey(permission.id));
    const toAddKeys = selectedPermissionIds.filter((id) => !currentIds.includes(id));
    const toRemoveKeys = currentIds.filter((id) => !selectedPermissionIds.includes(id));
    const idByKey = new Map(permissions.map((permission) => [permissionKey(permission.id), permission.id]));
    selectedRole.permissions.forEach((permission) => idByKey.set(permissionKey(permission.id), permission.id));
    const toAdd = toAddKeys.map((key) => idByKey.get(key)).filter((id) => id !== undefined);
    const toRemove = toRemoveKeys.map((key) => idByKey.get(key)).filter((id) => id !== undefined);

    try {
      setSaving(true);
      if (toAdd.length > 0) await roleService.addPermissionsToRole(selectedRole.id, toAdd);
      if (toRemove.length > 0) await roleService.removePermissionsFromRole(selectedRole.id, toRemove);
      notification.success(toAdd.length || toRemove.length ? 'Cập nhật quyền thành công' : 'Không có thay đổi quyền');
      closePermissionEditor();
      await loadRoles();
    } catch (error) {
      console.error('Error saving permissions:', error);
      notification.error(error?.response?.data?.message || 'Không thể cập nhật quyền');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: 'Vai trò',
      key: 'role',
      render: (_, role) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="rounded-md border bg-muted/40 p-2"><Shield className="h-4 w-4 text-muted-foreground" /></div>
          <div className="min-w-0">
            <button type="button" onClick={() => { setSelectedRole(role); setDetailOpen(true); }} className="block max-w-full truncate text-left font-medium hover:text-primary">{role.name || 'N/A'}</button>
            <div className="mt-1 flex flex-wrap gap-1.5">
              <StatusBadge tone="info">{role.code || 'N/A'}</StatusBadge>
              {Array.isArray(role.permissions) && <StatusBadge tone="neutral">{role.permissions.length} quyền</StatusBadge>}
            </div>
          </div>
        </div>
      ),
    },
    { title: 'Mô tả', dataIndex: 'description', key: 'description', ellipsis: true, render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span> },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, role) => <StatusBadge tone={isRoleActive(role) ? 'success' : 'neutral'}>{isRoleActive(role) ? 'Hoạt động' : 'Không hoạt động'}</StatusBadge>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, role) => {
        const busy = busyRoleId === role.id;
        return (
          <TooltipProvider>
            <div className="flex items-center gap-1">
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedRole(role); setDetailOpen(true); }} aria-label="Xem vai trò"><Eye className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xem chi tiết</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(role)} aria-label="Sửa vai trò"><Edit className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Chỉnh sửa</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy || permissionsLoading} onClick={() => openPermissionEditor(role)} aria-label="Quản lý quyền">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>Quản lý quyền</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8" disabled={busy} onClick={() => changeStatus(role)} aria-label={isRoleActive(role) ? 'Vô hiệu hóa vai trò' : 'Kích hoạt vai trò'}>{isRoleActive(role) ? <Ban className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}</Button></TooltipTrigger><TooltipContent>{isRoleActive(role) ? 'Vô hiệu hóa' : 'Kích hoạt'}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" disabled={busy} onClick={() => deleteRole(role)} aria-label="Xóa vai trò"><Trash2 className="h-4 w-4" /></Button></TooltipTrigger><TooltipContent>Xóa</TooltipContent></Tooltip>
            </div>
          </TooltipProvider>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vai trò & quyền"
        description="Quản lý vai trò và quyền truy cập. Trình chỉnh sửa quyền chỉ mở khi tải được role đầy đủ từ backend."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Vai trò & quyền' },
        ]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Thêm vai trò</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Tổng vai trò</p><p className="mt-1 text-2xl font-semibold">{pagination.total}</p></div><Shield className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
        <Card><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">Hoạt động trên trang</p><p className="mt-1 text-2xl font-semibold">{activeOnPage}</p></div><CheckCircle2 className="h-5 w-5 text-muted-foreground" /></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách vai trò</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải vai trò...</div>
          ) : roles.length === 0 ? (
            <Empty description="Chưa có vai trò nào" />
          ) : (
            <DataTable fields={columns} rows={roles} getRowId="id" pageControls={false} />
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
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} vai trò`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        heading={selectedRole ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
        open={formOpen}
        onClose={closeRoleForm}
        maxWidth={620}
      >
        <form onSubmit={saveRole} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium"><span>Tên vai trò <span className="text-destructive">*</span></span><Input value={formValues.name} onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))} placeholder="Quản lý rạp" /></label>
          <label className="block space-y-2 text-sm font-medium"><span>Mã vai trò <span className="text-destructive">*</span></span><Input value={formValues.code} onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="CINEMA_MANAGER" /><span className="block text-xs font-normal text-muted-foreground">Chỉ chữ in hoa và dấu gạch dưới.</span></label>
          <label className="block space-y-2 text-sm font-medium"><span>Mô tả</span><Textarea rows={4} value={formValues.description} onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))} /></label>
          <label className="block space-y-2 text-sm font-medium"><span>Trạng thái</span><Select value={formValues.isActive ? 'active' : 'inactive'} onValueChange={(value) => setFormValues((current) => ({ ...current, isActive: value === 'active' }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Hoạt động</SelectItem><SelectItem value="inactive">Không hoạt động</SelectItem></SelectContent></Select></label>
          <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={closeRoleForm}>Hủy</Button><Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}{selectedRole ? 'Lưu thay đổi' : 'Thêm vai trò'}</Button></div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading={`Quản lý quyền${selectedRole?.name ? ` · ${selectedRole.name}` : ''}`}
        open={permissionOpen}
        onClose={closePermissionEditor}
        maxWidth={760}
        actions={[
          <Button key="cancel" variant="outline" onClick={closePermissionEditor}>Hủy</Button>,
          <Button key="save" disabled={saving || permissionsLoading} onClick={savePermissions}>{saving && <Loader2 className="h-4 w-4 animate-spin" />}Lưu quyền</Button>,
        ]}
      >
        <div className="space-y-4">
          <Alert type="info" showIcon message="Danh sách quyền đã được đối chiếu với role đầy đủ" description="Chỉ các thay đổi giữa danh sách hiện tại từ backend và lựa chọn mới mới được gửi qua API add/remove permissions." />
          {permissionsLoading ? (
            <div className="flex min-h-32 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải quyền...</div>
          ) : permissions.length === 0 ? (
            <Empty description="Không có quyền nào để gán" />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {permissions.map((permission) => (
                <label key={permission.id} className="flex items-start gap-3 rounded-md border p-3">
                  <Checkbox checked={selectedPermissionIds.includes(permissionKey(permission.id))} onCheckedChange={(checked) => togglePermission(permission.id, checked === true)} className="mt-0.5" />
                  <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><span className="font-medium">{permission.name}</span>{permission.code && <StatusBadge tone="info">{permission.code}</StatusBadge>}</span>{permission.description && <span className="mt-1 block text-xs text-muted-foreground">{permission.description}</span>}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết vai trò"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedRole(null); }}
        maxWidth={680}
        actions={<Button variant="outline" onClick={() => { setDetailOpen(false); setSelectedRole(null); }}>Đóng</Button>}
      >
        {selectedRole && (
          <div className="space-y-4">
            <DetailList columns={2}>
              <DetailItem label="ID">{selectedRole.id}</DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={isRoleActive(selectedRole) ? 'success' : 'neutral'}>{isRoleActive(selectedRole) ? 'Hoạt động' : 'Không hoạt động'}</StatusBadge></DetailItem>
              <DetailItem label="Tên vai trò">{selectedRole.name || '—'}</DetailItem>
              <DetailItem label="Mã vai trò"><StatusBadge tone="info">{selectedRole.code || '—'}</StatusBadge></DetailItem>
              <DetailItem label="Mô tả" wide>{selectedRole.description || '—'}</DetailItem>
            </DetailList>
            {Array.isArray(selectedRole.permissions) && selectedRole.permissions.length > 0 && (
              <div><h3 className="mb-2 text-sm font-semibold">Quyền được trả về cùng role</h3><div className="flex flex-wrap gap-2">{selectedRole.permissions.map((permission) => <StatusBadge key={permission.id} tone="neutral" leading={<Key className="h-3 w-3" />}>{permission.name || permission.code}</StatusBadge>)}</div></div>
            )}
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default RolesPermissions;
