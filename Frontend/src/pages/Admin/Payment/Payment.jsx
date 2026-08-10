import { useCallback, useEffect, useMemo, useState } from 'react';
import { CreditCard, DollarSign, Eye, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
import dayjs from 'dayjs';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import paymentService, { PAYMENT_STATUS } from '@/services/paymentService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { Pagination } from '@/components/ui/pagination';
import { ResponsiveDialog } from '@/components/ui/responsive-dialog';
import { StatusBadge } from '@/components/ui/status-badge';

const statusTone = (status) => {
  if (status === PAYMENT_STATUS.SUCCESS) return 'success';
  if (status === PAYMENT_STATUS.FAILED) return 'destructive';
  if (status === PAYMENT_STATUS.CANCELLED) return 'neutral';
  if (status === 'REFUNDED') return 'info';
  return 'warning';
};

const formatMoney = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;

const Payment = () => {
  const notification = useNotification();
  const [transactions, setTransactions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentService.listPage({
        page: pagination.current - 1,
        size: pagination.pageSize,
        sort: 'createdAt,desc',
      });
      const content = Array.isArray(response?.content) ? response.content : Array.isArray(response) ? response : [];
      setTransactions(content);
      setPagination((current) => ({
        ...current,
        total: Number(response?.totalElements ?? content.length),
      }));
    } catch (requestError) {
      console.error('Error loading payments:', requestError);
      setTransactions([]);
      setPagination((current) => ({ ...current, total: 0 }));
      setError(requestError?.message || 'Không thể tải danh sách thanh toán.');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const stats = useMemo(() => {
    const successful = transactions.filter((item) => item.paymentStatus === PAYMENT_STATUS.SUCCESS);
    return [
      { label: 'Tổng giao dịch', value: pagination.total, icon: CreditCard },
      { label: 'Thành công trên trang', value: successful.length, icon: ShieldCheck },
      { label: 'Doanh thu trên trang', value: formatMoney(successful.reduce((sum, item) => sum + Number(item.amount || 0), 0)), icon: DollarSign },
    ];
  }, [transactions, pagination.total]);

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: 'transactionId',
      key: 'transactionId',
      render: (value, record) => <span className="font-medium">{value || `PAY-${record.id}`}</span>,
    },
    { title: 'Mã đặt vé', dataIndex: 'bookingCode', key: 'bookingCode', render: (value) => value || '—' },
    { title: 'Khách hàng', dataIndex: 'fullName', key: 'customer', render: (value, record) => value || record.email || '—' },
    { title: 'Số tiền', dataIndex: 'amount', key: 'amount', render: formatMoney },
    { title: 'Phương thức', dataIndex: 'paymentMethod', key: 'paymentMethod', render: (value) => paymentService.getPaymentMethodName(value) || '—' },
    {
      title: 'Trạng thái',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (value) => <StatusBadge tone={statusTone(value)}>{paymentService.getStatusDisplayName(value) || 'Không rõ'}</StatusBadge>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelected(record)} aria-label="Xem giao dịch">
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Quản lý thanh toán"
        description="Theo dõi các giao dịch do backend và cổng thanh toán ghi nhận."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Thanh toán' },
        ]}
        actions={(
          <Button variant="outline" onClick={loadPayments} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Làm mới
          </Button>
        )}
      />

      {error && <Alert variant="destructive" showIcon message="Không thể tải thanh toán" description={error} />}

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-semibold">{value}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Danh sách giao dịch</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải giao dịch...</div>
          ) : transactions.length === 0 ? (
            <Empty description="Chưa có giao dịch" />
          ) : (
            <DataTable fields={columns} rows={transactions} getRowId="id" pageControls={false} />
          )}

          {pagination.total > 0 && (
            <Pagination
              className="mt-5 border-t pt-5"
              page={pagination.current}
              itemsPerPage={pagination.pageSize}
              totalItems={pagination.total}
              allowPageSizeChange
              allowPageJump
              onPageChange={(page) => setPagination((current) => ({ ...current, current: page }))}
              onPageSizeChange={(size) => setPagination((current) => ({ ...current, current: 1, pageSize: size }))}
              showTotal={(total, range) => `Hiển thị ${range[0]}-${range[1]} / ${total} giao dịch`}
            />
          )}
        </CardContent>
      </Card>

      <ResponsiveDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        heading="Chi tiết giao dịch"
        maxWidth={620}
        actions={<Button variant="outline" onClick={() => setSelected(null)}>Đóng</Button>}
      >
        {selected && (
          <DetailList columns={2}>
            <DetailItem label="Mã giao dịch">{selected.transactionId || `PAY-${selected.id}`}</DetailItem>
            <DetailItem label="Mã đặt vé">{selected.bookingCode || '—'}</DetailItem>
            <DetailItem label="Khách hàng">{selected.fullName || selected.email || '—'}</DetailItem>
            <DetailItem label="Số tiền">{formatMoney(selected.amount)}</DetailItem>
            <DetailItem label="Phương thức">{paymentService.getPaymentMethodName(selected.paymentMethod) || '—'}</DetailItem>
            <DetailItem label="Trạng thái"><StatusBadge tone={statusTone(selected.paymentStatus)}>{paymentService.getStatusDisplayName(selected.paymentStatus)}</StatusBadge></DetailItem>
            <DetailItem label="Thời gian" wide>{selected.paymentDate || selected.createdAt ? dayjs(selected.paymentDate || selected.createdAt).format('DD/MM/YYYY HH:mm:ss') : '—'}</DetailItem>
          </DetailList>
        )}
      </ResponsiveDialog>
    </section>
  );
};

export default Payment;
