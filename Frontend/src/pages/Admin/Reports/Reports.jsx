import { useEffect, useMemo, useState } from 'react';
import { Download, Home, Loader2, RefreshCw, Ticket, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import revenueService from '@/services/revenueService';
import bookingService from '@/services/bookingService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeField } from '@/components/ui/date-field';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

const Reports = () => {
  const navigate = useNavigate();
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

  const loadReport = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryResult, dailyResult, bookingResult] = await Promise.all([
        revenueService.getSummary(params),
        revenueService.getByDate(params),
        bookingService.listPage({ page: 0, size: 10, sort: 'bookingDate,desc' }),
      ]);
      setSummary(summaryResult || {});
      setDailyRevenue(Array.isArray(dailyResult) ? dailyResult : []);
      setBookings(bookingResult?.content || []);
    } catch (requestError) {
      setError(requestError?.message || 'Không thể tải dữ liệu báo cáo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [params.startDate, params.endDate]);

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
    anchor.click();
    URL.revokeObjectURL(url);
    notification.success('Đã xuất báo cáo CSV.');
  };

  const stats = [
    { label: 'Tổng doanh thu', value: currency.format(Number(summary.totalRevenue || 0)), icon: WalletCards },
    { label: 'Số đặt vé', value: Number(summary.totalBookings || 0).toLocaleString('vi-VN'), icon: Ticket },
    { label: 'Số vé đã bán', value: Number(summary.totalTickets || 0).toLocaleString('vi-VN'), icon: Ticket },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button variant="ghost" className="-ml-3 mb-1 gap-2" onClick={() => navigate('/admin/dashboard')}>
            <Home className="size-4" /> Dashboard
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Báo cáo doanh thu</h1>
          <p className="mt-1 text-sm text-muted-foreground">Dữ liệu được tổng hợp trực tiếp từ giao dịch thực tế.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <DateRangeField value={dateRange} onValueChange={setDateRange} format="DD/MM/YYYY" />
          <Button variant="outline" onClick={loadReport} disabled={loading}>
            <RefreshCw className={`mr-2 size-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
          <Button onClick={exportCsv} disabled={loading || !dailyRevenue.length}>
            <Download className="mr-2 size-4" /> Xuất CSV
          </Button>
        </div>
      </div>

      {error && <Alert variant="destructive" message="Không thể tải báo cáo" description={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-5">
              <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{loading ? '—' : value}</p></div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon className="size-5" /></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Đặt vé gần đây</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex min-h-32 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 size-5 animate-spin" /> Đang tải...</div>
          ) : bookings.length ? bookings.map((booking) => (
            <article key={booking.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{booking.userName || booking.user?.fullName || booking.bookingCode}</p>
                  <Badge variant="secondary">{booking.status || 'PENDING'}</Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">{booking.movieTitle || booking.showtime?.movie?.title} · {booking.cinemaName || booking.showtime?.cinema?.name}</p>
              </div>
              <div className="sm:text-right">
                <p className="font-semibold">{currency.format(Number(booking.totalAmount || booking.totalPrice || 0))}</p>
                <p className="text-xs text-muted-foreground">{booking.bookingDate ? dayjs(booking.bookingDate).format('DD/MM/YYYY HH:mm') : '—'}</p>
              </div>
            </article>
          )) : <p className="py-10 text-center text-sm text-muted-foreground">Chưa có dữ liệu đặt vé trong kỳ.</p>}
        </CardContent>
      </Card>
    </section>
  );
};

export default Reports;
