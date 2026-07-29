import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card } from '@/components/ui/card';
import { Metric } from '@/components/ui/metric';
import { Avatar } from '@/components/ui/avatar';
import { NumberStepper } from '@/components/ui/number-stepper';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import {
  User,
  Edit,
  Trash2,
  Plus,
  Eye,
  Users as UsersIcon,
  Crown,
  Ban,
  CheckCircle2,
  Home,
  Search,
  Loader2
} from 'lucide-react';
import userService from '@/services/userService';
import roleService from '@/services/roleService';
import { useNotification } from '@/hooks/useNotification';

const Users = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const tableRef = useRef(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    role: '',
    status: 'active'
  });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [roles, setRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load roles on mount
  useEffect(() => {
    loadRoles();
  }, []);

  // Load users from API
  useEffect(() => {
    loadUsers();
  }, [pagination.current, pagination.pageSize, statusFilter, roleFilter, searchText]);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      const response = await roleService.getAllRolesList();
      // Handle response structure
      const rolesData = response?.data?.data || response?.data || [];
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch vai trÃ²');
      setRoles([]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);

      const params = {
        page: pagination.current - 1, // Backend uses 0-based indexing
        size: pagination.pageSize,
        sortBy: 'id',
        sortDir: 'desc'
      };

      let response;
      if (searchText) {
        // Use search API when there's search text
        response = await userService.searchUsers(searchText, {
          page: pagination.current - 1,
          size: pagination.pageSize
        });
      } else {
        // Use regular getAllUsers
        response = await userService.getAllCustomers(params);
      }

      // Handle response structure
      const usersData = response?.data?.content || response?.data?.data || response?.data || [];
      const total = response?.data?.totalElements || response?.data?.total || usersData.length;

      // Apply client-side filters if needed (for status and role)
      let filteredData = usersData;
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(user => {
          // Map backend status to frontend status
          const userStatus = user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : user.status;
          return userStatus === statusFilter;
        });
      }
      if (roleFilter !== 'all') {
        filteredData = filteredData.filter(user => {
          // Map backend role to frontend role
          const userRole = user.role;
          // Compare with role code or role name
          return userRole === roleFilter ||
            roles.some(r => (r.code || r.name) === roleFilter && (r.code || r.name) === userRole);
        });
      }

      setUsers(filteredData);
      setPagination(prev => ({
        ...prev,
        total: filteredData.length < usersData.length ? filteredData.length : total
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      showNotification('error', 'Lá»—i', 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch ngÆ°á»i dÃ¹ng');
      setUsers([]);
      setPagination(prev => ({ ...prev, total: 0 }));
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from loaded users
  const userStats = {
    total: pagination.total,
    active: users.filter(user => {
      const status = user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : user.status;
      return status === 'active';
    }).length,
    inactive: users.filter(user => {
      const status = user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : user.status;
      return status === 'inactive';
    }).length,
    suspended: users.filter(user => {
      const status = user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : user.status;
      return status === 'suspended';
    }).length,
    admins: users.filter(user => {
      const role = user.role;
      const adminRole = roles.find(r =>
        r.name?.toLowerCase().includes('admin') ||
        r.code?.toLowerCase() === 'admin' ||
        r.name?.toLowerCase() === 'quáº£n trá»‹ viÃªn'
      );
      return adminRole && (role === adminRole.code || role === adminRole.name);
    }).length,
    vips: users.filter(user => {
      const role = user.role;
      const vipRole = roles.find(r =>
        r.name?.toLowerCase().includes('vip') ||
        r.code?.toLowerCase() === 'vip'
      );
      return vipRole && (role === vipRole.code || role === vipRole.name);
    }).length,
    moderators: users.filter(user => {
      const role = user.role;
      const moderatorRole = roles.find(r =>
        r.name?.toLowerCase().includes('moderator') ||
        r.code?.toLowerCase() === 'moderator' ||
        r.name?.toLowerCase().includes('kiá»ƒm duyá»‡t')
      );
      return moderatorRole && (role === moderatorRole.code || role === moderatorRole.name);
    }).length
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: pagination.total
    });

    // Scroll to table when page changes
    if (newPagination.current !== pagination.current && tableRef.current) {
      setTimeout(() => {
        tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  // Handle filter changes
  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  // Xá»­ lÃ½ thÃªm ngÆ°á»i dÃ¹ng
  const handleAddUser = async (values) => {
    try {
      // Find the selected role from roles list
      const selectedRole = roles.find(r =>
        (r.code || r.name) === values.role ||
        r.code === values.role ||
        r.name === values.role
      );

      // Map form values to backend format
      const createData = {
        fullName: values.fullName,
        email: values.email,
        password: values.password, // Backend requires password
        phone: values.phone,
        address: values.address,
        role: selectedRole ? (selectedRole.code || selectedRole.name) : values.role, // Use role code or name from API
        isActive: values.status === 'active'
      };

      await userService.createUser(createData);
      showNotification('success', 'ThÃ nh cÃ´ng', 'ThÃªm ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng!');
      setIsAddModalVisible(false);
      setFormValues({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        role: '',
        status: 'active'
      });
      loadUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ thÃªm ngÆ°á»i dÃ¹ng');
    }
  };

  // Xá»­ lÃ½ chá»‰nh sá»­a ngÆ°á»i dÃ¹ng
  const handleEditUser = async (values) => {
    try {
      // Find the selected role from roles list
      const selectedRole = roles.find(r =>
        (r.code || r.name) === values.role ||
        r.code === values.role ||
        r.name === values.role
      );

      // Map form values to backend format
      const updateData = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        role: selectedRole ? (selectedRole.code || selectedRole.name) : values.role, // Use role code or name from API
        isActive: values.status === 'active'
      };

      await userService.updateUser(selectedUser.id, updateData);
      showNotification('success', 'ThÃ nh cÃ´ng', 'Cáº­p nháº­t ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng!');
      setIsEditModalVisible(false);
      setSelectedUser(null);
      setFormValues({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        role: '',
        status: 'active'
      });
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t ngÆ°á»i dÃ¹ng');
    }
  };

  // Xá»­ lÃ½ xÃ³a ngÆ°á»i dÃ¹ng
  const handleDeleteUser = async (id) => {
    try {
      await userService.deleteUser(id);
      showNotification('success', 'ThÃ nh cÃ´ng', 'XÃ³a ngÆ°á»i dÃ¹ng thÃ nh cÃ´ng!');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ xÃ³a ngÆ°á»i dÃ¹ng');
    }
  };

  // Xá»­ lÃ½ thay Ä‘á»•i tráº¡ng thÃ¡i
  const handleStatusChange = async (id, newStatus) => {
    try {
      if (newStatus === 'active') {
        await userService.activateUser(id);
        showNotification('success', 'ThÃ nh cÃ´ng', 'ÄÃ£ kÃ­ch hoáº¡t ngÆ°á»i dÃ¹ng!');
      } else {
        await userService.deactivateUser(id);
        showNotification('success', 'ThÃ nh cÃ´ng', 'ÄÃ£ vÃ´ hiá»‡u hÃ³a ngÆ°á»i dÃ¹ng!');
      }
      loadUsers();
    } catch (error) {
      console.error('Error changing user status:', error);
      showNotification('error', 'Lá»—i', error.response?.data?.message || 'KhÃ´ng thá»ƒ thay Ä‘á»•i tráº¡ng thÃ¡i ngÆ°á»i dÃ¹ng');
    }
  };

  // Hiá»ƒn thá»‹ modal thÃªm/sá»­a
  const showAddModal = async () => {
    // Ensure roles are loaded before opening modal
    if (roles.length === 0) {
      await loadRoles();
    }
    setIsAddModalVisible(true);
    setFormValues({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      role: '',
      status: 'active'
    });
  };

  const showEditModal = async (user) => {
    // Ensure roles are loaded before opening modal
    if (roles.length === 0) {
      await loadRoles();
    }
    setSelectedUser(user);
    setIsEditModalVisible(true);
    // Map backend data to form values
    // Find the role that matches user's role
    const userRole = roles.find(r =>
      (r.code || r.name) === user.role ||
      r.code === user.role ||
      r.name === user.role
    );
    setFormValues({
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      role: userRole ? (userRole.code || userRole.name) : user.role || '',
      status: user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : 'inactive'
    });
  };

  const showDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  // Render tráº¡ng thÃ¡i
  const renderStatus = (user) => {
    if (!user) return null;
    // Map backend status to frontend status
    const status = user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : user.status;
    const statusConfig = {
      active: {
        color: 'success',
        text: 'Hoáº¡t Ä‘á»™ng',
        icon: <CheckCircle2 className="h-3 w-3" />,
        style: {
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          color: '#52c41a',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      },
      inactive: {
        color: 'default',
        text: 'KhÃ´ng hoáº¡t Ä‘á»™ng',
        icon: <Ban className="h-3 w-3" />,
        style: {
          background: '#fafafa',
          border: '1px solid #d9d9d9',
          color: '#8c8c8c',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      },
      suspended: {
        color: 'error',
        text: 'Táº¡m khÃ³a',
        icon: <Ban className="h-3 w-3" />,
        style: {
          background: '#fff2f0',
          border: '1px solid #ffccc7',
          color: '#ff4d4f',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      }
    };

    const config = statusConfig[status] || statusConfig.inactive;
    return (
      <StatusBadge
        tone={config.color}
        className="flex items-center gap-1"
        style={config.style}
      >
        {config.icon}
        {config.text}
      </StatusBadge>
    );
  };

  // Render vai trÃ²
  const renderRole = (user) => {
    if (!user) return null;
    // Backend returns role as String directly
    const role = user.role || '';
    const roleName = typeof role === 'string' ? role.toLowerCase() : role;
    const roleConfig = {
      admin: {
        color: 'red',
        text: 'Quáº£n trá»‹ viÃªn',
        icon: <Crown className="h-3 w-3" />,
        style: {
          background: '#fff1f0',
          border: '1px solid #ffccc7',
          color: '#cf1322',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      },
      moderator: {
        color: 'blue',
        text: 'Kiá»ƒm duyá»‡t viÃªn',
        icon: <User className="h-3 w-3" />,
        style: {
          background: '#e6f7ff',
          border: '1px solid #91d5ff',
          color: '#1890ff',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      },
      vip: {
        color: 'gold',
        text: 'VIP',
        icon: <Crown className="h-3 w-3" />,
        style: {
          background: '#fffbe6',
          border: '1px solid #ffe58f',
          color: '#d48806',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      },
      user: {
        color: 'green',
        text: 'NgÆ°á»i dÃ¹ng',
        icon: <User className="h-3 w-3" />,
        style: {
          background: '#f6ffed',
          border: '1px solid #b7eb8f',
          color: '#52c41a',
          padding: '4px 12px',
          borderRadius: '6px',
          fontWeight: 500
        }
      }
    };

    const config = roleConfig[roleName] || roleConfig.user;
    return (
      <StatusBadge
        tone={config.color}
        className="flex items-center gap-1"
        style={config.style}
      >
        {config.icon}
        {config.text}
      </StatusBadge>
    );
  };

  // Cáº¥u hÃ¬nh cá»™t báº£ng
  const columns = [
    {
      title: 'NgÆ°á»i dÃ¹ng',
      key: 'user',
      width: 320,
      fixed: 'left',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={record?.avatar || record?.avatarUrl}
            icon={<User className="h-6 w-6" />}
            size={56}
            alt={record?.fullName || 'User'}
            className="flex-shrink-0"
            style={{
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="font-semibold text-gray-900 mb-1 text-base cursor-pointer hover:text-indigo-600 transition-colors"
              onClick={() => showDetailModal(record)}
            >
              {record?.fullName || 'N/A'}
            </div>
            <div className="text-gray-500 text-xs mb-1 flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate">ID: {record?.id || 'N/A'}</span>
            </div>
            <div className="text-gray-500 text-xs truncate">
              {record?.email || 'N/A'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Sá»‘ Ä‘iá»‡n thoáº¡i',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone, record) => (
        <span className="text-gray-700">{phone || <span className="text-gray-400">-</span>}</span>
      ),
    },
    {
      title: 'Vai trÃ²',
      key: 'role',
      width: 160,
      render: (_, record) => renderRole(record),
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      key: 'status',
      width: 150,
      render: (_, record) => renderStatus(record),
    },
    {
      title: 'Thao tÃ¡c',
      key: 'actions',
      width: 280,
      fixed: 'right',
      render: (_, record) => {
        if (!record) return null;
        const userId = record.id;
        const userStatus = record.isActive !== undefined ? (record.isActive ? 'active' : 'inactive') : 'inactive';
        return (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => showDetailModal(record)}
              className="h-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-all"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => showEditModal(record)}
              className="h-8 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300 transition-all"
            >
              <Edit className="h-4 w-4" />
            </Button>
            {userStatus === 'active' ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('VÃ´ hiá»‡u hÃ³a ngÆ°á»i dÃ¹ng nÃ y? NgÆ°á»i dÃ¹ng sáº½ khÃ´ng thá»ƒ Ä‘Äƒng nháº­p sau khi bá»‹ vÃ´ hiá»‡u hÃ³a.')) {
                    handleStatusChange(userId, 'inactive');
                  }
                }}
                className="h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
              >
                <Ban className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm('KÃ­ch hoáº¡t ngÆ°á»i dÃ¹ng nÃ y? NgÆ°á»i dÃ¹ng sáº½ cÃ³ thá»ƒ Ä‘Äƒng nháº­p láº¡i sau khi Ä‘Æ°á»£c kÃ­ch hoáº¡t.')) {
                    handleStatusChange(userId, 'active');
                  }
                }}
                className="h-8 hover:bg-green-50 hover:text-green-600 hover:border-green-300 transition-all"
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (window.confirm('Báº¡n cÃ³ cháº¯c cháº¯n muá»‘n xÃ³a ngÆ°á»i dÃ¹ng nÃ y? HÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.')) {
                  handleDeleteUser(userId);
                }
              }}
              className="h-8 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all"
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
            title: 'Quáº£n lÃ½ ngÆ°á»i dÃ¹ng',
            icon: <UsersIcon className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="m-0 text-gray-800 text-2xl font-bold">Quáº£n lÃ½ ngÆ°á»i dÃ¹ng</h2>
              <p className="text-gray-500 mt-1">Quáº£n lÃ½ táº¥t cáº£ ngÆ°á»i dÃ¹ng trong há»‡ thá»‘ng</p>
            </div>
          </div>
          <Button
            onClick={showAddModal}
            size="lg"
            className="rounded-lg shadow-md hover:shadow-lg transition-shadow bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            ThÃªm ngÆ°á»i dÃ¹ng
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Metric
              label="Tá»•ng ngÆ°á»i dÃ¹ng"
              value={userStats.total}
              leading={<UsersIcon className="h-4 w-4 text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
          <Card className="p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Metric
              label="Äang hoáº¡t Ä‘á»™ng"
              value={userStats.active}
              leading={<CheckCircle2 className="h-4 w-4 text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Metric
              label="Táº¡m khÃ³a"
              value={userStats.suspended}
              leading={<Ban className="h-4 w-4 text-red-500" />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
          <Card className="p-4 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <Metric
              label="Quáº£n trá»‹ viÃªn"
              value={userStats.admins}
              leading={<Crown className="h-4 w-4 text-yellow-500" />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </div>

        {/* Bá»™ lá»c */}
        <Card className="rounded-xl shadow-md border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="TÃ¬m kiáº¿m theo tÃªn, email..."
                  value={searchText}
                  onChange={(e) => {
                    setSearchText(e.target.value);
                    setPagination(prev => ({ ...prev, current: 1 }));
                  }}
                  className="rounded-lg pl-10"
                />
              </div>
            </div>
            <div>
              <Select
                value={statusFilter || "all"}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder="Lá»c theo tráº¡ng thÃ¡i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Táº¥t cáº£ tráº¡ng thÃ¡i</SelectItem>
                  <SelectItem value="active">Hoáº¡t Ä‘á»™ng</SelectItem>
                  <SelectItem value="inactive">KhÃ´ng hoáº¡t Ä‘á»™ng</SelectItem>
                  <SelectItem value="suspended">Táº¡m khÃ³a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Báº£ng ngÆ°á»i dÃ¹ng */}
        <Card
          className="bg-white rounded-xl shadow-md border border-gray-200"
          ref={tableRef}
        >
          <div className="p-6">
            {loading ? (
              <div className="p-12 text-center">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-indigo-600 mb-4" />
                <p className="text-gray-500">Äang táº£i dá»¯ liá»‡u...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <User className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">KhÃ´ng cÃ³ ngÆ°á»i dÃ¹ng nÃ o</p>
                <p className="text-gray-400 text-sm mt-2">HÃ£y thÃªm ngÆ°á»i dÃ¹ng má»›i Ä‘á»ƒ báº¯t Ä‘áº§u</p>
              </div>
            ) : (
              <DataTable
                fields={columns}
                rows={users}
                getRowId={(record) => record?.id || Math.random()}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Modal thÃªm ngÆ°á»i dÃ¹ng */}
      <ResponsiveDialog
        heading="ThÃªm ngÆ°á»i dÃ¹ng má»›i"
        open={isAddModalVisible}
        onClose={() => {
          setIsAddModalVisible(false);
          setFormValues({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            role: '',
            status: 'active'
          });
        }}
        actions={null}
        maxWidth={600}
        destroyOnClose
      >
        <form onSubmit={(e) => {
          e.preventDefault();
          // Validate required fields
          if (!formValues.fullName || !formValues.email || !formValues.phone || !formValues.role) {
            showNotification('error', 'Lá»—i', 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c');
            return;
          }
          const values = {
            ...formValues,
            password: (e.target.querySelector('input[name="password"]') || {}).value || ''
          };
          handleAddUser(values);
        }}>
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Há» vÃ  tÃªn <span className="text-red-500">*</span></label>
                <Input
                  value={formValues.fullName}
                  onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                  placeholder="Nháº­p há» vÃ  tÃªn"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">Email <span className="text-red-500">*</span></label>
                <Input
                  value={formValues.email}
                  onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                  type="email"
                  placeholder="Nháº­p email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Máº­t kháº©u <span className="text-red-500">*</span></label>
                <Input name="password" type="password" placeholder="Nháº­p máº­t kháº©u" required minLength={6} />
                <p className="text-xs text-gray-500 mt-1">Tá»‘i thiá»ƒu 6 kÃ½ tá»±</p>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Sá»‘ Ä‘iá»‡n thoáº¡i <span className="text-red-500">*</span></label>
                <Input
                  value={formValues.phone}
                  onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                  placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                  required
                  pattern="[0-9]{10,11}"
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-semibold">Äá»‹a chá»‰</label>
              <Input
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                placeholder="Nháº­p Ä‘á»‹a chá»‰"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">Vai trÃ² <span className="text-red-500">*</span></label>
                <Select
                  value={formValues.role}
                  onValueChange={(value) => setFormValues({ ...formValues, role: value })}
                  disabled={loadingRoles}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder={loadingRoles ? "Äang táº£i..." : roles.length === 0 ? "ChÆ°a cÃ³ vai trÃ² nÃ o" : "Chá»n vai trÃ²"} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.length > 0 && roles.map(role => (
                      <SelectItem key={role.id} value={role.code || role.name}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">Tráº¡ng thÃ¡i <span className="text-red-500">*</span></label>
                <Select
                  value={formValues.status}
                  onValueChange={(value) => setFormValues({ ...formValues, status: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Hoáº¡t Ä‘á»™ng</SelectItem>
                    <SelectItem value="inactive">KhÃ´ng hoáº¡t Ä‘á»™ng</SelectItem>
                    <SelectItem value="suspended">Táº¡m khÃ³a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="submit">
                ThÃªm ngÆ°á»i dÃ¹ng
              </Button>
              <Button variant="outline" onClick={() => {
                setIsAddModalVisible(false);
                setFormValues({
                  fullName: '',
                  email: '',
                  phone: '',
                  address: '',
                  role: '',
                  status: 'active'
                });
              }}>
                Há»§y
              </Button>
            </div>
          </div>
        </form>
      </ResponsiveDialog>

      {/* Modal chá»‰nh sá»­a ngÆ°á»i dÃ¹ng */}
      <ResponsiveDialog
        heading="Chá»‰nh sá»­a ngÆ°á»i dÃ¹ng"
        open={isEditModalVisible}
        onClose={() => {
          setIsEditModalVisible(false);
          setSelectedUser(null);
          setFormValues({
            fullName: '',
            email: '',
            phone: '',
            address: '',
            role: '',
            status: 'active'
          });
        }}
        actions={null}
        maxWidth={600}
        destroyOnClose
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            // Validate required fields
            if (!formValues.fullName || !formValues.email || !formValues.phone || !formValues.role) {
              showNotification('error', 'Lá»—i', 'Vui lÃ²ng Ä‘iá»n Ä‘áº§y Ä‘á»§ thÃ´ng tin báº¯t buá»™c');
              return;
            }
            handleEditUser(formValues);
          }}
          className="space-y-6 p-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Há» vÃ  tÃªn <span className="text-red-500">*</span>
              </label>
              <Input
                value={formValues.fullName}
                onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                placeholder="Nháº­p há» vÃ  tÃªn"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                type="email"
                placeholder="Nháº­p email"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sá»‘ Ä‘iá»‡n thoáº¡i <span className="text-red-500">*</span>
              </label>
              <Input
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
                placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                required
                pattern="[0-9]{10,11}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Äá»‹a chá»‰
              </label>
              <Input
                value={formValues.address}
                onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
                placeholder="Nháº­p Ä‘á»‹a chá»‰"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trÃ² <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.role}
                onValueChange={(value) => setFormValues({ ...formValues, role: value })}
                disabled={loadingRoles}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder={loadingRoles ? "Äang táº£i..." : roles.length === 0 ? "ChÆ°a cÃ³ vai trÃ² nÃ o" : "Chá»n vai trÃ²"} />
                </SelectTrigger>
                <SelectContent>
                  {roles.length > 0 && roles.map(role => (
                    <SelectItem key={role.id} value={role.code || role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tráº¡ng thÃ¡i <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.status}
                onValueChange={(value) => setFormValues({ ...formValues, status: value })}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Hoáº¡t Ä‘á»™ng</SelectItem>
                  <SelectItem value="inactive">KhÃ´ng hoáº¡t Ä‘á»™ng</SelectItem>
                  <SelectItem value="suspended">Táº¡m khÃ³a</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white h-10"
            >
              Cáº­p nháº­t
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditModalVisible(false);
                setSelectedUser(null);
                setFormValues({
                  fullName: '',
                  email: '',
                  phone: '',
                  address: '',
                  role: '',
                  status: 'active'
                });
              }}
              className="h-10"
            >
              Há»§y
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      {/* Modal chi tiáº¿t ngÆ°á»i dÃ¹ng */}
      <ResponsiveDialog
        heading="Chi tiáº¿t ngÆ°á»i dÃ¹ng"
        open={isDetailModalVisible}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedUser(null);
        }}
        actions={
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setIsDetailModalVisible(false);
                setSelectedUser(null);
              }}
            >
              ÄÃ³ng
            </Button>
          </div>
        }
        maxWidth={700}
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="text-center pb-6 border-b border-gray-200">
              <Avatar
                src={selectedUser.avatar || selectedUser.avatarUrl}
                size={80}
                icon={<User className="h-10 w-10" />}
                className="mx-auto mb-4"
              />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">{selectedUser.fullName || 'N/A'}</h2>
              <div className="flex items-center justify-center gap-2">
                {renderRole(selectedUser)}
                {renderStatus(selectedUser)}
              </div>
            </div>

            <DetailList columns={2} className="gap-4">
              <DetailItem label="ID">{selectedUser.id || 'N/A'}</DetailItem>
              <DetailItem label="Email">{selectedUser.email || 'N/A'}</DetailItem>
              <DetailItem label="Há» vÃ  tÃªn">{selectedUser.fullName || 'N/A'}</DetailItem>
              <DetailItem label="Sá»‘ Ä‘iá»‡n thoáº¡i">{selectedUser.phone || 'N/A'}</DetailItem>
              <DetailItem label="Äá»‹a chá»‰">{selectedUser.address || 'N/A'}</DetailItem>
              <DetailItem label="NgÃ y sinh">
                {selectedUser.dateOfBirth
                  ? new Date(selectedUser.dateOfBirth).toLocaleDateString('vi-VN')
                  : 'N/A'
                }
              </DetailItem>
              <DetailItem label="Vai trÃ²">{renderRole(selectedUser)}</DetailItem>
              <DetailItem label="Tráº¡ng thÃ¡i">{renderStatus(selectedUser)}</DetailItem>
              <DetailItem label="Äiá»ƒm tÃ­ch lÅ©y">
                <span className="font-semibold text-blue-600">
                  {selectedUser.loyaltyPoints || 0} Ä‘iá»ƒm
                </span>
              </DetailItem>
              <DetailItem label="Háº¡ng thÃ nh viÃªn">
                {selectedUser.membershipTier ? (
                  <StatusBadge tone="gold">{selectedUser.membershipTier}</StatusBadge>
                ) : (
                  'N/A'
                )}
              </DetailItem>
              <DetailItem label="Láº§n Ä‘Äƒng nháº­p cuá»‘i">
                {selectedUser.lastLogin
                  ? new Date(selectedUser.lastLogin).toLocaleDateString('vi-VN') + ' ' +
                  new Date(selectedUser.lastLogin).toLocaleTimeString('vi-VN')
                  : 'ChÆ°a Ä‘Äƒng nháº­p'
                }
              </DetailItem>
              <DetailItem label="NgÃ y táº¡o">
                {selectedUser.createdAt
                  ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN') + ' ' +
                  new Date(selectedUser.createdAt).toLocaleTimeString('vi-VN')
                  : 'N/A'
                }
              </DetailItem>
              <DetailItem label="NgÃ y cáº­p nháº­t">
                {selectedUser.updatedAt
                  ? new Date(selectedUser.updatedAt).toLocaleDateString('vi-VN') + ' ' +
                  new Date(selectedUser.updatedAt).toLocaleTimeString('vi-VN')
                  : 'N/A'
                }
              </DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Users;
