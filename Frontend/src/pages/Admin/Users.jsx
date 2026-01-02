import React, { useState, useMemo, useEffect } from 'react';
import { TableWrapper } from '../../components/ui/table-wrapper';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { Select } from '../../components/ui/select';
import { Tag } from '../../components/ui/tag';
import { Card } from '../../components/ui/card';
import { Statistic } from '../../components/ui/statistic';
import { Avatar } from '../../components/ui/avatar';
import { DatePicker } from '../../components/ui/date-picker';
import { InputNumber } from '../../components/ui/input-number';
import { Descriptions } from '../../components/ui/descriptions';
import {
  User,
  Edit,
  Trash2,
  Plus,
  Eye,
  Users,
  Crown,
  Ban,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import userService from '../../services/userService';
import useNotification from '../../hooks/useNotification';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const notification = useNotification();
  const [form] = useState({});
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch users từ API
  useEffect(() => {
    fetchUsers();
  }, [pagination.current, pagination.pageSize, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let response;

      // Nếu có filter theo role
      if (roleFilter !== 'all') {
        response = await userService.getUsersByRole(roleFilter.toUpperCase(), {
          page: pagination.current - 1,
          size: pagination.pageSize
        });
      } else {
        // Lấy tất cả users
        response = await userService.getAllUsers({
          page: pagination.current - 1,
          size: pagination.pageSize,
          sortBy: 'createdAt',
          sortDir: 'desc'
        });
      }

      // Xử lý response - có thể là response.data.data hoặc response.data
      const data = response.data?.data || response.data || response;
      console.log('Fetched users:', data);

      if (data.content) {
        // Response có pagination
        setUsers(data.content);
        setPagination(prev => ({
          ...prev,
          total: data.totalElements || 0
        }));
      } else if (Array.isArray(data)) {
        // Response là array
        setUsers(data);
        setPagination(prev => ({
          ...prev,
          total: data.length
        }));
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      notification.error('Không thể tải danh sách người dùng!');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Thống kê người dùng
  const userStats = useMemo(() => {
    const stats = {
      total: pagination.total || users.length,
      active: users.filter(user => user.isActive === true).length,
      inactive: users.filter(user => user.isActive === false).length,
      suspended: users.filter(user => user.isActive === false).length,
      admins: users.filter(user => user.roles?.includes('ADMIN')).length,
      vips: users.filter(user => user.roles?.includes('VIP')).length,
      moderators: users.filter(user => user.roles?.includes('MODERATOR')).length
    };
    return stats;
  }, [users, pagination.total]);

  // Lọc người dùng (client-side filter cho search và status)
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = !searchText ||
        user.fullName?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchText.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'active' && user.isActive === true) ||
        (statusFilter === 'inactive' && user.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [users, searchText, statusFilter]);

  // Xử lý thêm người dùng
  const handleAddUser = async (values) => {
    setLoading(true);
    try {
      const response = await userService.createUser(values);
      notification.success('Thêm người dùng thành công!');
      setIsAddModalVisible(false);
      form.resetFields();
      fetchUsers(); // Reload danh sách
    } catch (error) {
      console.error('Error adding user:', error);
      notification.error(error.response?.data?.message || 'Không thể thêm người dùng!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chỉnh sửa người dùng
  const handleEditUser = async (values) => {
    setLoading(true);
    try {
      await userService.updateUser(selectedUser.userId || selectedUser.id, values);
      notification.success('Cập nhật người dùng thành công!');
      setIsEditModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
      fetchUsers(); // Reload danh sách
    } catch (error) {
      console.error('Error updating user:', error);
      notification.error(error.response?.data?.message || 'Không thể cập nhật người dùng!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = async (userId) => {
    setLoading(true);
    try {
      await userService.deleteUser(userId);
      notification.success('Xóa người dùng thành công!');
      fetchUsers(); // Reload danh sách
    } catch (error) {
      console.error('Error deleting user:', error);
      notification.error(error.response?.data?.message || 'Không thể xóa người dùng!');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = async (userId, newStatus) => {
    setLoading(true);
    try {
      // Sử dụng API activate/deactivate riêng
      if (newStatus === 'active') {
        await userService.activateUser(userId);
      } else {
        await userService.deactivateUser(userId);
      }
      notification.success(`Đã ${newStatus === 'active' ? 'kích hoạt' : 'vô hiệu hóa'} người dùng!`);
      fetchUsers(); // Reload danh sách
    } catch (error) {
      console.error('Error updating user status:', error);
      notification.error(error.response?.data?.message || 'Không thể cập nhật trạng thái!');
    } finally {
      setLoading(false);
    }
  };

  // Hiển thị modal thêm/sửa
  const showAddModal = () => {
    setIsAddModalVisible(true);
    form.resetFields();
  };

  const showEditModal = (user) => {
    setSelectedUser(user);
    setIsEditModalVisible(true);
    form.setFieldsValue(user);
  };

  const showDetailModal = (user) => {
    setSelectedUser(user);
    setIsDetailModalVisible(true);
  };

  // Render trạng thái
  const renderStatus = (isActive) => {
    if (isActive) {
      return <Tag color="success" icon={<CheckCircleOutlined />}>Hoạt động</Tag>;
    } else {
      return <Tag color="default" icon={<StopOutlined />}>Không hoạt động</Tag>;
    }
  };

  // Render vai trò
  const renderRole = (role) => {
    // Xử lý cả trường hợp role là string hoặc array
    if (!role) {
      return <Tag color="green" icon={<UserOutlined />}>Người dùng</Tag>;
    }

    const roleConfig = {
      admin: { color: 'red', text: 'Quản trị viên', icon: <CrownOutlined /> },
      ADMIN: { color: 'red', text: 'Quản trị viên', icon: <CrownOutlined /> },
      moderator: { color: 'blue', text: 'Kiểm duyệt viên', icon: <UserOutlined /> },
      MODERATOR: { color: 'blue', text: 'Kiểm duyệt viên', icon: <UserOutlined /> },
      vip: { color: 'gold', text: 'VIP', icon: <CrownOutlined /> },
      VIP: { color: 'gold', text: 'VIP', icon: <CrownOutlined /> },
      user: { color: 'green', text: 'Người dùng', icon: <UserOutlined /> },
      USER: { color: 'green', text: 'Người dùng', icon: <UserOutlined /> }
    };

    // Nếu role là array
    if (Array.isArray(role)) {
      return (
        <Space size={[0, 4]} wrap>
          {role.map((r, index) => {
            const config = roleConfig[r] || roleConfig.user;
            return (
              <Tag key={index} color={config.color} icon={config.icon}>
                {config.text}
              </Tag>
            );
          })}
        </Space>
      );
    }

    // Nếu role là string
    const config = roleConfig[role] || roleConfig.user;
    return <Tag color={config.color} icon={config.icon}>{config.text}</Tag>;
  };

  // Cấu hình cột bảng
  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (avatar, record) => (
        <Avatar
          src={avatar}
          icon={<UserOutlined />}
          size={50}
          alt={record.fullName}
        />
      ),
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>{record.fullName}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>@{record.username}</div>
          <div style={{ color: '#666', fontSize: '12px' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: renderRole,
      filters: [
        { text: 'Quản trị viên', value: 'ADMIN' },
        { text: 'Kiểm duyệt viên', value: 'MODERATOR' },
        { text: 'VIP', value: 'VIP' },
        { text: 'Người dùng', value: 'USER' }
      ],
      onFilter: (value, record) => record.roles?.includes(value),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: renderStatus,
      filters: [
        { text: 'Hoạt động', value: true },
        { text: 'Không hoạt động', value: false }
      ],
      onFilter: (value, record) => record.isActive === value,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => showDetailModal(record)}
            size="small"
          >
            Xem
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            size="small"
          >
            Sửa
          </Button>
          {record.isActive ? (
            <Popconfirm
              title="Vô hiệu hóa người dùng này?"
              onConfirm={() => handleStatusChange(record.userId || record.id, 'inactive')}
              okText="Có"
              cancelText="Không"
            >
              <Button type="link" danger size="small">
                Khóa
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="Kích hoạt người dùng này?"
              onConfirm={() => handleStatusChange(record.userId || record.id, 'active')}
              okText="Có"
              cancelText="Không"
            >
              <Button type="link" size="small">
                Kích hoạt
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDeleteUser(record.userId || record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50bg-gray-900 py-8 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h1 className="text-3xl font-bold text-gray-900text-white">Quản lý người dùng</h1>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={showAddModal}
            size="large"
            className="rounded-lg"
          >
            Thêm người dùng
          </Button>
        </div>

        {/* Bộ lọc */}
        <Card className="bg-whitebg-gray-800 rounded-xl shadow-md border border-gray-200border-gray-700 mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Input.Search
              placeholder="Tìm kiếm theo tên, email, username..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="rounded-lg"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter}
              onChange={setStatusFilter}
              className="w-full rounded-lg"
            >
              <Option value="all">Tất cả trạng thái</Option>
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Không hoạt động</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Lọc theo vai trò"
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full rounded-lg"
            >
              <Option value="all">Tất cả vai trò</Option>
              <Option value="ADMIN">Quản trị viên</Option>
              <Option value="MODERATOR">Kiểm duyệt viên</Option>
              <Option value="VIP">VIP</Option>
              <Option value="USER">Người dùng</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Bảng người dùng */}
      <Card className="bg-whitebg-gray-800 rounded-xl shadow-md border border-gray-200border-gray-700">
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredUsers}
            rowKey={(record) => record.userId || record.id}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} người dùng`,
              onChange: (page, pageSize) => {
                setPagination(prev => ({
                  ...prev,
                  current: page,
                  pageSize: pageSize
                }));
              }
            }}
            scroll={{ x: 1200 }}
            className="[&_.ant-table]:bg-white[&_.ant-table]:bg-gray-800"
          />
        </Spin>
      </Card>

      {/* Modal thêm người dùng */}
      <Modal
        title="Thêm người dùng mới"
        open={isAddModalVisible}
        onCancel={() => {
          setIsAddModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' }
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                initialValue="USER"
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="USER">Người dùng</Option>
                  <Option value="VIP">VIP</Option>
                  <Option value="MODERATOR">Kiểm duyệt viên</Option>
                  <Option value="ADMIN">Quản trị viên</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Thêm người dùng
              </Button>
              <Button onClick={() => {
                setIsAddModalVisible(false);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa người dùng */}
      <Modal
        title="Chỉnh sửa người dùng"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditUser}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                  { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                ]}
              >
                <Input placeholder="Nhập tên đăng nhập" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[
                  { required: true, message: 'Vui lòng nhập họ và tên!' }
                ]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập email" disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phoneNumber"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' }
                ]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Cập nhật
              </Button>
              <Button onClick={() => {
                setIsEditModalVisible(false);
                setSelectedUser(null);
                form.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chi tiết người dùng */}
      <Modal
        title="Chi tiết người dùng"
        open={isDetailModalVisible}
        onCancel={() => {
          setIsDetailModalVisible(false);
          setSelectedUser(null);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setIsDetailModalVisible(false);
            setSelectedUser(null);
          }}>
            Đóng
          </Button>
        ]}
        width={700}
      >
        {selectedUser && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                src={selectedUser.avatar}
                size={80}
                icon={<UserOutlined />}
              />
              <h2 style={{ margin: '16px 0 8px 0' }}>{selectedUser.fullName}</h2>
              <Space>
                {renderRole(selectedUser.role)}
                {renderStatus(selectedUser.status)}
              </Space>
            </div>

            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên đăng nhập">{selectedUser.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{selectedUser.email}</Descriptions.Item>
              <Descriptions.Item label="Số điện thoại">{selectedUser.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Vai trò">{renderRole(selectedUser.roles)}</Descriptions.Item>
              <Descriptions.Item label="Trạng thái" span={2}>
                {renderStatus(selectedUser.isActive)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Users;
