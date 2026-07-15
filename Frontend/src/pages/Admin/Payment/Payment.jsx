import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TableWrapper } from '@/components/ui/table-wrapper';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Select } from '@/components/ui/select';
import { Tag } from '@/components/ui/tag';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Descriptions } from '@/components/ui/descriptions';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Eye,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  DollarSign,
  Shield,
  Home
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';
import paymentService, { PAYMENT_STATUS } from '@/services/paymentService';
import { Loader2 } from 'lucide-react';
import dayjs from 'dayjs';

const Payment = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState(null);
  const [formValues, setFormValues] = useState({
    name: '',
    type: '',
    merchantId: '',
    secretKey: '',
    status: false,
    testMode: false
  });
  const notification = useNotification();
  const [gateways, setGateways] = useState([
    {
      id: 1,
      name: 'VNPay',
      type: 'vnpay',
      status: 'active',
      merchantId: 'VNPAY001',
      secretKey: '********',
      testMode: true,
      transactionCount: 1250,
      successRate: 98.5,
      lastTransaction: '2024-01-25 15:30:00'
    },
    {
      id: 2,
      name: 'MoMo',
      type: 'momo',
      status: 'active',
      merchantId: 'MOMO001',
      secretKey: '********',
      testMode: false,
      transactionCount: 890,
      successRate: 97.2,
      lastTransaction: '2024-01-25 14:20:00'
    },
    {
      id: 3,
      name: 'ZaloPay',
      type: 'zalopay',
      status: 'inactive',
      merchantId: 'ZALOPAY001',
      secretKey: '********',
      testMode: true,
      transactionCount: 450,
      successRate: 95.8,
      lastTransaction: '2024-01-24 16:45:00'
    }
  ]);
  const [transactions, setTransactions] = useState([]);
  const [isTransactionDetailModalVisible, setIsTransactionDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);
  const [selectedPaymentForStatus, setSelectedPaymentForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Load payments from API
  const loadPayments = async (page = 0, size = 10) => {
    try {
      setLoading(true);
      const response = await paymentService.listPage({ page, size, sort: 'createdAt,desc' });

      if (response?.content) {
        // Sử dụng trực tiếp paymentResponse từ API, chỉ format date
        const payments = response.content.map(payment => ({
          ...payment,
          paymentDateFormatted: payment.paymentDate ? dayjs(payment.paymentDate).format('DD/MM/YYYY HH:mm:ss') : null,
          createdAtFormatted: payment.createdAt ? dayjs(payment.createdAt).format('DD/MM/YYYY HH:mm:ss') : null
        }));
        setTransactions(payments);
        setPagination(prev => ({
          ...prev,
          total: response.totalElements || 0,
          current: page + 1
        }));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      notification.error(error?.response?.data?.message || 'Không thể tải danh sách thanh toán');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(0, pagination.pageSize);
  }, []);

  const stats = [
    {
      title: 'Tổng giao dịch',
      value: pagination.total,
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      title: 'Thành công',
      value: transactions.filter(t => t.paymentStatus === PAYMENT_STATUS.SUCCESS).length,
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    {
      title: 'Tỷ lệ thành công',
      value: transactions.length > 0
        ? Math.round((transactions.filter(t => t.paymentStatus === PAYMENT_STATUS.SUCCESS).length / transactions.length) * 100) + '%'
        : '0%',
      icon: <Shield className="h-6 w-6" />
    },
    {
      title: 'Doanh thu',
      value: transactions
        .filter(t => t.paymentStatus === PAYMENT_STATUS.SUCCESS)
        .reduce((a, b) => a + (b.amount || 0), 0)
        .toLocaleString('vi-VN') + 'đ',
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  // Gateway CRUD
  const handleCreateGateway = () => {
    setIsEditMode(false);
    setSelectedGateway(null);
    setFormValues({
      name: '',
      type: '',
      merchantId: '',
      secretKey: '',
      status: false,
      testMode: false
    });
    setIsModalVisible(true);
  };

  const handleEditGateway = (record) => {
    setIsEditMode(true);
    setSelectedGateway(record);
    setFormValues({
      name: record.name || '',
      type: record.type || '',
      merchantId: record.merchantId || '',
      secretKey: record.secretKey || '',
      status: record.status === 'active',
      testMode: record.testMode || false
    });
    setIsModalVisible(true);
  }

  const handleModalOk = (e) => {
    e?.preventDefault();
    // Validation
    if (!formValues.name?.trim()) {
      notification.error('Vui lòng nhập tên cổng thanh toán!');
      return;
    }
    if (!formValues.type) {
      notification.error('Vui lòng chọn loại cổng thanh toán!');
      return;
    }
    if (!formValues.merchantId?.trim()) {
      notification.error('Vui lòng nhập Merchant ID!');
      return;
    }
    if (!formValues.secretKey?.trim()) {
      notification.error('Vui lòng nhập Secret Key!');
      return;
    }

    const newGateway = {
      name: formValues.name.trim(),
      type: formValues.type,
      merchantId: formValues.merchantId.trim(),
      secretKey: formValues.secretKey.trim(),
      status: formValues.status ? 'active' : 'inactive',
      testMode: formValues.testMode || false,
      id: isEditMode && selectedGateway ? selectedGateway.id : Date.now(),
      transactionCount: isEditMode && selectedGateway ? selectedGateway.transactionCount : 0,
      successRate: isEditMode && selectedGateway ? selectedGateway.successRate : 100,
      lastTransaction: isEditMode && selectedGateway ? selectedGateway.lastTransaction : ''
    };
    if (isEditMode && selectedGateway) {
      setGateways(gateways.map(item => item.id === selectedGateway.id ? newGateway : item));
      notification.success('Cập nhật cổng thanh toán thành công!');
    } else {
      setGateways([newGateway, ...gateways]);
      notification.success('Thêm cổng thanh toán thành công!');
    }
    setIsModalVisible(false);
    setSelectedGateway(null);
    setIsEditMode(false);
    setFormValues({
      name: '',
      type: '',
      merchantId: '',
      secretKey: '',
      status: false,
      testMode: false
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setSelectedGateway(null);
    setIsEditMode(false);
    setFormValues({
      name: '',
      type: '',
      merchantId: '',
      secretKey: '',
      status: false,
      testMode: false
    });
  };

  const handleDetailModalCancel = () => {
    setIsDetailModalVisible(false);
    setSelectedGateway(null);
  };

  // Transaction detail
  const handleViewTransaction = (record) => {
    setSelectedTransaction(record);
    setIsTransactionDetailModalVisible(true);
  };
  const handleTransactionDetailModalCancel = () => {
    setIsTransactionDetailModalVisible(false);
    setSelectedTransaction(null);
  };

  // Transaction refund
  const handleRefundTransaction = async (record) => {
    if (!window.confirm('Bạn có chắc muốn hoàn tiền cho giao dịch này?')) {
      return;
    }

    try {
      await paymentService.updatePaymentStatus(record.id, 'REFUNDED');
      notification.success('Hoàn tiền giao dịch thành công!');
      loadPayments(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error refunding payment:', error);
      notification.error(error?.response?.data?.message || 'Không thể hoàn tiền giao dịch');
    }
  };

  // Handle edit status
  const handleEditStatus = (record) => {
    setSelectedPaymentForStatus(record);
    setNewStatus(record.paymentStatus);
    setIsStatusModalVisible(true);
  };

  const handleStatusModalCancel = () => {
    setIsStatusModalVisible(false);
    setSelectedPaymentForStatus(null);
    setNewStatus('');
  };

  const handleStatusModalOk = async () => {
    if (!selectedPaymentForStatus || !newStatus) {
      notification.error('Vui lòng chọn trạng thái mới!');
      return;
    }

    if (newStatus === selectedPaymentForStatus.paymentStatus) {
      notification.info('Trạng thái không thay đổi!');
      setIsStatusModalVisible(false);
      return;
    }

    try {
      await paymentService.updatePaymentStatus(selectedPaymentForStatus.id, newStatus);
      notification.success('Cập nhật trạng thái thành công!');
      setIsStatusModalVisible(false);
      setSelectedPaymentForStatus(null);
      setNewStatus('');
      loadPayments(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error updating payment status:', error);
      notification.error(error?.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  // Handle pagination change
  const handleTableChange = (newPagination) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current || prev.current,
      pageSize: newPagination.pageSize || prev.pageSize
    }));
    loadPayments((newPagination.current || pagination.current) - 1, newPagination.pageSize || pagination.pageSize);
  };

  const transactionColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => (
        <span className="text-sm font-medium text-gray-700">#{id}</span>
      )
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (transactionId, record) => (
        <div>
          <div className="font-semibold text-gray-800">
            {transactionId || `PAY-${record.id}`}
          </div>
        </div>
      )
    },
    {
      title: 'Khách hàng',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-800">
            {record.fullName || 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {record.email || 'N/A'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            User ID: {record.userId || 'N/A'}
          </div>
        </div>
      )
    },
    {
      title: 'Mã đặt vé',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (bookingCode) => (
        <span className="text-sm font-medium text-gray-800">{bookingCode || 'N/A'}</span>
      )
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold text-gray-800">
            {(amount || 0).toLocaleString('vi-VN')}đ
          </div>
        </div>
      )
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (paymentMethod) => (
        <Tag className="bg-blue-100 text-blue-800">
          <CreditCard className="h-3 w-3 mr-1 inline" />
          {paymentService.getPaymentMethodName(paymentMethod) || paymentMethod}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (paymentStatus) => {
        const statusConfig = {
          [PAYMENT_STATUS.SUCCESS]: { color: 'green', text: 'Thành công', icon: <CheckCircle2 className="h-3 w-3" /> },
          [PAYMENT_STATUS.PENDING]: { color: 'orange', text: 'Đang xử lý', icon: <Clock className="h-3 w-3" /> },
          [PAYMENT_STATUS.FAILED]: { color: 'red', text: 'Thất bại', icon: <AlertCircle className="h-3 w-3" /> },
          'REFUNDED': { color: 'blue', text: 'Đã hoàn tiền', icon: <DollarSign className="h-3 w-3" /> }
        };
        const config = statusConfig[paymentStatus] || { color: 'default', text: paymentService.getStatusDisplayName(paymentStatus) || paymentStatus };
        const colorClasses = {
          green: 'bg-green-100 text-green-800',
          orange: 'bg-orange-100 text-orange-800',
          red: 'bg-red-100 text-red-800',
          blue: 'bg-blue-100 text-blue-800',
          default: 'bg-gray-100 text-gray-800'
        };
        return (
          <Tag className={colorClasses[config.color] || colorClasses.default}>
            {config.icon}
            <span className="ml-1">{config.text}</span>
          </Tag>
        );
      }
    },
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (paymentDate, record) => (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            {record.paymentDateFormatted || 'Chưa thanh toán'}
          </div>
          {record.createdAtFormatted && (
            <div className="text-xs text-gray-400">
              Tạo: {record.createdAtFormatted}
            </div>
          )}
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
                <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(record)}>
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
                  onClick={() => handleRefundTransaction(record)}
                  disabled={record.paymentStatus === 'REFUNDED' || record.paymentStatus !== PAYMENT_STATUS.SUCCESS}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Hoàn tiền</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStatus(record)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Chỉnh sửa trạng thái</TooltipContent>
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
            title: 'Quản lý thanh toán',
            icon: <CreditCard className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h2 className="m-0 text-2xl font-bold text-gray-800">
          Quản lý thanh toán
        </h2>
        <p className="text-gray-600 mt-1">
          Cấu hình và quản lý các cổng thanh toán
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {stats.map((stat, index) => (
          <Card key={index} className="rounded-xl shadow-md border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">{stat.title}</div>
                <div className="mt-1 text-xl font-semibold text-gray-900">{stat.value}</div>
              </div>
              <div className="text-2xl text-indigo-600">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="rounded-xl shadow-md border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-4">
          <h4 className="m-0 text-lg font-semibold">Danh sách thanh toán</h4>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <TableWrapper
            columns={transactionColumns}
            data={transactions}
            rowKey="id"
            pagination={{
              current: pagination.current,
              total: pagination.total,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} giao dịch`,
              onChange: (page, pageSize) => {
                handleTableChange({ current: page, pageSize });
              },
              onShowSizeChange: (current, size) => {
                handleTableChange({ current, pageSize: size });
              }
            }}
          />
        )}
      </Card>

      <Modal
        title={isEditMode ? 'Chỉnh sửa cổng thanh toán' : 'Thêm cổng thanh toán mới'}
        open={isModalVisible}
        onCancel={handleModalCancel}
        width={600}
        footer={null}
      >
        <form onSubmit={handleModalOk} className="space-y-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên cổng thanh toán <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập tên cổng thanh toán"
                value={formValues.name}
                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại cổng thanh toán <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.type}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vnpay">VNPay</SelectItem>
                  <SelectItem value="momo">MoMo</SelectItem>
                  <SelectItem value="zalopay">ZaloPay</SelectItem>
                  <SelectItem value="banking">Internet Banking</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Merchant ID <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nhập Merchant ID"
                value={formValues.merchantId}
                onChange={(e) => setFormValues(prev => ({ ...prev, merchantId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key <span className="text-red-500">*</span>
              </label>
              <InputPassword
                placeholder="Nhập Secret Key"
                value={formValues.secretKey}
                onChange={(e) => setFormValues(prev => ({ ...prev, secretKey: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formValues.status}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, status: checked }))}
                />
                <span className="text-sm text-gray-700">Hoạt động</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chế độ test
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formValues.testMode}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, testMode: checked }))}
                />
                <span className="text-sm text-gray-700">Test Mode</span>
              </div>
            </div>
          </div>

          <Alert
            message="Lưu ý bảo mật"
            description="Secret Key và các thông tin nhạy cảm sẽ được mã hóa và bảo vệ an toàn."
            type="info"
            showIcon
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalCancel}
            >
              Hủy
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {isEditMode ? 'Cập nhật' : 'Thêm'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        title="Chi tiết cổng thanh toán"
        open={isDetailModalVisible}
        onCancel={handleDetailModalCancel}
        width={500}
        footer={null}
      >
        {selectedGateway && (
          <div className="text-center p-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white mx-auto mb-4"
              style={{
                backgroundColor: selectedGateway.type === 'vnpay' ? '#1890ff' : selectedGateway.type === 'momo' ? '#eb2f96' : '#52c41a'
              }}
            >
              <CreditCard className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedGateway.name}</h4>
            <p className="text-gray-600 mb-4">Merchant ID: {selectedGateway.merchantId}</p>
            <Separator className="my-4" />
            <Descriptions
              column={1}
              items={[
                {
                  label: 'Loại',
                  children: selectedGateway.type
                },
                {
                  label: 'Trạng thái',
                  children: selectedGateway.status === 'active' ? 'Hoạt động' : 'Không hoạt động'
                },
                {
                  label: 'Chế độ',
                  children: selectedGateway.testMode ? 'Test Mode' : 'Live Mode'
                },
                {
                  label: 'Số giao dịch',
                  children: selectedGateway.transactionCount
                },
                {
                  label: 'Tỷ lệ thành công',
                  children: `${selectedGateway.successRate}%`
                },
                {
                  label: 'Giao dịch cuối',
                  children: selectedGateway.lastTransaction
                }
              ]}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleDetailModalCancel}>
                Đóng
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleEditGateway(selectedGateway);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Chi tiết giao dịch"
        open={isTransactionDetailModalVisible}
        onCancel={handleTransactionDetailModalCancel}
        width={500}
        footer={null}
      >
        {selectedTransaction && (
          <div className="p-4">
            <div className="text-center mb-4">
              <h4 className="text-xl font-bold text-gray-900 mb-2">
                {selectedTransaction.transactionId || `PAY-${selectedTransaction.id}`}
              </h4>
              <p className="text-gray-600">
                {selectedTransaction.fullName || 'N/A'} ({selectedTransaction.email || 'N/A'})
              </p>
            </div>
            <Separator className="my-4" />
            <Descriptions
              column={1}
              items={[
                {
                  label: 'ID',
                  children: `#${selectedTransaction.id}`
                },
                {
                  label: 'Mã giao dịch',
                  children: selectedTransaction.transactionId || `PAY-${selectedTransaction.id}`
                },
                {
                  label: 'Số tiền',
                  children: `${(selectedTransaction.amount || 0).toLocaleString('vi-VN')}đ`
                },
                {
                  label: 'Phương thức thanh toán',
                  children: paymentService.getPaymentMethodName(selectedTransaction.paymentMethod) || selectedTransaction.paymentMethod
                },
                {
                  label: 'Trạng thái',
                  children: paymentService.getStatusDisplayName(selectedTransaction.paymentStatus) || selectedTransaction.paymentStatus
                },
                {
                  label: 'Ngày thanh toán',
                  children: selectedTransaction.paymentDateFormatted || selectedTransaction.paymentDate || 'Chưa thanh toán'
                },
                {
                  label: 'Ngày tạo',
                  children: selectedTransaction.createdAtFormatted || selectedTransaction.createdAt || 'N/A'
                },
                {
                  label: 'Mã đặt vé',
                  children: selectedTransaction.bookingCode || 'N/A'
                },
                {
                  label: 'User ID',
                  children: selectedTransaction.userId ? `#${selectedTransaction.userId}` : 'N/A'
                },
                selectedTransaction.paymentDetails && {
                  label: 'Chi tiết thanh toán',
                  children: (
                    <div className="max-w-md break-words">
                      {selectedTransaction.paymentDetails}
                    </div>
                  )
                }
              ].filter(Boolean)}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleTransactionDetailModalCancel}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Edit Modal */}
      <Modal
        title="Chỉnh sửa trạng thái thanh toán"
        open={isStatusModalVisible}
        onCancel={handleStatusModalCancel}
        width={500}
        footer={null}
      >
        {selectedPaymentForStatus && (
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Mã giao dịch: <span className="font-semibold">{selectedPaymentForStatus.transactionId || `PAY-${selectedPaymentForStatus.id}`}</span>
              </p>
              <p className="text-sm text-gray-600">
                Trạng thái hiện tại: <span className="font-semibold">{paymentService.getStatusDisplayName(selectedPaymentForStatus.paymentStatus)}</span>
              </p>
            </div>
            <Separator className="my-4" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái mới <span className="text-red-500">*</span>
              </label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PAYMENT_STATUS.PENDING}>
                    {paymentService.getStatusDisplayName(PAYMENT_STATUS.PENDING)}
                  </SelectItem>
                  <SelectItem value={PAYMENT_STATUS.SUCCESS}>
                    {paymentService.getStatusDisplayName(PAYMENT_STATUS.SUCCESS)}
                  </SelectItem>
                  <SelectItem value={PAYMENT_STATUS.FAILED}>
                    {paymentService.getStatusDisplayName(PAYMENT_STATUS.FAILED)}
                  </SelectItem>
                  <SelectItem value="REFUNDED">
                    {paymentService.getStatusDisplayName('REFUNDED')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleStatusModalCancel}>
                Hủy
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleStatusModalOk}
              >
                Cập nhật
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Payment; 