import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { TableWrapper } from '../../../components/ui/table-wrapper';
import { Button } from '../../../components/ui/button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { Textarea } from '../../../components/ui/textarea';
import { Tag } from '../../../components/ui/tag';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { List } from '../../../components/ui/list';
import { Badge } from '../../../components/ui/badge-count';
import { Progress } from '../../../components/ui/progress';
import { Tooltip } from '../../../components/ui/tooltip';
import { Empty } from '../../../components/ui/empty';
import { Breadcrumb } from '../../../components/ui/breadcrumb';
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Home,
  Loader2
} from 'lucide-react';
import useNotification from '../../../hooks/useNotification';

const Notifications = () => {
  const navigate = useNavigate();
  const [notificationList, setNotificationList] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const notification = useNotification();
  const [form] = useState({});
  const [loading, setLoading] = useState(true);
  const [templateList, setTemplateList] = useState([]);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [templateModalType, setTemplateModalType] = useState('create');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateForm] = useState({});

  // Helper function to format datetime for input
  const formatDateTimeForInput = (dateValue) => {
    if (!dateValue) return '';
    if (typeof dateValue === 'string') {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        // Format: YYYY-MM-DDTHH:mm
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      }
      return dateValue;
    }
    return '';
  };

  // Helper function to format datetime for display
  const formatDateTime = (dateValue) => {
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
    return 'Chưa có';
  };

  useEffect(() => {
    // TODO: Load from API when backend is ready
    // For now, use empty array
    setNotificationList([]);
    setLoading(false);
  }, []);

  const handleCreateNotification = () => {
    setModalType('create');
    setSelectedNotification(null);
    if (form.resetFields) form.resetFields();
    setIsModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      // Form validation will be handled manually
      const formData = new FormData(e.target);
      const values = {
        title: formData.get('title'),
        content: formData.get('content'),
        type: formData.get('type'),
        priority: formData.get('priority'),
        schedule: formData.get('schedule')
      };

      if (modalType === 'create') {
        // Tạo mới
        const newNotification = {
          ...values,
          id: Date.now(),
          schedule: values.schedule || new Date().toISOString(),
          createdAt: new Date().toLocaleString('vi-VN'),
          sentTo: 0,
          opened: 0,
          status: 'Chưa gửi'
        };
        setNotificationList([newNotification, ...notificationList]);
        notification.success('Tạo thông báo thành công!');
      } else if (modalType === 'edit' && selectedNotification) {
        // Sửa
        const updatedList = notificationList.map(item =>
          item.id === selectedNotification.id
            ? {
              ...item,
              ...values,
              schedule: values.schedule || item.schedule
            }
            : item
        );
        setNotificationList(updatedList);
        notification.success('Cập nhật thông báo thành công!');
      }
      setIsModalVisible(false);
      setSelectedNotification(null);
      if (form.resetFields) form.resetFields();
    } catch (error) {
      if (error.errorFields) {
        // Form validation errors
        return;
      }
      console.error('Error:', error);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedNotification(null);
    if (form.resetFields) form.resetFields();
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: text => <a>{text}</a>,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
    },
    {
      title: 'Loại thông báo',
      dataIndex: 'type',
      key: 'type',
      render: text => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Mức độ ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: text => <Tag color={text === 'Khẩn cấp' ? 'red' : text === 'Quan trọng' ? 'orange' : 'green'}>{text}</Tag>,
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'schedule',
      key: 'schedule',
      render: text => <span>{formatDateTime(text)}</span>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleViewNotification(record)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleEditNotification(record)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600"
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
                handleDeleteNotification(record.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleViewNotification = (record) => {
    setSelectedNotification(record);
    setModalType('view');
    // Form values will be set via form state
    // form.setFieldsValue({
    //   ...record,
    //   schedule: formatDateTimeForInput(record.schedule)
    // });
    setIsModalVisible(true);
  };

  const handleEditNotification = (record) => {
    setSelectedNotification(record);
    setModalType('edit');
    // Form values will be set via form state
    // form.setFieldsValue({
    //   ...record,
    //   schedule: formatDateTimeForInput(record.schedule)
    // });
    setIsModalVisible(true);
  };

  const handleDeleteNotification = (id) => {
    setNotificationList(notificationList.filter(item => item.id !== id));
    notification.success('Xóa thông báo thành công!');
  };

  // Template CRUD
  const handleCreateTemplate = () => {
    setTemplateModalType('create');
    setSelectedTemplate(null);
    if (templateForm.resetFields) templateForm.resetFields();
    setIsTemplateModalVisible(true);
  };

  const handleEditTemplate = (record) => {
    setSelectedTemplate(record);
    setTemplateModalType('edit');
    // Form values will be set via form state
    setIsTemplateModalVisible(true);
  };

  const handleDeleteTemplate = (id) => {
    setTemplateList(templateList.filter(item => item.id !== id));
    notification.success('Xóa template thành công!');
  };

  const handleTemplateModalOk = () => {
    // Form validation will be handled manually
    // templateForm.validateFields().then(values => {
    const values = {}; // Get from form state
    if (templateModalType === 'create') {
        const newTemplate = {
          ...values,
          id: Date.now()
        };
        setTemplateList([newTemplate, ...templateList]);
        notification.success('Tạo template thành công!');
      } else if (templateModalType === 'edit' && selectedTemplate) {
        const updatedList = templateList.map(item =>
          item.id === selectedTemplate.id ? { ...item, ...values } : item
        );
        setTemplateList(updatedList);
        notification.success('Cập nhật template thành công!');
      }
    setIsTemplateModalVisible(false);
    setSelectedTemplate(null);
    if (templateForm.resetFields) templateForm.resetFields();
    // });
  };

  const handleTemplateModalCancel = () => {
    setIsTemplateModalVisible(false);
    setSelectedTemplate(null);
    if (templateForm.resetFields) templateForm.resetFields();
  };

  // Áp dụng template khi tạo thông báo mới
  const handleApplyTemplate = (template) => {
    setModalType('create');
    setIsModalVisible(true);
    // Form values will be set via form state
    // form.setFieldsValue({
    //   ...template,
    //   schedule: null
    // });
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-4"
        items={[
          {
            title: (
              <span
                onClick={() => navigate('/admin/dashboard')}
                className="cursor-pointer hover:text-primary transition-colors"
              >
                <HomeOutlined /> Dashboard
              </span>
            ),
          },
          {
            title: 'Quản lý thông báo',
          },
        ]}
      />

      <div className="mb-6">
        <Title level={2} className="m-0">
          Quản lý thông báo
        </Title>
        <Text className="text-gray-600">
          Quản lý và gửi thông báo đến người dùng
        </Text>
      </div>

      {/* Notification List & Tabs */}
      <Card className="rounded-xl shadow-md border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <Title level={4} className="m-0">Danh sách thông báo</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateNotification}
            className="rounded-lg"
          >
            + Tạo thông báo
          </Button>
        </div>
        <Tabs
          defaultActiveKey="all"
          items={[
            {
              key: 'all',
              label: 'Tất cả',
              children: (
                loading ? <Spin /> :
                  <Table
                    columns={columns}
                    dataSource={notificationList}
                    rowKey="id"
                    className="mt-4"
                    loading={loading}
                    pagination={{
                      total: notificationList.length,
                      pageSize: 10,
                      showSizeChanger: true,
                      showQuickJumper: true,
                      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} thông báo`
                    }}
                  />
              )
            },
            {
              key: 'templates',
              label: 'Template',
              children: (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="m-0">Danh sách template</Title>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleCreateTemplate}
                      className="rounded-lg"
                    >
                      + Tạo template
                    </Button>
                  </div>
                  <Table
                    columns={[
                      {
                        title: 'Tiêu đề',
                        dataIndex: 'title',
                        key: 'title',
                      },
                      {
                        title: 'Nội dung',
                        dataIndex: 'content',
                        key: 'content',
                      },
                      {
                        title: 'Loại',
                        dataIndex: 'type',
                        key: 'type',
                        render: text => <Tag color="blue">{text}</Tag>,
                      },
                      {
                        title: 'Mức độ',
                        dataIndex: 'priority',
                        key: 'priority',
                        render: text => <Tag color={text === 'Khẩn cấp' ? 'red' : text === 'Quan trọng' ? 'orange' : 'green'}>{text}</Tag>,
                      },
                      {
                        title: 'Hành động',
                        key: 'action',
                        render: (_, record) => (
                          <Space size="middle">
                            <Button icon={<EditOutlined />} onClick={() => handleEditTemplate(record)} />
                            <Popconfirm
                              title="Bạn có chắc chắn muốn xóa template này?"
                              onConfirm={() => handleDeleteTemplate(record.id)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <Button icon={<DeleteOutlined />} />
                            </Popconfirm>
                            <Button icon={<SendOutlined />} onClick={() => handleApplyTemplate(record)}>
                              Áp dụng
                            </Button>
                          </Space>
                        )
                      }
                    ]}
                    dataSource={templateList}
                    rowKey="id"
                    pagination={false}
                    locale={{ emptyText: <Empty description="Chưa có template nào" /> }}
                  />
                </div>
              )
            },
            {
              key: 'analytics',
              label: 'Phân tích',
              children: (
                <div>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card title="Tỷ lệ mở thông báo" className="rounded-xl shadow-md border border-gray-200">
                        <Progress
                          percent={
                            notificationList.length > 0
                              ? Math.round((notificationList.reduce((acc, cur) => acc + (cur.opened || 0), 0) / (notificationList.reduce((acc, cur) => acc + (cur.sentTo || 1), 0)) * 100) || 0)
                              : 0
                          }
                          strokeColor="#e50914"
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card title="Thống kê theo loại" className="rounded-xl shadow-md border border-gray-200">
                        <List
                          dataSource={['promotion', 'movie', 'maintenance', 'news'].map(type => ({
                            type,
                            count: notificationList.filter(n => n.type === type).length
                          }))}
                          renderItem={(item) => (
                            <List.Item>
                              <Text>{item.type}</Text>
                              <Badge count={item.count} style={{ backgroundColor: '#e50914' }} />
                            </List.Item>
                          )}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )
            }
          ]}
        />
      </Card>

      {/* Modal for CRUD */}
      <Modal
        title={modalType === 'view' ? 'Chi tiết thông báo' : (modalType === 'edit' ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới')}
        open={isModalVisible}
        onOk={modalType === 'view' ? handleModalCancel : handleModalOk}
        onCancel={handleModalCancel}
        width={600}
        okText={modalType === 'view' ? 'Đóng' : 'Lưu'}
        cancelText="Hủy"
        okButtonProps={modalType === 'view' ? { style: { display: 'inline-block' } } : {}}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" disabled={modalType === 'view'} />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung thông báo" disabled={modalType === 'view'} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại thông báo"
                rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
              >
                <Select placeholder="Chọn loại thông báo" disabled={modalType === 'view'}>
                  <Option value="promotion">Khuyến mãi</Option>
                  <Option value="movie">Phim mới</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="news">Tin tức</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ ưu tiên"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Select placeholder="Chọn mức độ ưu tiên" disabled={modalType === 'view'}>
                  <Option value="normal">Bình thường</Option>
                  <Option value="important">Quan trọng</Option>
                  <Option value="urgent">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="schedule"
            label="Lịch gửi"
          >
            <Input type="datetime-local" placeholder="Chọn thời gian gửi" disabled={modalType === 'view'} />
          </Form.Item>
        </Form>
        {modalType === 'view' && selectedNotification && (
          <div style={{ marginTop: 24, color: '#8c8c8c', fontSize: 14 }}>
            <div>Ngày tạo: {selectedNotification.createdAt}</div>
            <div>Đã gửi: {selectedNotification.sentTo}</div>
            <div>Đã mở: {selectedNotification.opened}</div>
            <div>Trạng thái: {selectedNotification.status}</div>
          </div>
        )}
      </Modal>

      {/* Modal for Template CRUD */}
      <Modal
        title={templateModalType === 'edit' ? 'Chỉnh sửa template' : 'Tạo template mới'}
        open={isTemplateModalVisible}
        onOk={handleTemplateModalOk}
        onCancel={handleTemplateModalCancel}
        width={600}
        okText={templateModalType === 'edit' ? 'Cập nhật' : 'Tạo'}
        cancelText="Hủy"
      >
        <Form form={templateForm} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề template" />
          </Form.Item>
          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea rows={4} placeholder="Nhập nội dung template" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="type"
                label="Loại"
                rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}
              >
                <Select placeholder="Chọn loại">
                  <Option value="promotion">Khuyến mãi</Option>
                  <Option value="movie">Phim mới</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="news">Tin tức</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Mức độ"
                rules={[{ required: true, message: 'Vui lòng chọn mức độ!' }]}
              >
                <Select placeholder="Chọn mức độ">
                  <Option value="normal">Bình thường</Option>
                  <Option value="important">Quan trọng</Option>
                  <Option value="urgent">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Notifications;
