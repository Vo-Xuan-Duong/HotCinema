import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { TableWrapper } from '@/components/ui/table-wrapper';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Tag } from '@/components/ui/tag';
import { Tabs } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Empty } from '@/components/ui/empty';
import { Descriptions } from '@/components/ui/descriptions';
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
    if (!dateValue) return 'Chưa có';
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
    return 'Chưa có';
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

  // Load staff từ API
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
        notification.error('Không thể tải dữ liệu nhân viên');
        setPagination(prev => ({ ...prev, total: 0 }));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Thống kê đơn giản
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
      notification.success(`Đã ${checked ? 'kích hoạt' : 'vô hiệu hóa'} nhân viên ${record.name}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      notification.error(`Không thể ${checked ? 'kích hoạt' : 'vô hiệu hóa'} nhân viên`);
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
      notification.success(`Đã xóa nhân viên ${record.name}`);
    } catch (error) {
      console.error('Error deleting user:', error);
      notification.error('Không thể xóa nhân viên');
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
        notification.error('Vui lòng nhập họ tên!');
        return;
      }
      if (!formValues.email?.trim()) {
        notification.error('Vui lòng nhập email!');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) {
        notification.error('Email không hợp lệ!');
        return;
      }
      if (!isEditMode && !formValues.password?.trim()) {
        notification.error('Vui lòng nhập mật khẩu!');
        return;
      }
      if (!isEditMode && formValues.password.length < 6) {
        notification.error('Mật khẩu phải có ít nhất 6 ký tự!');
        return;
      }
      if (!formValues.role) {
        notification.error('Vui lòng chọn vai trò!');
        return;
      }

      const values = { ...formValues };

      if (isEditMode) {
        // Cập nhật nhân viên
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
        notification.success('Đã cập nhật thông tin nhân viên');
      } else {
        // Thêm nhân viên mới
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
        notification.success('Đã thêm nhân viên mới');
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
      notification.error(error?.response?.data?.message || (isEditMode ? 'Không thể cập nhật nhân viên' : 'Không thể thêm nhân viên mới'));
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
      title: 'Nhân viên',
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
                ? 'Quản lý hệ thống'
                : record.role === 'manager'
                  ? 'Quản lý rạp'
                  : record.role === 'staff'
                    ? 'Nhân viên bán vé'
                    : 'Nhân viên'}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const roleConfig = {
          admin: { color: 'red', text: 'Quản trị viên' },
          manager: { color: 'orange', text: 'Quản lý' },
          staff: { color: 'blue', text: 'Nhân viên' }
        };
        const config = roleConfig[role] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Trạng thái',
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
            {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
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
      title: 'Đăng nhập cuối',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      render: (date) => (
        <div className="text-xs text-gray-500">
          {date}
        </div>
      )
    },
    {
      title: 'Thao tác',
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
              <TooltipContent>Xem chi tiết</TooltipContent>
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
              <TooltipContent>Chỉnh sửa</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc muốn xóa nhân viên này?\nHành động này không thể hoàn tác.')) {
                      handleDeleteStaff(record);
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Xóa</TooltipContent>
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
            title: 'Quản lý nhân viên',
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
                Quản lý nhân viên
              </h2>
              <p className="text-gray-500 text-sm m-0 mt-1">
                Quản lý nhân viên, vai trò và quyền hạn trong hệ thống
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card className="shadow-lg border-0 bg-white">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900 m-0">Danh sách nhân viên</h3>
            <Button
              onClick={handleCreateStaff}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm Nhân viên
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="p-12 text-center">
              <Empty description="Chưa có nhân viên nào" />
            </div>
          ) : (
            <>
              <TableWrapper
                columns={columns}
                data={getPaginatedStaff()}
                rowKey="id"
                pagination={false}
                className="mt-4"
              />
              {pagination.total > 0 && (
                <div className="mt-4 flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(pagination.current - 1) * pagination.pageSize + 1} - {Math.min(pagination.current * pagination.pageSize, pagination.total)} trong tổng số {pagination.total} nhân viên
                  </div>
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={pagination.total}
                    showSizeChanger={true}
                    showQuickJumper={true}
                    onChange={handleTableChange}
                    onShowSizeChange={handlePageSizeChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </Card>

      <Modal
        title={isEditMode ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={null}
      >
        <form onSubmit={handleModalOk} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập họ và tên"
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
                placeholder="Nhập email"
                value={formValues.email}
                onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
                required
              />
            </div>
          </div>

          {!isEditMode && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
                Số điện thoại
              </label>
              <Input
                placeholder="Nhập số điện thoại"
                value={formValues.phone}
                onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Ngày sinh
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
              Địa chỉ
            </label>
            <Textarea
              rows={2}
              placeholder="Nhập địa chỉ"
              value={formValues.address}
              onChange={(e) => setFormValues({ ...formValues, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.role}
                onValueChange={(value) => setFormValues({ ...formValues, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Quản trị viên</SelectItem>
                  <SelectItem value="manager">Quản lý</SelectItem>
                  <SelectItem value="staff">Nhân viên</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Trạng thái
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
                  {formValues.isActive ? 'Hoạt động' : 'Không hoạt động'}
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
              Hủy
            </Button>
            <Button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isEditMode ? "Cập nhật" : "Thêm"}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Chi tiết nhân viên"
        open={isDetailModalVisible}
        onCancel={() => setIsDetailModalVisible(false)}
        footer={[
          <Button key="close" variant="outline" onClick={() => setIsDetailModalVisible(false)}>
            Đóng
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
            Chỉnh sửa
          </Button>
        ]}
        width={600}
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

            <Descriptions column={1} className="border border-gray-200 rounded-lg p-4">
              <Descriptions.Item label="Email">
                {selectedStaff.email}
              </Descriptions.Item>
              {selectedStaff.phone && (
                <Descriptions.Item label="Số điện thoại">
                  {selectedStaff.phone}
                </Descriptions.Item>
              )}
              {selectedStaff.address && (
                <Descriptions.Item label="Địa chỉ">
                  {selectedStaff.address}
                </Descriptions.Item>
              )}
              {selectedStaff.dateOfBirth && (
                <Descriptions.Item label="Ngày sinh">
                  {formatDate(selectedStaff.dateOfBirth)}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Vai trò">
                <Tag color={selectedStaff.role === 'admin' ? 'red' : selectedStaff.role === 'manager' ? 'orange' : 'blue'}>
                  {selectedStaff.role === 'admin'
                    ? 'Quản trị viên'
                    : selectedStaff.role === 'manager'
                      ? 'Quản lý'
                      : 'Nhân viên'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={selectedStaff.status === 'active' ? 'green' : 'red'}>
                  {selectedStaff.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                </Tag>
              </Descriptions.Item>
              {selectedStaff.loyaltyPoints !== undefined && (
                <Descriptions.Item label="Điểm tích lũy">
                  {selectedStaff.loyaltyPoints}
                </Descriptions.Item>
              )}
              {selectedStaff.membershipTier && (
                <Descriptions.Item label="Hạng thành viên">
                  {selectedStaff.membershipTier}
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Đăng nhập cuối">
                {selectedStaff.lastLogin || 'Chưa đăng nhập'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {selectedStaff.createdAt || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cập nhật lần cuối">
                {selectedStaff.updatedAt || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default Staff;