import { useCallback, useEffect, useState } from 'react';
import { Edit, Eye, Loader2, LockKeyhole, Plus, Shield, Trash2 } from 'lucide-react';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Textarea } from '@/components/ui/textarea';
import useNotification from '@/hooks/useNotification';
import roleService from '@/services/roleService';

const DEFAULT_ROLE = { name: '', code: '', description: '' };

const RolesPermissions = () => {
  const notification = useNotification();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyRoleId, setBusyRoleId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formValues, setFormValues] = useState(DEFAULT_ROLE);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadRoles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await roleService.getAllRoles({
        page: pagination.current - 1,
        size: pagination.pageSize,
      });
      const content = Array.isArray(response) ? response : response?.content || [];
      const total = Array.isArray(response)
        ? response.length
        : Number(response?.totalElements ?? response?.total ?? content.length);
      setRoles(content);
      setPagination((current) => ({ ...current, total }));
    } catch (error) {
      console.error('Error loading roles:', error);
      setRoles([]);
      setPagination((current) => ({ ...current, total: 0 }));
      notification.error(error?.response?.data?.message || error?.message || 'Không thể tải danh sách vai trò');
    } finally {
      setLoading(false);
    }
  }, [notification, pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const closeForm = () => {
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
    });
    setFormOpen(true);
  };

  const validateRole = () => {
    if (!formValues.name.trim()) return 'Vui lòng nhập tên vai trò';
    if (!formValues.code.trim()) return 'Vui lòng nhập mã vai trò';
    if (!/^[A-Z0-9_]+$/.test(formValues.code.trim())) {
      return 'Mã vai trò chỉ chứa chữ in hoa, số và dấu gạch dưới';
    }
    if (!formValues.description.trim()) return 'Vui lòng nhập mô tả vai trò';
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
      code: formValues.code.trim().toUpperCase(),
      description: formValues.description.trim(),
    };

    setSaving(true);
    try {
      if (selectedRole?.id) {
        await roleService.updateRole(selectedRole.id, payload);
        notification.success('Cập nhật vai trò thành công');
      } else {
        await roleService.createRole(payload);
        notification.success('Thêm vai trò thành công');
      }
      closeForm();
      await loadRoles();
    } catch (error) {
      console.error('Error saving role:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể lưu vai trò');
    } finally {
      setSaving(false);
    }
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Xóa vai trò “${role.name}”? Hành động này không thể hoàn tác.`)) return;
    setBusyRoleId(role.id);
    try {
      await roleService.deleteRole(role.id);
      notification.success('Đã xóa vai trò');
      if (roles.length === 1 && pagination.current > 1) {
        setPagination((current) => ({ ...current, current: current.current - 1 }));
      } else {
        await loadRoles();
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      notification.error(error?.response?.data?.message || error?.message || 'Không thể xóa vai trò');
    } finally {
      setBusyRoleId(null);
    }
  };

  const columns = [
    {
      title: 'Vai trò',
      key: 'role',
      render: (_, role) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="rounded-md border bg-muted/40 p-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="min-w-0">
            <button
              type="button"
              className="block max-w-full truncate text-left font-medium hover:text-primary"
              onClick={() => { setSelectedRole(role); setDetailOpen(true); }}
            >
              {role.name || 'N/A'}
            </button>
            <StatusBadge tone="info" className="mt-1">{role.code || 'N/A'}</StatusBadge>
          </div>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (value) => <span className="text-sm text-muted-foreground">{value || '—'}</span>,
    },
    {
      title: 'Quyền',
      key: 'permissions',
      render: () => <StatusBadge tone="warning">Backend chưa hỗ trợ</StatusBadge>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, role) => {
        const busy = busyRoleId === role.id;
        return (
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => { setSelectedRole(role); setDetailOpen(true); }}
              aria-label="Xem vai trò"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => openEdit(role)}
              aria-label="Sửa vai trò"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              disabled={busy}
              onClick={() => deleteRole(role)}
              aria-label="Xóa vai trò"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Vai trò & quyền"
        description="Quản lý danh mục vai trò. Gán permission sẽ được bật khi backend có resource/command tương ứng."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Vai trò & quyền' },
        ]}
        actions={<Button onClick={openCreate}><Plus className="h-4 w-4" />Thêm vai trò</Button>}
      />

      <Alert
        variant="warning"
        showIcon
        message="Permission management chưa khả dụng"
        description="Backend hiện chỉ expose CRUD /roles và RoleResponse không chứa permission hoặc trạng thái active/inactive. Frontend đã tắt các thao tác không có contract để tránh ghi dữ liệu sai."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Tổng vai trò</p>
              <p className="mt-1 text-2xl font-semibold">{pagination.total}</p>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Permission API</p>
              <p className="mt-1 text-sm font-semibold">Chưa triển khai</p>
            </div>
            <LockKeyhole className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách vai trò</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />Đang tải vai trò...
            </div>
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
        onClose={closeForm}
        maxWidth={620}
      >
        <form onSubmit={saveRole} className="space-y-4">
          <label className="block space-y-2 text-sm font-medium">
            <span>Tên vai trò <span className="text-destructive">*</span></span>
            <Input
              value={formValues.name}
              onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="Quản lý rạp"
              required
            />
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Mã vai trò <span className="text-destructive">*</span></span>
            <Input
              value={formValues.code}
              onChange={(event) => setFormValues((current) => ({ ...current, code: event.target.value.toUpperCase() }))}
              placeholder="CINEMA_MANAGER"
              required
            />
            <span className="block text-xs font-normal text-muted-foreground">Chỉ chữ in hoa, số và dấu gạch dưới.</span>
          </label>
          <label className="block space-y-2 text-sm font-medium">
            <span>Mô tả <span className="text-destructive">*</span></span>
            <Textarea
              rows={4}
              value={formValues.description}
              onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
              required
            />
          </label>
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={closeForm}>Hủy</Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {selectedRole ? 'Lưu thay đổi' : 'Thêm vai trò'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiết vai trò"
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedRole(null); }}
        maxWidth={680}
        actions={<Button variant="outline" onClick={() => { setDetailOpen(false); setSelectedRole(null); }}>Đóng</Button>}
      >
        {selectedRole && (
          <DetailList columns={2}>
            <DetailItem label="ID">{selectedRole.id}</DetailItem>
            <DetailItem label="Mã vai trò"><StatusBadge tone="info">{selectedRole.code || '—'}</StatusBadge></DetailItem>
            <DetailItem label="Tên vai trò">{selectedRole.name || '—'}</DetailItem>
            <DetailItem label="Ngày tạo">{selectedRole.createdAt ? new Date(selectedRole.createdAt).toLocaleString('vi-VN') : '—'}</DetailItem>
            <DetailItem label="Mô tả" wide>{selectedRole.description || '—'}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default RolesPermissions;
