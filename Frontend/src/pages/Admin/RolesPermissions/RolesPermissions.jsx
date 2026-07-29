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
            showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch quyá»n');
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
            showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch vai trÃ²');
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
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng nháº­p tÃªn vai trÃ²!');
                return;
            }
            if (!formValues.code?.trim()) {
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng nháº­p mÃ£ vai trÃ²!');
                return;
            }
            if (!/^[A-Z_]+$/.test(formValues.code)) {
                showNotification('error', 'Lá»—i', 'MÃ£ vai trÃ² chá»‰ chá»©a chá»¯ in hoa vÃ  dáº¥u gáº¡ch dÆ°á»›i!');
                return;
            }

            const createData = {
                name: formValues.name.trim(),
                code: formValues.code.trim(),
                description: formValues.description?.trim() || '',
                isActive: formValues.isActive !== undefined ? formValues.isActive : true
            };
            await roleService.createRole(createData);
            showNotification('success', 'ThÃ nh cÃ´ng', 'ThÃªm vai trÃ² thÃ nh cÃ´ng!');
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
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ thÃªm vai trÃ²');
        }
    };

    // Handle edit role
    const handleEditRole = async (e) => {
        e?.preventDefault();
        try {
            // Validation
            if (!formValues.name?.trim()) {
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng nháº­p tÃªn vai trÃ²!');
                return;
            }
            if (!formValues.code?.trim()) {
                showNotification('error', 'Lá»—i', 'Vui lÃ²ng nháº­p mÃ£ vai trÃ²!');
                return;
            }
            if (!/^[A-Z_]+$/.test(formValues.code)) {
                showNotification('error', 'Lá»—i', 'MÃ£ vai trÃ² chá»‰ chá»©a chá»¯ in hoa vÃ  dáº¥u gáº¡ch dÆ°á»›i!');
                return;
            }

            const updateData = {
                name: formValues.name.trim(),
                code: formValues.code.trim(),
                description: formValues.description?.trim() || '',
                isActive: formValues.isActive !== undefined ? formValues.isActive : selectedRole.isActive
            };
            await roleService.updateRole(selectedRole.id, updateData);
            showNotification('success', 'ThÃ nh cÃ´ng', 'Cáº­p nháº­t vai trÃ² thÃ nh cÃ´ng!');
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
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t vai trÃ²');
        }
    };

    // Handle delete role
    const handleDeleteRole = async (id) => {
        try {
            await roleService.deleteRole(id);
            showNotification('success', 'ThÃ nh cÃ´ng', 'XÃ³a vai trÃ² thÃ nh cÃ´ng!');
            loadRoles();
        } catch (error) {
            console.error('Error deleting role:', error);
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a vai trÃ²');
        }
    };

    // Handle status change
    const handleStatusChange = async (id, isActive) => {
        try {
            if (isActive) {
                await roleService.activateRole(id);
                showNotification('success', 'ThÃ nh cÃ´ng', 'ÄÃ£ kÃ­ch hoáº¡t vai trÃ²!');
            } else {
                await roleService.deactivateRole(id);
                showNotification('success', 'ThÃ nh cÃ´ng', 'ÄÃ£ vÃ´ hiá»‡u hÃ³a vai trÃ²!');
            }
            loadRoles();
        } catch (error) {
            console.error('Error changing role status:', error);
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ thay Ä‘á»•i tráº¡ng thÃ¡i vai trÃ²');
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

            showNotification('success', 'ThÃ nh cÃ´ng', 'Cáº­p nháº­t quyá»n thÃ nh cÃ´ng!');
            setIsPermissionModalVisible(false);
            setSelectedRole(null);
            setPermissionFormValues({ permissions: [] });
            loadRoles();
        } catch (error) {
            console.error('Error saving permissions:', error);
            showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t quyá»n');
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
            showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i chi tiáº¿t vai trÃ²');
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
                {isActive ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'}
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
                <span className="text-gray-600 font-medium">#{id}</span>
            ),
        },
        {
            title: 'Vai trÃ²',
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
                            className="font-semibold text-gray-900 mb-1 text-base cursor-pointer hover:text-primary transition-colors"
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
                                    {record.permissions.length} quyá»n
                                </StatusBadge>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'MÃ´ táº£',
            dataIndex: 'description',
            key: 'description',
            ellipsis: {
                showTitle: true,
            },
            render: (text) => (
                <span className={text ? "text-gray-600" : "text-gray-400"}>
                    {text || '-'}
                </span>
            ),
        },
        {
            title: 'Sá»‘ quyá»n',
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
            title: 'Tráº¡ng thÃ¡i',
            key: 'status',
            width: 140,
            align: 'center',
            filters: [
                { text: 'Hoáº¡t Ä‘á»™ng', value: 'active' },
                { text: 'KhÃ´ng hoáº¡t Ä‘á»™ng', value: 'inactive' },
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
            title: 'Thao tÃ¡c',
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
                            title="Xem chi tiáº¿t"
                        >
                            <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showEditModal(record)}
                            className="h-8 w-8 p-0 hover:bg-orange-50 hover:text-orange-600"
                            title="Chá»‰nh sá»­a"
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => showPermissionModal(record)}
                            className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                            title="Quáº£n lÃ½ quyá»n"
                        >
                            <Settings className="h-4 w-4" />
                        </Button>
                        {isActive ? (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('VÃ´ hiá»‡u hÃ³a vai trÃ² nÃ y?\nVai trÃ² sáº½ khÃ´ng thá»ƒ sá»­ dá»¥ng sau khi bá»‹ vÃ´ hiá»‡u hÃ³a.')) {
                                        handleStatusChange(record.id, false);
                                    }
                                }}
                                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                                title="VÃ´ hiá»‡u hÃ³a"
                            >
                                <Ban className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    if (window.confirm('KÃ­ch hoáº¡t vai trÃ² nÃ y?')) {
                                        handleStatusChange(record.id, true);
                                    }
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                                title="KÃ­ch hoáº¡t"
                            >
                                <CheckCircle2 className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                if (window.confirm('XÃ³a vai trÃ² nÃ y?\nHÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c. Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a?')) {
                                    handleDeleteRole(record.id);
                                }
                            }}
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                            title="XÃ³a"
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
                        title: 'Quáº£n lÃ½ vai trÃ² vÃ  quyá»n',
                        icon: <Shield className="h-4 w-4" />
                    }
                ]}
            />

            {/* Header */}
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 m-0 mb-2">
                            Quáº£n lÃ½ vai trÃ² vÃ  quyá»n
                        </h2>
                        <p className="text-gray-500 text-sm m-0">
                            Quáº£n lÃ½ vai trÃ² vÃ  phÃ¢n quyá»n cho ngÆ°á»i dÃ¹ng trong há»‡ thá»‘ng
                        </p>
                    </div>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
                        onClick={showAddModal}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        ThÃªm vai trÃ²
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <Metric
                        label="Tá»•ng vai trÃ²"
                        value={roleStats.total}
                        leading={<Shield className="h-4 w-4" />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
                <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <Metric
                        label="Vai trÃ² hoáº¡t Ä‘á»™ng"
                        value={roleStats.active}
                        leading={<CheckCircle2 className="h-4 w-4" />}
                        valueStyle={{ color: '#52c41a' }}
                    />
                </Card>
                <Card className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
                    <Metric
                        label="Vai trÃ² khÃ´ng hoáº¡t Ä‘á»™ng"
                        value={roleStats.inactive}
                        leading={<Ban className="h-4 w-4" />}
                        valueStyle={{ color: '#ff4d4f' }}
                    />
                </Card>
            </div>

            {/* Filter Card */}
            <Card
                className="p-4 bg-white rounded-xl shadow-md border border-gray-200 mb-6"
                bodyStyle={{ padding: '16px' }}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <div className="relative">
                            <Input
                                placeholder="TÃ¬m kiáº¿m theo tÃªn, mÃ£ hoáº·c mÃ´ táº£..."
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
                                <SelectValue placeholder="Lá»c theo tráº¡ng thÃ¡i" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Táº¥t cáº£</SelectItem>
                                <SelectItem value="active">Hoáº¡t Ä‘á»™ng</SelectItem>
                                <SelectItem value="inactive">KhÃ´ng hoáº¡t Ä‘á»™ng</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {/* Table Card */}
            <Card
                className="bg-white rounded-xl shadow-md border border-gray-200 p-6"
                ref={tableRef}
            >
                {loading ? (
                    <div className="p-12 text-center">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
                        <p className="text-gray-500">Äang táº£i dá»¯ liá»‡u...</p>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="p-12 text-center">
                        <Empty description="ChÆ°a cÃ³ vai trÃ² nÃ o" />
                    </div>
                ) : (
                    <>
                        <DataTable
                            fields={columns}
                            data={roles}
                            getRowId="id"
                            pageControls={false}
                            className="overflow-x-auto border border-gray-200 rounded-lg"
                        />
                        {pagination.total > 0 && (
                            <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                                <div className="text-sm text-gray-600">
                                    Hiá»ƒn thá»‹ {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tá»•ng sá»‘ {pagination.total} vai trÃ²
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

            {/* Modal thÃªm vai trÃ² */}
            <ResponsiveDialog
                heading="ThÃªm vai trÃ² má»›i"
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
                            TÃªn vai trÃ² <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nháº­p tÃªn vai trÃ²"
                            value={formValues.name}
                            onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MÃ£ vai trÃ² <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="VD: ADMIN, USER, MANAGER"
                            value={formValues.code}
                            onChange={(e) => setFormValues(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">Chá»‰ chá»©a chá»¯ in hoa vÃ  dáº¥u gáº¡ch dÆ°á»›i</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MÃ´ táº£
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Nháº­p mÃ´ táº£ vai trÃ²"
                            value={formValues.description}
                            onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tráº¡ng thÃ¡i
                        </label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={formValues.isActive}
                                onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isActive: checked }))}
                            />
                            <span className="text-sm text-gray-700">KÃ­ch hoáº¡t ngay sau khi táº¡o</span>
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
                            Há»§y
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            ThÃªm vai trÃ²
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            {/* Modal chá»‰nh sá»­a vai trÃ² */}
            <ResponsiveDialog
                heading="Chá»‰nh sá»­a vai trÃ²"
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
                            TÃªn vai trÃ² <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="Nháº­p tÃªn vai trÃ²"
                            value={formValues.name}
                            onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MÃ£ vai trÃ² <span className="text-red-500">*</span>
                        </label>
                        <Input
                            placeholder="VD: ADMIN, USER, MANAGER"
                            value={formValues.code}
                            onChange={(e) => setFormValues(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                        />
                        <p className="text-xs text-gray-500 mt-1">Chá»‰ chá»©a chá»¯ in hoa vÃ  dáº¥u gáº¡ch dÆ°á»›i</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            MÃ´ táº£
                        </label>
                        <Textarea
                            rows={4}
                            placeholder="Nháº­p mÃ´ táº£ vai trÃ²"
                            value={formValues.description}
                            onChange={(e) => setFormValues(prev => ({ ...prev, description: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tráº¡ng thÃ¡i
                        </label>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={formValues.isActive}
                                onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, isActive: checked }))}
                            />
                            <span className="text-sm text-gray-700">KÃ­ch hoáº¡t</span>
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
                            Há»§y
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            Cáº­p nháº­t
                        </Button>
                    </div>
                </form>
            </ResponsiveDialog>

            {/* Modal quáº£n lÃ½ quyá»n */}
            <ResponsiveDialog
                heading={`Quáº£n lÃ½ quyá»n - ${selectedRole?.name || ''}`}
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
                            message="Chá»n cÃ¡c quyá»n cho vai trÃ² nÃ y"
                            description="Báº¡n cÃ³ thá»ƒ chá»n nhiá»u quyá»n. CÃ¡c quyá»n Ä‘Ã£ chá»n sáº½ Ä‘Æ°á»£c Ã¡p dá»¥ng cho vai trÃ²."
                            type="info"
                            showIcon
                            className="mb-4"
                        />
                        <form onSubmit={handleSavePermissions} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Danh sÃ¡ch quyá»n
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {permissions.length > 0 ? (
                                        permissions.map(permission => (
                                            <div key={permission.id} className="flex items-start space-x-2 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
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
                                                        <Key className="h-4 w-4 text-gray-600" />
                                                        <span className="font-semibold text-gray-900">{permission.name}</span>
                                                        {permission.code && (
                                                            <StatusBadge className="bg-blue-100 text-blue-800">{permission.code}</StatusBadge>
                                                        )}
                                                    </div>
                                                    {permission.description && (
                                                        <div className="text-xs text-gray-500 mt-1 ml-6">
                                                            {permission.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-2">
                                            <Empty description="KhÃ´ng cÃ³ quyá»n nÃ o" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Quyá»n hiá»‡n táº¡i</h4>
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
                                    Há»§y
                                </Button>
                                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                                    LÆ°u quyá»n
                                </Button>
                            </div>
                        </form>
                    </>
                )}
            </ResponsiveDialog>

            {/* Modal chi tiáº¿t vai trÃ² */}
            <ResponsiveDialog
                heading="Chi tiáº¿t vai trÃ²"
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
                        ÄÃ³ng
                    </Button>
                ]}
                maxWidth={700}
            >
                {selectedRole && (
                    <div>
                        <div className="space-y-4">
                            <div>
                                <span className="font-semibold text-gray-700">ID: </span>
                                <span className="text-gray-900">{selectedRole.id || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">TÃªn vai trÃ²: </span>
                                <span className="text-gray-900">{selectedRole.name || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">MÃ£ vai trÃ²: </span>
                                <StatusBadge tone="blue">{selectedRole.code || 'N/A'}</StatusBadge>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">MÃ´ táº£: </span>
                                <span className="text-gray-900">{selectedRole.description || 'N/A'}</span>
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Tráº¡ng thÃ¡i: </span>
                                {renderStatus(selectedRole)}
                            </div>
                            <div>
                                <span className="font-semibold text-gray-700">Sá»‘ quyá»n: </span>
                                <StatusBadge tone="purple">
                                    {selectedRole.permissions?.length || 0} quyá»n
                                </StatusBadge>
                            </div>
                            {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                                <div>
                                    <Separator className="my-4">
                                        <span className="text-sm font-medium text-gray-500">Danh sÃ¡ch quyá»n</span>
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
