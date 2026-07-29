import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { Tabs } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Pagination } from '@/components/ui/pagination';
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  Home,
  Users as UsersIcon,
  Loader2
} from 'lucide-react';
import userService from '@/services/userService';
import useNotification from '@/hooks/useNotification';

const Staff = () => {
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [staff, setStaff] = useState([]);
  const notification = useNotification();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    role: 'staff',
    isActive: true
  });

  const [loading, setLoading] = useState(false);

  // Helper function to format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'ChÆ°a cÃ³';
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        return date.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return dateValue;
    }
    if (dateValue.year && dateValue.month && dateValue.day) {
      // LocalDate object
      return `${String(dateValue.day).padStart(2, '0')}/${String(dateValue.month).padStart(2, '0')}/${dateValue.year}`;
    }
    return 'ChÆ°a cÃ³';
  };

  // Helper function to format LocalDate for input
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      // Extract date part (YYYY-MM-DD) from ISO string
      return dateValue.split('T')[0];
    }
    if (dateValue.year && dateValue.month && dateValue.day) {
      return `${dateValue.year}-${String(dateValue.month).padStart(2, '0')}-${String(dateValue.day).padStart(2, '0')}`;
    }
    return '';
  };

  // Load staff tá»« API
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const usersRes = await userService.getAllStaff({ page: 0, size: 10 });
        const usersData = usersRes?.content || usersRes?.data?.content || usersRes?.data || usersRes || [];

        const mappedStaff = (Array.isArray(usersData) ? usersData : []).map((u) => {
          const id = u.id;
          const name = u.fullName || 'N/A';
          const email = u.email || 'N/A';
          const phone = u.phone || '';
          const address = u.address || '';
          const avatarUrl = u.avatarUrl || '';
          const dateOfBirth = u.dateOfBirth;
          const role = u.role || 'staff';
          const loyaltyPoints = u.loyaltyPoints || 0;
          const membershipTier = u.membershipTier;
          const lastLogin = u.lastLogin;
          const isActive = u.isActive !== undefined ? u.isActive : true;
          const createdAt = u.createdAt;
          const updatedAt = u.updatedAt;

          // Generate avatar initials if no avatarUrl
          const avatar =
            avatarUrl ||
            (name && name.split(' ').map((n) => n[0]).join('').toUpperCase()) ||
            (email && email[0]?.toUpperCase()) ||
            'ST';

          return {
            id,
            name,
            email,
            phone,
            address,
            avatarUrl,
            dateOfBirth,
            role,
            loyaltyPoints,
            membershipTier,
            lastLogin: formatDate(lastLogin),
            lastLoginRaw: lastLogin,
            status: isActive ? 'active' : 'inactive',
            isActive,
            createdAt: formatDate(createdAt),
            updatedAt: formatDate(updatedAt),
            avatar,
            // Keep original data for API calls
            originalData: u
          };
        });

        setStaff(mappedStaff);
        setPagination(prev => ({
          ...prev,
          total: mappedStaff.length
        }));
      } catch (error) {
        console.error('Error loading staff:', error);
        notification.error('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u nhÃ¢n viÃªn');
        setPagination(prev => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Thá»‘ng kÃª Ä‘Æ¡n giáº£n
  const totalStaff = staff.length;
  const activeStaff = staff.filter(s => s.status === 'active').length;

  const handleStatusChange = async (checked, record) => {
    try {
      if (checked) {
        await userService.activateUser(record.id);
      } else {
        await userService.deactivateUser(record.id);
      }

      // Reload data
      const usersRes = await userService.getAllUsers({ page: 0, size: 50, sortBy: 'id', sortDir: 'asc' });
      const usersData = usersRes?.content || usersRes?.data?.content || usersRes?.data || usersRes || [];

      const mappedStaff = (Array.isArray(usersData) ? usersData : []).map((u) => {
        const id = u.id;
        const name = u.fullName || 'N/A';
        const email = u.email || 'N/A';
        const phone = u.phone || '';
        const address = u.address || '';
        const avatarUrl = u.avatarUrl || '';
        const dateOfBirth = u.dateOfBirth;
        const role = u.role || 'staff';
        const loyaltyPoints = u.loyaltyPoints || 0;
        const membershipTier = u.membershipTier;
        const lastLogin = u.lastLogin;
        const isActive = u.isActive !== undefined ? u.isActive : true;
        const createdAt = u.createdAt;
        const updatedAt = u.updatedAt;

        const avatar =
          avatarUrl ||
          (name && name.split(' ').map((n) => n[0]).join('').toUpperCase()) ||
          (email && email[0]?.toUpperCase()) ||
          'ST';

        return {
          id,
          name,
          email,
          phone,
          address,
          avatarUrl,
          dateOfBirth,
          role,
          loyaltyPoints,
          membershipTier,
          lastLogin: formatDate(lastLogin),
          lastLoginRaw: lastLogin,
          status: isActive ? 'active' : 'inactive',
          isActive,
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
          avatar,
          originalData: u
        };
      });

      setStaff(mappedStaff);
      notification.success(`ÄÃ£ ${checked ? 'kÃ­ch hoáº¡t' : 'vÃ´ hiá»‡u hÃ³a'} nhÃ¢n viÃªn ${record.name}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      notification.error(`KhÃ´ng thá»ƒ ${checked ? 'kÃ­ch hoáº¡t' : 'vÃ´ hiá»‡u hÃ³a'} nhÃ¢n viÃªn`);
    }
  };

  const handleEditStaff = (record) => {
    setSelectedStaff(record);
    setIsEditMode(true);
    setFormValues({
      fullName: record.name,
      email: record.email,
      password: '',
      phone: record.phone || '',
      address: record.address || '',
      dateOfBirth: formatDateForInput(record.dateOfBirth),
      role: record.role,
      isActive: record.isActive !== undefined ? record.isActive : true
    });
    setIsModalVisible(true);
  };

  const handleDeleteStaff = async (record) => {
    try {
      await userService.deleteUser(record.id);

      // Reload data
      const usersRes = await userService.getAllUsers({ page: 0, size: 50, sortBy: 'id', sortDir: 'asc' });
      const usersData = usersRes?.content || usersRes?.data?.content || usersRes?.data || usersRes || [];

      const mappedStaff = (Array.isArray(usersData) ? usersData : []).map((u) => {
        const id = u.id;
        const name = u.fullName || 'N/A';
        const email = u.email || 'N/A';
        const phone = u.phone || '';
        const address = u.address || '';
        const avatarUrl = u.avatarUrl || '';
        const dateOfBirth = u.dateOfBirth;
        const role = u.role || 'staff';
        const loyaltyPoints = u.loyaltyPoints || 0;
        const membershipTier = u.membershipTier;
        const lastLogin = u.lastLogin;
        const isActive = u.isActive !== undefined ? u.isActive : true;
        const createdAt = u.createdAt;
        const updatedAt = u.updatedAt;

        const avatar =
          avatarUrl ||
          (name && name.split(' ').map((n) => n[0]).join('').toUpperCase()) ||
          (email && email[0]?.toUpperCase()) ||
          'ST';

        return {
          id,
          name,
          email,
          phone,
          address,
          avatarUrl,
          dateOfBirth,
          role,
          loyaltyPoints,
          membershipTier,
          lastLogin: formatDate(lastLogin),
          lastLoginRaw: lastLogin,
          status: isActive ? 'active' : 'inactive',
          isActive,
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
          avatar,
          originalData: u
        };
      });

      setStaff(mappedStaff);
      notification.success(`ÄÃ£ xÃ³a nhÃ¢n viÃªn ${record.name}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      notification.error('KhÃ´ng thá»ƒ xÃ³a nhÃ¢n viÃªn');
    }
  };

  const handleCreateStaff = () => {
    setIsEditMode(false);
    setSelectedStaff(null);
    setFormValues({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      role: 'staff',
      isActive: true
    });
    setIsModalVisible(true);
  };

  const handleViewStaffDetail = (record) => {
    setSelectedStaff(record);
    setIsDetailModalVisible(true);
  };

  const handleModalOk = async (e) => {
    e?.preventDefault();
    try {
      // Form validation
      if (!formValues.fullName?.trim()) {
        notification.error('Vui lÃ²ng nháº­p há» tÃªn!');
        return;
      }
      if (!formValues.email?.trim()) {
        notification.error('Vui lÃ²ng nháº­p email!');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
        notification.error('Email khÃ´ng há»£p lá»‡!');
        return;
      }
      if (!isEditMode && !formValues.password?.trim()) {
        notification.error('Vui lÃ²ng nháº­p máº­t kháº©u!');
        return;
      }
      if (!isEditMode && formValues.password.length < 6) {
        notification.error('Máº­t kháº©u pháº£i cÃ³ Ã­t nháº¥t 6 kÃ½ tá»±!');
        return;
      }
      if (!formValues.role) {
        notification.error('Vui lÃ²ng chá»n vai trÃ²!');
        return;
      }

      const values = { ...formValues };

      if (isEditMode) {
        // Cáº­p nháº­t nhÃ¢n viÃªn
        const updateData = {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone || '',
          address: values.address || '',
          dateOfBirth: values.dateOfBirth || null,
          role: values.role,
          isActive: values.isActive !== undefined ? values.isActive : true
        };

        await userService.updateUser(selectedStaff.id, updateData);
        notification.success('ÄÃ£ cáº­p nháº­t thÃ´ng tin nhÃ¢n viÃªn');
      } else {
        // ThÃªm nhÃ¢n viÃªn má»›i
        const createData = {
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          phone: values.phone || '',
          address: values.address || '',
          dateOfBirth: values.dateOfBirth || null,
          role: values.role,
          isActive: values.isActive !== undefined ? values.isActive : true
        };

        await userService.createUser(createData);
        notification.success('ÄÃ£ thÃªm nhÃ¢n viÃªn má»›i');
      }

      // Reload data
      const usersRes = await userService.getAllUsers({ page: 0, size: 50, sortBy: 'id', sortDir: 'asc' });
      const usersData = usersRes?.content || usersRes?.data?.content || usersRes?.data || usersRes || [];

      const mappedStaff = (Array.isArray(usersData) ? usersData : []).map((u) => {
        const id = u.id;
        const name = u.fullName || 'N/A';
        const email = u.email || 'N/A';
        const phone = u.phone || '';
        const address = u.address || '';
        const avatarUrl = u.avatarUrl || '';
        const dateOfBirth = u.dateOfBirth;
        const role = u.role || 'staff';
        const loyaltyPoints = u.loyaltyPoints || 0;
        const membershipTier = u.membershipTier;
        const lastLogin = u.lastLogin;
        const isActive = u.isActive !== undefined ? u.isActive : true;
        const createdAt = u.createdAt;
        const updatedAt = u.updatedAt;

        const avatar =
          avatarUrl ||
          (name && name.split(' ').map((n) => n[0]).join('').toUpperCase()) ||
          (email && email[0]?.toUpperCase()) ||
          'ST';

        return {
          id,
          name,
          email,
          phone,
          address,
          avatarUrl,
          dateOfBirth,
          role,
          loyaltyPoints,
          membershipTier,
          lastLogin: formatDate(lastLogin),
          lastLoginRaw: lastLogin,
          status: isActive ? 'active' : 'inactive',
          isActive,
          createdAt: formatDate(createdAt),
          updatedAt: formatDate(updatedAt),
          avatar,
          originalData: u
        };
      });

      setStaff(mappedStaff);
      setIsModalVisible(false);
      setFormValues({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        role: 'staff',
        isActive: true
      });
    } catch (error) {
      console.error('Error saving user:', error);
      notification.error(error?.response?.data?.message || (isEditMode ? 'KhÃ´ng thá»ƒ cáº­p nháº­t nhÃ¢n viÃªn' : 'KhÃ´ng thá»ƒ thÃªm nhÃ¢n viÃªn má»›i'));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setSelectedStaff(null);
    setFormValues({
      fullName: '',
      email: '',
      password: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      role: 'staff',
      isActive: true
    });
  };

  // Handle table change (pagination)
  const handleTableChange = (page, pageSize) => {
    const newPageSize = pageSize || pagination.pageSize;
    setPagination(prev => ({
      current: page,
      pageSize: newPageSize,
      total: prev.total
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (current, newPageSize) => {
    setPagination(prev => ({
      current: 1,
      pageSize: newPageSize,
      total: prev.total
    }));
  };

  // Get paginated staff
  const getPaginatedStaff = () => {
    const start = (pagination.current - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    return staff.slice(start, end);
  };

  const columns = [
    {
      title: 'NhÃ¢n viÃªn',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 bg-indigo-600 font-semibold text-white">
            {record.avatarUrl ? (
              <AvatarImage src={record.avatarUrl} />
            ) : null}
            <AvatarFallback className="bg-indigo-600 text-white">
              {record.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-800">{text}</div>
            <div className="text-xs text-gray-500">{record.email}</div>
            <div className="text-xs text-gray-500">
              {record.role === 'admin'
                ? 'Quáº£n lÃ½ há»‡ thá»‘ng'
                : record.role === 'manager'
                  ? 'Quáº£n lÃ½ ráº¡p'
                  : record.role === 'staff'
                    ? 'NhÃ¢n viÃªn bÃ¡n vÃ©'
                    : 'NhÃ¢n viÃªn'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trÃ²',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleConfig = {
          admin: { color: 'red', text: 'Quáº£n trá»‹ viÃªn' },
          manager: { color: 'orange', text: 'Quáº£n lÃ½' },
          staff: { color: 'blue', text: 'NhÃ¢n viÃªn' }
        };
        const config = roleConfig[role] || { color: 'default', text: role };
        return <StatusBadge tone={config.color}>{config.text}</StatusBadge>;
      }
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div className="flex items-center gap-2">
          {status === 'active' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <span className={status === 'active' ? 'text-green-500' : 'text-red-500'}>
            {status === 'active' ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'}
          </span>
          <label className="relative inline-flex items-center cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={status === 'active'}
              onChange={(e) => handleStatusChange(e.target.checked, record)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      )
    },
    {
      title: 'ÄÄƒng nháº­p cuá»‘i',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => (
        <div className="text-xs text-gray-500">
          {date}
        </div>
      )
    },
    {
      title: 'Thao tÃ¡c',
      key: 'actions',
      render: (_, record) => (
        <TooltipProvider>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleViewStaffDetail(record)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xem chi tiáº¿t</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => handleEditStaff(record)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chá»‰nh sá»­a</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n xÃ³a nhÃ¢n viÃªn nÃ y?\nHÃ nh Ä‘á»™ng nÃ y khÃ´ng thá»ƒ hoÃ n tÃ¡c.')) {
                      handleDeleteStaff(record);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>XÃ³a</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      )
    }
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
            title: 'Quáº£n lÃ½ nhÃ¢n viÃªn',
            icon: <UsersIcon className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <Card className="mb-6 shadow-lg border-0 bg-white">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <UsersIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 m-0">
                Quáº£n lÃ½ nhÃ¢n viÃªn
              </h2>
              <p className="text-gray-500 text-sm m-0 mt-1">
                Quáº£n lÃ½ nhÃ¢n viÃªn, vai trÃ² vÃ  quyá»n háº¡n trong há»‡ thá»‘ng
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg border-0 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 m-0">Danh sÃ¡ch nhÃ¢n viÃªn</h3>
            <Button
              onClick={handleCreateStaff}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              ThÃªm NhÃ¢n viÃªn
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Äang táº£i dá»¯ liá»‡u...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center">
              <Empty description="ChÆ°a cÃ³ nhÃ¢n viÃªn nÃ o" />
            </div>
          ) : (
            <>
              <DataTable
                fields={columns}
                data={getPaginatedStaff()}
                getRowId="id"
                pageControls={false}
                className="mt-4"
              />
              {pagination.total > 0 && (
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Hiá»ƒn thá»‹ {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tá»•ng sá»‘ {pagination.total} nhÃ¢n viÃªn
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
        </div>
      </Card>

      <ResponsiveDialog
        heading={isEditMode ? "Chá»‰nh sá»­a nhÃ¢n viÃªn" : "ThÃªm nhÃ¢n viÃªn má»›i"}
        open={isModalVisible}
        onClose={handleModalCancel}
        maxWidth={600}
        actions={null}
      >
        <form onSubmit={handleModalOk} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Há» vÃ  tÃªn <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nháº­p há» vÃ  tÃªn"
                value={formValues.fullName}
                onChange={(e) => setFormValues({ ...formValues, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Nháº­p email"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Máº­t kháº©u <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Nháº­p máº­t kháº©u (tá»‘i thiá»ƒu 6 kÃ½ tá»±)"
                value={formValues.password}
                onChange={(e) => setFormValues({ ...formValues, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Sá»‘ Ä‘iá»‡n thoáº¡i
              </label>
              <Input
                placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                NgÃ y sinh
              </label>
              <Input
                type="date"
                value={formValues.dateOfBirth}
                onChange={(e) => setFormValues({ ...formValues, dateOfBirth: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Äá»‹a chá»‰
            </label>
            <Textarea
              rows={2}
              placeholder="Nháº­p Ä‘á»‹a chá»‰"
              value={formValues.address}
              onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vai trÃ² <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.role}
                onValueChange={(value) => setFormValues({ ...formValues, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chá»n vai trÃ²" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quáº£n trá»‹ viÃªn</SelectItem>
                  <SelectItem value="manager">Quáº£n lÃ½</SelectItem>
                  <SelectItem value="staff">NhÃ¢n viÃªn</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tráº¡ng thÃ¡i
              </label>
              <div className="flex items-center gap-3 pt-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formValues.isActive}
                    onChange={(e) => setFormValues({ ...formValues, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
                <span className="text-sm text-gray-600">
                  {formValues.isActive ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalCancel}
            >
              Há»§y
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isEditMode ? "Cáº­p nháº­t" : "ThÃªm"}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiáº¿t nhÃ¢n viÃªn"
        open={isDetailModalVisible}
        onClose={() => setIsDetailModalVisible(false)}
        actions={[
          <Button key="close" variant="outline" onClick={() => setIsDetailModalVisible(false)}>
            ÄÃ³ng
          </Button>,
          <Button
            key="edit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => {
              setIsDetailModalVisible(false);
              handleEditStaff(selectedStaff);
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            Chá»‰nh sá»­a
          </Button>
        ]}
        maxWidth={600}
      >
        {selectedStaff && (
          <div className="mt-4">
            <div className="text-center mb-6">
              <Avatar className="h-20 w-20 bg-indigo-600 font-semibold text-white mx-auto mb-4">
                {selectedStaff.avatarUrl ? (
                  <AvatarImage src={selectedStaff.avatarUrl} />
                ) : null}
                <AvatarFallback className="bg-indigo-600 text-white">
                  {selectedStaff.avatar}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-1">{selectedStaff.name}</h3>
              <p className="text-gray-500 text-sm">{selectedStaff.email}</p>
            </div>

            <DetailList columns={1} className="border border-gray-200 rounded-lg p-4">
              <DetailItem label="Email">
                {selectedStaff.email}
              </DetailItem>
              {selectedStaff.phone && (
                <DetailItem label="Sá»‘ Ä‘iá»‡n thoáº¡i">
                  {selectedStaff.phone}
                </DetailItem>
              )}
              {selectedStaff.address && (
                <DetailItem label="Äá»‹a chá»‰">
                  {selectedStaff.address}
                </DetailItem>
              )}
              {selectedStaff.dateOfBirth && (
                <DetailItem label="NgÃ y sinh">
                  {formatDate(selectedStaff.dateOfBirth)}
                </DetailItem>
              )}
              <DetailItem label="Vai trÃ²">
                <StatusBadge tone={selectedStaff.role === 'admin' ? 'red' : selectedStaff.role === 'manager' ? 'orange' : 'blue'}>
                  {selectedStaff.role === 'admin'
                    ? 'Quáº£n trá»‹ viÃªn'
                    : selectedStaff.role === 'manager'
                      ? 'Quáº£n lÃ½'
                      : 'NhÃ¢n viÃªn'}
                </StatusBadge>
              </DetailItem>
              <DetailItem label="Tráº¡ng thÃ¡i">
                <StatusBadge tone={selectedStaff.status === 'active' ? 'green' : 'red'}>
                  {selectedStaff.status === 'active' ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'}
                </StatusBadge>
              </DetailItem>
              {selectedStaff.loyaltyPoints !== undefined && (
                <DetailItem label="Äiá»ƒm tÃ­ch lÅ©y">
                  {selectedStaff.loyaltyPoints}
                </DetailItem>
              )}
              {selectedStaff.membershipTier && (
                <DetailItem label="Háº¡ng thÃ nh viÃªn">
                  {selectedStaff.membershipTier}
                </DetailItem>
              )}
              <DetailItem label="ÄÄƒng nháº­p cuá»‘i">
                {selectedStaff.lastLogin || 'ChÆ°a Ä‘Äƒng nháº­p'}
              </DetailItem>
              <DetailItem label="NgÃ y táº¡o">
                {selectedStaff.createdAt || 'N/A'}
              </DetailItem>
              <DetailItem label="Cáº­p nháº­t láº§n cuá»‘i">
                {selectedStaff.updatedAt || 'N/A'}
              </DetailItem>
            </DetailList>
          </div>
        )}
      </ResponsiveDialog>

    </div>
  );
};

export default Staff;
