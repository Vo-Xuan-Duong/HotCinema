import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Loader2, RefreshCw, Ticket, WalletCards } from 'lucide-react';
import dayjs from 'dayjs';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import revenueService from '@/services/revenueService';
import bookingService from '@/services/bookingService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/ui/data-table';
import { DateRangeField } from '@/components/ui/date-field';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const bookingTone = (status) => {
  const value = String(status || '').toUpperCase();
  if (value === 'CONFIRMED' || value === 'COMPLETED') return 'success';
  if (value === 'CANCELLED' || value === 'FAILED') return 'destructive';
  if (value === 'EXPIRED') return 'neutral';
  return 'warning';
};

const Reports = () => {
  const notification = useNotification();
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'day'), dayjs()]);
  const [summary, setSummary] = useState({});
  const [dailyRevenue, setDailyRevenue] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const params = useMemo(() => ({
    startDate: dateRange[0]?.format('YYYY-MM-DD'),
    endDate: dateRange[1]?.format('YYYY-MM-DD'),
  }), [dateRange]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryResult, dailyResult, bookingResult] = await Promise.all([
        revenueService.getSummary(params),
        revenueService.getByDate(params),
        bookingService.listPage({ page: 0, size: 8, sort: 'bookingDate,desc' }),
      ]);
      setSummary(summaryResult || {});
      setDailyRevenue(Array.isArray(dailyResult) ? dailyResult : []);
      setBookings(Array.isArray(bookingResult?.content) ? bookingResult.content : []);
    } catch (requestError) {
      console.error('Error loading revenue report:', requestError);
      setError(requestError?.message || 'Không thể tải dữ liệu báo cáo.');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const exportCsv = () => {
    if (!dailyRevenue.length) {
      notification.warning('Không có dữ liệu để xuất.');
      return;
    }

    const rows = [
      ['Ngày', 'Doanh thu', 'Số đặt vé', 'Số vé'],
      ...dailyRevenue.map((item) => [
        item.date,
        item.totalRevenue || 0,
        item.totalBookings || 0,
        item.totalTickets || 0,
      ]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')}`;
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `bao-cao-doanh-thu-${params.startDate}-${params.endDate}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    notification.success('Đã xuất báo cáo CSV.');
  };

  const stats = [
    { label: 'Tổng doanh thu', value: currency.format(Number(summary.totalRevenue || 0)), icon: WalletCards },
    { label: 'Số đặt vé', value: Number(summary.totalBookings || 0).toLocaleString('vi-VN'), icon: Ticket },
    { label: 'Số vé đã bán', value: Number(summary.totalTickets || 0).toLocaleString('vi-VN'), icon: Ticket },
  ];

  const dailyColumns = [
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: (value) => value ? dayjs(value).format('DD/MM/YYYY') : '—' },
    { title: 'Doanh thu', dataIndex: 'totalRevenue', key: 'totalRevenue', render: (value) => currency.format(Number(value || 0)) },
    { title: 'Đặt vé', dataIndex: 'totalBookings', key: 'totalBookings', render: (value) => Number(value || 0).toLocaleString('vi-VN') },
    { title: 'Vé bán', dataIndex: 'totalTickets', key: 'totalTickets', render: (value) => Number(value || 0).toLocaleString('vi-VN') },
  ];

  return (
    <section className="space-y-6">
      <AdminPageHeader
        title="Báo cáo doanh thu"
        description="Dữ liệu tổng hợp trực tiếp từ revenue API trong khoảng thời gian đã chọn."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Báo cáo' },
        ]}
        actions={(
          <>
            <DateRangeField value={dateRange} onValueChange={setDateRange} format="DD/MM/YYYY" />
            <Button variant="outline" onClick={loadReport} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button onClick={exportCsv} disabled={loading || !dailyRevenue.length}>
              <Download className="h-4 w-4" />
              Xuất CSV
            </Button>
          </>
        )}
      />

      {error && <Alert variant="destructive" showIcon message="Không thể tải báo cáo" description={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{loading ? '—' : value}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Doanh thu theo ngày</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-40 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải dữ liệu...</div>
          ) : dailyRevenue.length ? (
            <DataTable fields={dailyColumns} rows={dailyRevenue} getRowId={(record) => record.date} pageControls={false} />
          ) : (
            <Empty description="Không có dữ liệu doanh thu trong khoảng thời gian đã chọn" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Đặt vé gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex min-h-32 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải...</div>
          ) : bookings.length ? bookings.map((booking) => {
            const status = booking.bookingStatus || booking.status || 'PENDING';
            return (
              <article key={booking.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{booking.userName || booking.user?.fullName || booking.bookingCode || `Booking #${booking.id}`}</p>
                    <StatusBadge tone={bookingTone(status)}>{status}</StatusBadge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{booking.movieTitle || booking.showtime?.movie?.title || 'Không rõ phim'} · {booking.cinemaName || booking.showtime?.cinema?.name || 'Không rõ rạp'}</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-semibold">{currency.format(Number(booking.finalAmount || booking.totalAmount || booking.totalPrice || 0))}</p>
                  <p className="text-xs text-muted-foreground">{booking.bookingDate ? dayjs(booking.bookingDate).format('DD/MM/YYYY HH:mm') : '—'}</p>
                </div>
              </article>
            );
          }) : <Empty description="Chưa có đặt vé gần đây" />}
        </CardContent>
      </Card>
    </section>
  );
};

export default Reports;
