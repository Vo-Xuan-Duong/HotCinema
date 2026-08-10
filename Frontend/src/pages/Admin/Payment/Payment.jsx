import { useEffect, useMemo, useState } from 'react';
import { CreditCard, DollarSign, Eye, Home, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import paymentService, { PAYMENT_STATUS } from '@/services/paymentService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StatusBadge } from '@/components/ui/status-badge';

const Payment = () => {
  const notification = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadPayments = async (page = pagination.current, size = pagination.pageSize) => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.listPage({
        page: page - 1,
        size,
        sort: 'createdAt,desc',
      });
      setTransactions(response?.content || []);
      setPagination({
        current: page,
        pageSize: size,
        total: response?.totalElements || 0,
      });
    } catch (requestError) {
      setTransactions([]);
      setError(requestError?.message || 'Không thể tải danh sách thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments(1, 10);
  }, []);

  const stats = useMemo(() => {
    const successful = transactions.filter((item) => item.paymentStatus === PAYMENT_STATUS.SUCCESS);
    return [
      { label: 'Tổng giao dịch', value: pagination.total, icon: CreditCard },
      { label: 'Thành công trên trang', value: successful.length, icon: ShieldCheck },
      {
        label: 'Doanh thu trên trang',
        value: `${successful.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString('vi-VN')} ₫`,
        icon: DollarSign,
      },
    ];
  }, [transactions, pagination.total]);

  const columns = [
    { title: 'Mã giao dịch', dataIndex: 'transactionId', render: (value, record) => value || `PAY-${record.id}` },
    { title: 'Mã đặt vé', dataIndex: 'bookingCode', render: (value) => value || '—' },
    { title: 'Khách hàng', dataIndex: 'fullName', render: (value, record) => value || record.email || '—' },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      render: (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`,
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      render: (value) => paymentService.getPaymentMethodName(value),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      render: (value) => (
        <StatusBadge tone={value === 'SUCCESS' ? 'success' : value === 'FAILED' ? 'error' : 'warning'}>
          {paymentService.getStatusDisplayName(value)}
        </StatusBadge>
      ),
    },
    {
      title: '',
      key: 'actions',
      render: (_, record) => (
        <Button variant="ghost" size="icon" onClick={() => setSelected(record)} aria-label="Xem giao dịch">
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <Breadcrumb items={[{ title: 'Dashboard', icon: <Home className="size-4" /> }, { title: 'Thanh toán' }]} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý thanh toán</h1>
          <p className="text-sm text-muted-foreground">Theo dõi giao dịch do backend và cổng thanh toán ghi nhận.</p>
        </div>
        <Button variant="outline" onClick={() => loadPayments()} disabled={loading}>
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
          Làm mới
        </Button>
      </div>

      {error && <Alert variant="destructive" message="Không thể tải thanh toán" description={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>
              <Icon className="size-5 text-primary" />
            </CardContent>
          </Card>
        ))}
      </div>

      <DataTable
        columns={columns}
        dataSource={transactions}
        loading={loading}
        rowKey="id"
        pagination={pagination}
        onChange={(page, pageSize) => loadPayments(page, pageSize)}
        emptyText="Chưa có giao dịch"
      />

      <ResponsiveDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Chi tiết giao dịch"
        actions={<Button onClick={() => setSelected(null)}>Đóng</Button>}
      >
        {selected && (
          <DetailList>
            <DetailItem label="Mã giao dịch">{selected.transactionId || `PAY-${selected.id}`}</DetailItem>
            <DetailItem label="Mã đặt vé">{selected.bookingCode || '—'}</DetailItem>
            <DetailItem label="Khách hàng">{selected.fullName || selected.email || '—'}</DetailItem>
            <DetailItem label="Số tiền">{Number(selected.amount || 0).toLocaleString('vi-VN')} ₫</DetailItem>
            <DetailItem label="Phương thức">{paymentService.getPaymentMethodName(selected.paymentMethod)}</DetailItem>
            <DetailItem label="Trạng thái">{paymentService.getStatusDisplayName(selected.paymentStatus)}</DetailItem>
            <DetailItem label="Thời gian">{selected.paymentDate ? dayjs(selected.paymentDate).format('DD/MM/YYYY HH:mm:ss') : '—'}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </section>
  );
};

export default Payment;
