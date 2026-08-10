import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Alert } from '@/components/ui/alert';
import { Empty } from '@/components/ui/empty';
import { Pagination } from '@/components/ui/pagination';
import { Loader2 } from 'lucide-react';
import {
    Shield,
    Edit,
    Trash2,
    Plus,
    Eye,
    Key,
    CheckCircle2,
    Ban,
    Home,
    Search,
    Settings
} from 'lucide-react';
import roleService from '@/services/roleService';
import permissionService from '@/services/permissionService';
import { useNotification } from '@/hooks/useNotification';

const RolesPermissions = () => {
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const tableRef = useRef(null);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingPermissions, setLoadingPermissions] = useState(false);
    const [isAddModalVisible, setIsAddModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [isPermissionModalVisible, setIsPermissionModalVisible] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [formValues, setFormValues] = useState({
        name: '',
        code: '',
        description: '',
        isActive: true
    });
    const [permissionFormValues, setPermissionFormValues] = useState({
        permissions: []
    });

    // Load permissions on mount
    useEffect(() => {
        loadPermissions();
    }, []);

    // Load roles from API
    useEffect(() => {
        loadRoles();
    }, [pagination.current, pagination.pageSize, statusFilter, searchText]);

    const loadPermissions = async () => {
        try {
            setLoadingPermissions(true);
            const response = await permissionService.getAllPermissionsList();
            const permissionsData = response?.data?.data || response?.data || [];
            setPermissions(permissionsData);
        } catch (error) {
            console.error('Error loading permissions:', error);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách quyền');
            setPermissions([]);
        } finally {
            setLoadingPermissions(false);
        }
    };

    const loadRoles = async () => {
        try {
            setLoading(true);
            const params = {
                page: pagination.current - 1, // Backend uses 0-based indexing
                size: pagination.pageSize,
                sort: 'id,desc'
            };

            const response = await roleService.getAllRoles(params);
            const rolesData = response?.data?.content || response?.data?.data || response?.data || [];
            const total = response?.data?.totalElements || response?.data?.total || rolesData.length;

            // Apply client-side filtering
            let filteredData = rolesData;

            // Filter by search text
            if (searchText) {
                filteredData = filteredData.filter(role =>
                    role.name?.toLowerCase().includes(searchText.toLowerCase()) ||
                    role.code?.toLowerCase().includes(searchText.toLowerCase()) ||
                    role.description?.toLowerCase().includes(searchText.toLowerCase())
                );
            }

            // Filter by status
            if (statusFilter !== 'all') {
                filteredData = filteredData.filter(role => {
                    const isActive = role.isActive !== undefined ? role.isActive : role.active;
                    return statusFilter === 'active' ? isActive : !isActive;
                });
            }

            setRoles(filteredData);
            setPagination(prev => ({
                ...prev,
                total: filteredData.length < rolesData.length ? filteredData.length : total
            }));
        } catch (error) {
            console.error('Error loading roles:', error);
            showNotification('error', 'Lỗi', 'Không thể tải danh sách vai trò');
            setRoles([]);
            setPagination(prev => ({ ...prev, total: 0 }));
        } finally {
            setLoading(false);
        }
    };

    // Calculate statistics
    const roleStats = {
        total: pagination.total,
        active: roles.filter(role => {
            const isActive = role.isActive !== undefined ? role.isActive : role.active;
            return isActive;
        }).length,
        inactive: roles.filter(role => {
            const isActive = role.isActive !== undefined ? role.isActive : role.active;
            return !isActive;
        }).length
    };

    // Handle table change (pagination)
    const handleTableChange = (page, pageSize) => {
        const newPageSize = pageSize || pagination.pageSize;
        setPagination(prev => ({
            current: page,
            pageSize: newPageSize,
            total: prev.total
        }));
        if (tableRef.current) {
            tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Handle page size change
    const handlePageSizeChange = (current, newPageSize) => {
        setPagination(prev => ({
            current: 1,
            pageSize: newPageSize,
            total: prev.total
        }));
    };

    // Handle search
    const handleSearch = (value) => {
        setSearchText(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // Handle status filter
    const handleStatusFilterChange = (value) => {
        setStatusFilter(value);
        setPagination(prev => ({ ...prev, current: 1 }));
    };

    // Handle add role
    const handleAddRole = async (e) => {
        e?.preventDefault();
        try {
            // Validation
            if (!formValues.name?.trim()) {
                showNotification('error', 'Lỗi', 'Vui lòng nhập tên vai trò!');
                return;
            }
            if (!formValues.code?.trim()) {
                showNotification('error', 'Lỗi', 'Vui lòng nhập mã vai trò!');
                return;
            }
            if (!/^[A-Z_]+$/.test(formValues.code)) {
                showNotification('error', 'Lỗi', 'Mã vai trò chỉ chứa chữ in hoa và dấu gạch dưới!');
                return;
            }

            const createData = {
                name: formValues.name.trim(),
                code: formValues.code.trim(),
                description: formValues.description?.trim() || '',
                isActive: formValues.isActive !== undefined ? formValues.isActive : true
            };
            await roleService.createRole(createData);
            showNotification('success', 'Thành công', 'Thêm vai trò thành công!');
            setIsAddModalVisible(false);
            setFormValues({
                name: '',
                code: '',
                description: '',
                isActive: true
            });
            loadRoles();
        } catch (error) {
            console.error('Error creating role:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể thêm vai trò');
        }
    };

    // Handle edit role
    const handleEditRole = async (e) => {
        e?.preventDefault();
        try {
            // Validation
            if (!formValues.name?.trim()) {
                showNotification('error', 'Lỗi', 'Vui lòng nhập tên vai trò!');
                return;
            }
            if (!formValues.code?.trim()) {
                showNotification('error', 'Lỗi', 'Vui lòng nhập mã vai trò!');
                return;
            }
            if (!/^[A-Z_]+$/.test(formValues.code)) {
                showNotification('error', 'Lỗi', 'Mã vai trò chỉ chứa chữ in hoa và dấu gạch dưới!');
                return;
            }

            const updateData = {
                name: formValues.name.trim(),
                code: formValues.code.trim(),
                description: formValues.description?.trim() || '',
                isActive: formValues.isActive !== undefined ? formValues.isActive : selectedRole.isActive
            };
            await roleService.updateRole(selectedRole.id, updateData);
            showNotification('success', 'Thành công', 'Cập nhật vai trò thành công!');
            setIsEditModalVisible(false);
            setSelectedRole(null);
            setFormValues({
                name: '',
                code: '',
                description: '',
                isActive: true
            });
            loadRoles();
        } catch (error) {
            console.error('Error updating role:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể cập nhật vai trò');
        }
    };

    // Handle delete role
    const handleDeleteRole = async (id) => {
        try {
            await roleService.deleteRole(id);
            showNotification('success', 'Thành công', 'Xóa vai trò thành công!');
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể xóa vai trò');
        }
    };

    // Handle status change
    const handleStatusChange = async (id, isActive) => {
        try {
            if (isActive) {
                await roleService.activateRole(id);
                showNotification('success', 'Thành công', 'Đã kích hoạt vai trò!');
            } else {
                await roleService.deactivateRole(id);
                showNotification('success', 'Thành công', 'Đã vô hiệu hóa vai trò!');
            }
            loadRoles();
        } catch (error) {
            console.error('Error changing role status:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể thay đổi trạng thái vai trò');
        }
    };

    // Handle save permissions
    const handleSavePermissions = async (values) => {
        try {
            const selectedPermissionIds = values.permissions || [];
            const currentPermissionIds = selectedRole.permissions?.map(p => p.id) || [];

            // Find permissions to add
            const toAdd = selectedPermissionIds.filter(id => !currentPermissionIds.includes(id));
            // Find permissions to remove
            const toRemove = currentPermissionIds.filter(id => !selectedPermissionIds.includes(id));

            // Add new permissions
            if (toAdd.length > 0) {
                await roleService.addPermissionsToRole(selectedRole.id, toAdd);
            }

            // Remove permissions
            if (toRemove.length > 0) {
                await roleService.removePermissionsFromRole(selectedRole.id, toRemove);
            }

            showNotification('success', 'Thành công', 'Cập nhật quyền thành công!');
            setIsPermissionModalVisible(false);
            setSelectedRole(null);
            setPermissionFormValues({ permissions: [] });
            loadRoles();
        } catch (error) {
            console.error('Error saving permissions:', error);
            showNotification('error', 'Lỗi', error.response?.data?.message || 'Không thể cập nhật quyền');
        }
    };

    // Show modals
    const showAddModal = () => {
        setIsAddModalVisible(true);
        setFormValues({
            name: '',
            code: '',
            description: '',
            isActive: true
        });
    };

    const showEditModal = (role) => {
        setSelectedRole(role);
        setIsEditModalVisible(true);
        const isActive = role.isActive !== undefined ? role.isActive : role.active;
        setFormValues({
            name: role.name || '',
            code: role.code || '',
            description: role.description || '',
            isActive: isActive
        });
    };

    const showPermissionModal = async (role) => {
        // Load full role details with permissions
        try {
            const response = await roleService.getRoleById(role.id);
            const fullRole = response?.data?.data || response?.data || role;
            setSelectedRole(fullRole);
            setIsPermissionModalVisible(true);

            // Set form values with current permissions
            const currentPermissionIds = fullRole.permissions?.map(p => p.id) || [];
            setPermissionFormValues({
                permissions: currentPermissionIds
            });
        } catch (error) {
            console.error('Error loading role details:', error);
            showNotification('error', 'Lỗi', 'Không thể tải chi tiết vai trò');
            setSelectedRole(role);
            setIsPermissionModalVisible(true);
            const currentPermissionIds = role.permissions?.map(p => p.id) || [];
            setPermissionFormValues({
                permissions: currentPermissionIds
            });
        }
    };

    const showDetailModal = (role) => {
        setSelectedRole(role);
        setIsDetailModalVisible(true);
    };

    // Render status
    const renderStatus = (role) => {
        const isActive = role.isActive !== undefined ? role.isActive : role.active;
        return (
            <StatusBadge tone={isActive ? 'green' : 'red'}>
                {isActive ? <CheckCircle2 className="h-3 w-3 mr-1 inline" /> : <Ban className="h-3 w-3 mr-1 inline" />}
                {isActive ? 'Hoạt động' : 'Không hoạt động'}
            </StatusBadge>
        );
    };

    // Table columns
    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            align: 'center',
            sorter: (a, b) => a.id - b.id,
            render: (id) => (
                <span className="text-muted-foreground font-medium">#{id}</span>
            ),
        },
        {
            title: 'Vai trò',
            key: 'role',
            width: 280,
            render: (_, record) => (
                <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div
                            className="font-semibold text-foreground mb-1 text-base cursor-pointer hover:text-primary transition-colors"
                            onClick={() => showDetailModal(record)}
                        >
                            {record.name || 'N/A'}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <StatusBadge tone="blue" className="m-0">
                                {record.code || 'N/A'}
                            </StatusBadge>
                            {record.permissions?.length > 0 && (
                                <StatusBadge tone="purple" className="m-0">
                                    <Key className="h-3 w-3 mr-1" />
                                    {record.permissions.length} quyền
                                </StatusBadge>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: true,
            },
            render: (text) => (
                <span className={text ? "text-muted-foreground" : "text-gray-400"}>
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Số quyền',
            key: 'permissionCount',
            width: 120,
            align: 'center',
            render: (_, record) => {
                const count = record.permissions?.length || 0;
                return (
                    <div className="flex items-center justify-center">
                        <StatusBadge
                            tone={count > 0 ? 'purple' : 'default'}
                            className="px-3 py-1 rounded-full"
                        >
                            <Key className="h-3 w-3 mr-1" />
                            {count}
                        </StatusBadge>
                    </div>
                );
            },
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: 140,
            align: 'center',
            filters: [
                { text: 'Hoạt động', value: 'active' },
                { text: 'Không hoạt động', value: 'inactive' },
            ],
            onFilter: (value, record) => {
                const isActive = record.isActive !== undefined ? record.isActive : record.active;
                return value === 'active' ? isActive : !isActive;
            },
            render: (_, record) => (
                <div className="flex justify-center">
                    {renderStatus(record)}
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'actions',
            width: 200,
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                const isActive = record.isActive !== undefined ? record.isActive : record.active;
                return (
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showDetailModal(record)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Xem chi tiết"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showEditModal(record)}
                            className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                            title="Chỉnh sửa"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showPermissionModal(record)}
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                            title="Quản lý quyền"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                        {isActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('Vô hiệu hóa vai trò này?\nVai trò sẽ không thể sử dụng sau khi bị vô hiệu hóa.')) {
                                        handleStatusChange(record.id, false);
                                    }
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="Vô hiệu hóa"
                            >
                                <Ban className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('Kích hoạt vai trò này?')) {
                                        handleStatusChange(record.id, true);
                                    }
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                title="Kích hoạt"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (window.confirm('Xóa vai trò này?\nHành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?')) {
                                    handleDeleteRole(record.id);
                                }
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="Xóa"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <div className="min-h-screen">
            {/* Breadcrumb */}
            <Breadcrumb
                className="mb-6"
                items={[
                    {
                        title: 'Dashboard',
                        icon: <Home className="h-4 w-4" />,
                        href: '/admin/dashboard'
                    },
                    {
                        title: 'Quản lý vai trò và quyền',
                        icon: <Shield className="h-4 w-4" />
                    }
                ]}
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground m-0 mb-2">
                            Quản lý vai trò và quyền
                        </h2>
                        <p className="text-muted-foreground text-sm m-0">
                            Quản lý vai trò và phân quyền cho người dùng trong hệ thống
                        </p>
                    </div>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        onClick={showAddModal}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Thêm vai trò
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-card rounded-xl shadow-md border border-border">
                    <Metric
                        label="Tổng vai trò"
                        value={roleStats.total}
                        leading={<Shield className="h-4 w-4" />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
                <Card className="p-4 bg-card rounded-xl shadow-md border border-border">
                    <Metric
                        label="Vai trò hoạt động"
                        value={roleStats.active}
                        leading={<CheckCircle2 className="h-4 w-4" />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
                <Card className="p-4 bg-card rounded-xl shadow-md border border-border">
                    <Metric
                        label="Vai trò không hoạt động"
                        value={roleStats.inactive}
                        leading={<Ban className="h-4 w-4" />}
                        valueStyle={{ color: '#ff4d4f' }}
                    />
                </Card>
            </div>

            {/* Filter Card */}
            <Card
                className="p-4 bg-card rounded-xl shadow-md border border-border mb-6"
                bodyStyle={{ padding: '16px' }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <div className="relative">
                            <Input
                                placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
                                value={searchText}
                                onChange={(e) => {
                                    setSearchText(e.target.value);
                                    if (!e.target.value) {
                                        handleSearch('');
                                    }
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="pr-10 h-10"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                                onClick={() => handleSearch()}
                            >
                                <Search className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div>
                        <Select
                            value={statusFilter || "all"}
                            onValueChange={handleStatusFilterChange}
                        >
                            <SelectTrigger className="h-10 w-full">
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="active">Hoạt động</SelectItem>
                                <SelectItem value="inactive">Không hoạt động</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Table Card */}
            <Card
                className="bg-card rounded-xl shadow-md border border-border p-6"
                ref={tableRef}
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="p-12 text-center">
                        <Empty description="Chưa có vai trò nào" />
                    </div>
                ) : (
                    <>
                        <DataTable
                            fields={columns}
                            data={roles}
                            getRowId="id"
                            pageControls={false}
                            className="overflow-x-auto border border-border rounded-lg"
                        />
                        {pagination.total > 0 && (
                            <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-border">
                                <div className="text-sm text-muted-foreground">
                                    Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} vai trò
                                </div>
                                <Pagination
                                    page={pagination.current}
                                    itemsPerPage={pagination.pageSize}
                                    totalItems={pagination.total}
                                    allowPageSizeChange={true}
                                    allowPageJump={true}
                                    onPageChange={handleTableChange}
                                    onPageSizeChange={handlePageSizeChange}
                                />
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Modal thêm vai trò */}
            <ResponsiveDialog
                heading="Thêm vai trò mới"
                open={isAddModalVisible}
                onClose={() => {
                    setIsAddModalVisible(false);
                    setFormValues({
                        name: '',
                        code: '',
                        description: '',
                        isActive: true
                    });
                }}
                actions={null}
                maxWidth={600}
                destroyOnClose
            >
                <form onSubmit={handleAddRole} className="space-y-4 p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên vai trò <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nhập tên vai trò"
                            value={formValues.name}
                            onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã vai trò <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="VD: ADMIN, USER, MANAGER"
                            value={formValues.code}
                            onChange={(e) => setFormValues(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Chỉ chứa chữ in hoa và dấu gạch dưới</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Nhập mô tả vai trò"
                            value={formValues.description}
                            onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={formValues.isActive}
                                onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isActive: checked }))}
                            />
                            <span className="text-sm text-gray-700">Kích hoạt ngay sau khi tạo</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsAddModalVisible(false);
                                setFormValues({
                                    name: '',
                                    code: '',
                                    description: '',
                                    isActive: true
                                });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            Thêm vai trò
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            {/* Modal chỉnh sửa vai trò */}
            <ResponsiveDialog
                heading="Chỉnh sửa vai trò"
                open={isEditModalVisible}
                onClose={() => {
                    setIsEditModalVisible(false);
                    setSelectedRole(null);
                    setFormValues({
                        name: '',
                        code: '',
                        description: '',
                        isActive: true
                    });
                }}
                actions={null}
                maxWidth={600}
                destroyOnClose
            >
                <form onSubmit={handleEditRole} className="space-y-4 p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên vai trò <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nhập tên vai trò"
                            value={formValues.name}
                            onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mã vai trò <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="VD: ADMIN, USER, MANAGER"
                            value={formValues.code}
                            onChange={(e) => setFormValues(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Chỉ chứa chữ in hoa và dấu gạch dưới</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mô tả
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Nhập mô tả vai trò"
                            value={formValues.description}
                            onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Trạng thái
                        </label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={formValues.isActive}
                                onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isActive: checked }))}
                            />
                            <span className="text-sm text-gray-700">Kích hoạt</span>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsEditModalVisible(false);
                                setSelectedRole(null);
                                setFormValues({
                                    name: '',
                                    code: '',
                                    description: '',
                                    isActive: true
                                });
                            }}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            Cập nhật
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            {/* Modal quản lý quyền */}
            <ResponsiveDialog
                heading={`Quản lý quyền - ${selectedRole?.name || ''}`}
                open={isPermissionModalVisible}
                onClose={() => {
                    setIsPermissionModalVisible(false);
                    setSelectedRole(null);
                    setPermissionFormValues({ permissions: [] });
                }}
                actions={null}
                maxWidth={700}
                destroyOnClose
            >
                {selectedRole && (
                    <>
                        <Alert
                            message="Chọn các quyền cho vai trò này"
                            description="Bạn có thể chọn nhiều quyền. Các quyền đã chọn sẽ được áp dụng cho vai trò."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                        <form onSubmit={handleSavePermissions} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Danh sách quyền
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {permissions.length > 0 ? (
                                        permissions.map(permission => (
                                            <div key={permission.id} className="flex items-start space-x-2 p-3 border border-border rounded-lg hover:bg-background">
                                                <Checkbox
                                                    checked={permissionFormValues.permissions.includes(permission.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setPermissionFormValues(prev => ({
                                                                permissions: [...prev.permissions, permission.id]
                                                            }));
                                                        } else {
                                                            setPermissionFormValues(prev => ({
                                                                permissions: prev.permissions.filter(id => id !== permission.id)
                                                            }));
                                                        }
                                                    }}
                                                />
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <Key className="h-4 w-4 text-muted-foreground" />
                                                        <span className="font-semibold text-foreground">{permission.name}</span>
                                                        {permission.code && (
                                                            <StatusBadge className="bg-blue-100 text-blue-800">{permission.code}</StatusBadge>
                                                        )}
                                                    </div>
                                                    {permission.description && (
                                                        <div className="text-xs text-muted-foreground mt-1 ml-6">
                                                            {permission.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2">
                                            <Empty description="Không có quyền nào" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quyền hiện tại</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedRole.permissions.map(permission => (
                                                <StatusBadge key={permission.id} className="bg-green-100 text-green-800">
                                                    {permission.name}
                                                </StatusBadge>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsPermissionModalVisible(false);
                                        setSelectedRole(null);
                                        setPermissionFormValues({ permissions: [] });
                                    }}
                                >
                                    Hủy
                                </Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    Lưu quyền
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </ResponsiveDialog>

            {/* Modal chi tiết vai trò */}
            <ResponsiveDialog
                heading="Chi tiết vai trò"
                open={isDetailModalVisible}
                onClose={() => {
                    setIsDetailModalVisible(false);
                    setSelectedRole(null);
                }}
                actions={[
                    <Button key="close" onClick={() => {
                        setIsDetailModalVisible(false);
                        setSelectedRole(null);
                    }}>
                        Đóng
                    </Button>
                ]}
                maxWidth={700}
            >
                {selectedRole && (
                    <div>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-700">ID: </span>
                                <span className="text-foreground">{selectedRole.id || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Tên vai trò: </span>
                                <span className="text-foreground">{selectedRole.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Mã vai trò: </span>
                                <StatusBadge tone="blue">{selectedRole.code || 'N/A'}</StatusBadge>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Mô tả: </span>
                                <span className="text-foreground">{selectedRole.description || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Trạng thái: </span>
                                {renderStatus(selectedRole)}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Số quyền: </span>
                                <StatusBadge tone="purple">
                                    {selectedRole.permissions?.length || 0} quyền
                                </StatusBadge>
                            </div>
                            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                                <div>
                                    <Separator className="my-4">
                                        <span className="text-sm font-medium text-muted-foreground">Danh sách quyền</span>
                                    </Separator>
                                    <div>
                                        {selectedRole.permissions.map(permission => (
                                            <StatusBadge key={permission.id} tone="green" className="mb-2 mr-2">
                                                {permission.name}
                                                {permission.code && ` (${permission.code})`}
                                            </StatusBadge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ResponsiveDialog>
        </div>
    );
};

export default RolesPermissions;
