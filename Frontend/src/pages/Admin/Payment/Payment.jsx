import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { Input } from '@/components/ui/input';
import { InputPassword } from '@/components/ui/input-password';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { TooltipProvider, TooltipTrigger, TooltipContent, Tooltip } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Alert } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { DetailList, DetailItem } from '@/components/ui/detail-list';
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
        // Sá»­ dá»¥ng trá»±c tiáº¿p paymentResponse tá»« API, chá»‰ format date
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
      notification.error(error?.response?.data?.message || 'KhÃ´ng thá»ƒ táº£i danh sÃ¡ch thanh toÃ¡n');
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
      title: 'Tá»•ng giao dá»‹ch',
      value: pagination.total,
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      title: 'ThÃ nh cÃ´ng',
      value: transactions.filter(t => t.paymentStatus === PAYMENT_STATUS.SUCCESS).length,
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    {
      title: 'Tá»· lá»‡ thÃ nh cÃ´ng',
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
        .toLocaleString('vi-VN') + 'Ä‘',
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
      notification.error('Vui lÃ²ng nháº­p tÃªn cá»•ng thanh toÃ¡n!');
      return;
    }
    if (!formValues.type) {
      notification.error('Vui lÃ²ng chá»n loáº¡i cá»•ng thanh toÃ¡n!');
      return;
    }
    if (!formValues.merchantId?.trim()) {
      notification.error('Vui lÃ²ng nháº­p Merchant ID!');
      return;
    }
    if (!formValues.secretKey?.trim()) {
      notification.error('Vui lÃ²ng nháº­p Secret Key!');
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
      notification.success('Cáº­p nháº­t cá»•ng thanh toÃ¡n thÃ nh cÃ´ng!');
    } else {
      setGateways([newGateway, ...gateways]);
      notification.success('ThÃªm cá»•ng thanh toÃ¡n thÃ nh cÃ´ng!');
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
    if (!window.confirm('Báº¡n cÃ³ cháº¯c muá»‘n hoÃ n tiá»n cho giao dá»‹ch nÃ y?')) {
      return;
    }

    try {
      await paymentService.updatePaymentStatus(record.id, 'REFUNDED');
      notification.success('HoÃ n tiá»n giao dá»‹ch thÃ nh cÃ´ng!');
      loadPayments(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error refunding payment:', error);
      notification.error(error?.response?.data?.message || 'KhÃ´ng thá»ƒ hoÃ n tiá»n giao dá»‹ch');
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
      notification.error('Vui lÃ²ng chá»n tráº¡ng thÃ¡i má»›i!');
      return;
    }

    if (newStatus === selectedPaymentForStatus.paymentStatus) {
      notification.info('Tráº¡ng thÃ¡i khÃ´ng thay Ä‘á»•i!');
      setIsStatusModalVisible(false);
      return;
    }

    try {
      await paymentService.updatePaymentStatus(selectedPaymentForStatus.id, newStatus);
      notification.success('Cáº­p nháº­t tráº¡ng thÃ¡i thÃ nh cÃ´ng!');
      setIsStatusModalVisible(false);
      setSelectedPaymentForStatus(null);
      setNewStatus('');
      loadPayments(pagination.current - 1, pagination.pageSize);
    } catch (error) {
      console.error('Error updating payment status:', error);
      notification.error(error?.response?.data?.message || 'KhÃ´ng thá»ƒ cáº­p nháº­t tráº¡ng thÃ¡i');
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
      title: 'MÃ£ giao dá»‹ch',
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
      title: 'KhÃ¡ch hÃ ng',
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
      title: 'MÃ£ Ä‘áº·t vÃ©',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (bookingCode) => (
        <span className="text-sm font-medium text-gray-800">{bookingCode || 'N/A'}</span>
      )
    },
    {
      title: 'Sá»‘ tiá»n',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount) => (
        <div className="text-right">
          <div className="font-semibold text-gray-800">
            {(amount || 0).toLocaleString('vi-VN')}Ä‘
          </div>
        </div>
      )
    },
    {
      title: 'PhÆ°Æ¡ng thá»©c',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (paymentMethod) => (
        <StatusBadge className="bg-blue-100 text-blue-800">
          <CreditCard className="h-3 w-3 mr-1 inline" />
          {paymentService.getPaymentMethodName(paymentMethod) || paymentMethod}
        </StatusBadge>
      )
    },
    {
      title: 'Tráº¡ng thÃ¡i',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (paymentStatus) => {
        const statusConfig = {
          [PAYMENT_STATUS.SUCCESS]: { color: 'green', text: 'ThÃ nh cÃ´ng', icon: <CheckCircle2 className="h-3 w-3" /> },
          [PAYMENT_STATUS.PENDING]: { color: 'orange', text: 'Äang xá»­ lÃ½', icon: <Clock className="h-3 w-3" /> },
          [PAYMENT_STATUS.FAILED]: { color: 'red', text: 'Tháº¥t báº¡i', icon: <AlertCircle className="h-3 w-3" /> },
          'REFUNDED': { color: 'blue', text: 'ÄÃ£ hoÃ n tiá»n', icon: <DollarSign className="h-3 w-3" /> }
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
          <StatusBadge className={colorClasses[config.color] || colorClasses.default}>
            {config.icon}
            <span className="ml-1">{config.text}</span>
          </StatusBadge>
        );
      }
    },
    {
      title: 'NgÃ y thanh toÃ¡n',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (paymentDate, record) => (
        <div className="space-y-1">
          <div className="text-xs text-gray-500">
            {record.paymentDateFormatted || 'ChÆ°a thanh toÃ¡n'}
          </div>
          {record.createdAtFormatted && (
            <div className="text-xs text-gray-400">
              Táº¡o: {record.createdAtFormatted}
            </div>
          )}
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
                <Button variant="ghost" size="sm" onClick={() => handleViewTransaction(record)}>
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
                  onClick={() => handleRefundTransaction(record)}
                  disabled={record.paymentStatus === 'REFUNDED' || record.paymentStatus !== PAYMENT_STATUS.SUCCESS}
                >
                  <DollarSign className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>HoÃ n tiá»n</TooltipContent>
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
              <TooltipContent>Chá»‰nh sá»­a tráº¡ng thÃ¡i</TooltipContent>
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
            title: 'Quáº£n lÃ½ thanh toÃ¡n',
            icon: <CreditCard className="h-4 w-4" />
          }
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <h2 className="m-0 text-2xl font-bold text-gray-800">
          Quáº£n lÃ½ thanh toÃ¡n
        </h2>
        <p className="text-gray-600 mt-1">
          Cáº¥u hÃ¬nh vÃ  quáº£n lÃ½ cÃ¡c cá»•ng thanh toÃ¡n
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
          <h4 className="m-0 text-lg font-semibold">Danh sÃ¡ch thanh toÃ¡n</h4>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-2 text-gray-600">Äang táº£i dá»¯ liá»‡u...</span>
          </div>
        ) : (
          <DataTable
            fields={transactionColumns}
            data={transactions}
            getRowId="id"
            pageControls={{
              current: pagination.current,
              total: pagination.total,
              pageSize: pagination.pageSize,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} cá»§a ${total} giao dá»‹ch`,
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

      <ResponsiveDialog
        heading={isEditMode ? 'Chá»‰nh sá»­a cá»•ng thanh toÃ¡n' : 'ThÃªm cá»•ng thanh toÃ¡n má»›i'}
        open={isModalVisible}
        onClose={handleModalCancel}
        maxWidth={600}
        actions={null}
      >
        <form onSubmit={handleModalOk} className="space-y-4 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TÃªn cá»•ng thanh toÃ¡n <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Nháº­p tÃªn cá»•ng thanh toÃ¡n"
                value={formValues.name}
                onChange={(e) => setFormValues(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loáº¡i cá»•ng thanh toÃ¡n <span className="text-red-500">*</span>
              </label>
              <Select
                value={formValues.type}
                onValueChange={(value) => setFormValues(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chá»n loáº¡i" />
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
                placeholder="Nháº­p Merchant ID"
                value={formValues.merchantId}
                onChange={(e) => setFormValues(prev => ({ ...prev, merchantId: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secret Key <span className="text-red-500">*</span>
              </label>
              <InputPassword
                placeholder="Nháº­p Secret Key"
                value={formValues.secretKey}
                onChange={(e) => setFormValues(prev => ({ ...prev, secretKey: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tráº¡ng thÃ¡i
              </label>
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  checked={formValues.status}
                  onCheckedChange={(checked) => setFormValues(prev => ({ ...prev, status: checked }))}
                />
                <span className="text-sm text-gray-700">Hoáº¡t Ä‘á»™ng</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cháº¿ Ä‘á»™ test
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
            message="LÆ°u Ã½ báº£o máº­t"
            description="Secret Key vÃ  cÃ¡c thÃ´ng tin nháº¡y cáº£m sáº½ Ä‘Æ°á»£c mÃ£ hÃ³a vÃ  báº£o vá»‡ an toÃ n."
            type="info"
            showIcon
          />

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleModalCancel}
            >
              Há»§y
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              {isEditMode ? 'Cáº­p nháº­t' : 'ThÃªm'}
            </Button>
          </div>
        </form>
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiáº¿t cá»•ng thanh toÃ¡n"
        open={isDetailModalVisible}
        onClose={handleDetailModalCancel}
        maxWidth={500}
        actions={null}
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
            <DetailList
              columns={1}
              items={[
                {
                  label: 'Loáº¡i',
                  children: selectedGateway.type
                },
                {
                  label: 'Tráº¡ng thÃ¡i',
                  children: selectedGateway.status === 'active' ? 'Hoáº¡t Ä‘á»™ng' : 'KhÃ´ng hoáº¡t Ä‘á»™ng'
                },
                {
                  label: 'Cháº¿ Ä‘á»™',
                  children: selectedGateway.testMode ? 'Test Mode' : 'Live Mode'
                },
                {
                  label: 'Sá»‘ giao dá»‹ch',
                  children: selectedGateway.transactionCount
                },
                {
                  label: 'Tá»· lá»‡ thÃ nh cÃ´ng',
                  children: `${selectedGateway.successRate}%`
                },
                {
                  label: 'Giao dá»‹ch cuá»‘i',
                  children: selectedGateway.lastTransaction
                }
              ]}
            />
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={handleDetailModalCancel}>
                ÄÃ³ng
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  setIsDetailModalVisible(false);
                  handleEditGateway(selectedGateway);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Chá»‰nh sá»­a
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      <ResponsiveDialog
        heading="Chi tiáº¿t giao dá»‹ch"
        open={isTransactionDetailModalVisible}
        onClose={handleTransactionDetailModalCancel}
        maxWidth={500}
        actions={null}
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
            <DetailList
              columns={1}
              items={[
                {
                  label: 'ID',
                  children: `#${selectedTransaction.id}`
                },
                {
                  label: 'MÃ£ giao dá»‹ch',
                  children: selectedTransaction.transactionId || `PAY-${selectedTransaction.id}`
                },
                {
                  label: 'Sá»‘ tiá»n',
                  children: `${(selectedTransaction.amount || 0).toLocaleString('vi-VN')}Ä‘`
                },
                {
                  label: 'PhÆ°Æ¡ng thá»©c thanh toÃ¡n',
                  children: paymentService.getPaymentMethodName(selectedTransaction.paymentMethod) || selectedTransaction.paymentMethod
                },
                {
                  label: 'Tráº¡ng thÃ¡i',
                  children: paymentService.getStatusDisplayName(selectedTransaction.paymentStatus) || selectedTransaction.paymentStatus
                },
                {
                  label: 'NgÃ y thanh toÃ¡n',
                  children: selectedTransaction.paymentDateFormatted || selectedTransaction.paymentDate || 'ChÆ°a thanh toÃ¡n'
                },
                {
                  label: 'NgÃ y táº¡o',
                  children: selectedTransaction.createdAtFormatted || selectedTransaction.createdAt || 'N/A'
                },
                {
                  label: 'MÃ£ Ä‘áº·t vÃ©',
                  children: selectedTransaction.bookingCode || 'N/A'
                },
                {
                  label: 'User ID',
                  children: selectedTransaction.userId ? `#${selectedTransaction.userId}` : 'N/A'
                },
                selectedTransaction.paymentDetails && {
                  label: 'Chi tiáº¿t thanh toÃ¡n',
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
                ÄÃ³ng
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>

      {/* Status Edit Modal */}
      <ResponsiveDialog
        heading="Chá»‰nh sá»­a tráº¡ng thÃ¡i thanh toÃ¡n"
        open={isStatusModalVisible}
        onClose={handleStatusModalCancel}
        maxWidth={500}
        actions={null}
      >
        {selectedPaymentForStatus && (
          <div className="p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                MÃ£ giao dá»‹ch: <span className="font-semibold">{selectedPaymentForStatus.transactionId || `PAY-${selectedPaymentForStatus.id}`}</span>
              </p>
              <p className="text-sm text-gray-600">
                Tráº¡ng thÃ¡i hiá»‡n táº¡i: <span className="font-semibold">{paymentService.getStatusDisplayName(selectedPaymentForStatus.paymentStatus)}</span>
              </p>
            </div>
            <Separator className="my-4" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tráº¡ng thÃ¡i má»›i <span className="text-red-500">*</span>
              </label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chá»n tráº¡ng thÃ¡i" />
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
                Há»§y
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleStatusModalOk}
              >
                Cáº­p nháº­t
              </Button>
            </div>
          </div>
        )}
      </ResponsiveDialog>
    </div>
  );
};

export default Payment;
