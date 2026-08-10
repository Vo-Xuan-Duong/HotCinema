import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Loader2, RefreshCw, Search, Ticket, XCircle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import bookingService from '@/services/bookingService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Empty } from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';

const statusMeta = (status) => {
  const value = String(status || 'PENDING').toUpperCase();
  if (value === 'CONFIRMED' || value === 'PAID') return { label: 'Đã xác nhận', tone: 'success' };
  if (value === 'COMPLETED') return { label: 'Đã hoàn thành', tone: 'success' };
  if (value === 'CANCELLED' || value === 'CANCELED') return { label: 'Đã hủy', tone: 'neutral' };
  if (value === 'FAILED') return { label: 'Thất bại', tone: 'destructive' };
  if (value === 'EXPIRED') return { label: 'Hết hạn', tone: 'neutral' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  return { label: 'Chờ xác nhận', tone: 'warning' };
};

const asArray = (value) => {
  const data = value?.data ?? value;
  if (Array.isArray(data)) return data;
  return Array.isArray(data?.content) ? data.content : [];
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(Number(value || 0));

const BookingHistory = () => {
  const { user } = useAuth();
  const notification = useNotification();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const loadBookings = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const result = await bookingService.getBookingHistoryByUserId(user.id);
      setBookings(asArray(result));
    } catch (requestError) {
      setBookings([]);
      setError(requestError?.message || 'Không thể tải lịch sử đặt vé.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const bookingStatus = String(booking.bookingStatus || booking.paymentStatus || booking.status || 'PENDING').toUpperCase();
      const matchesStatus = status === 'all' || bookingStatus === status;
      const searchable = [
        booking.bookingCode,
        booking.movieTitle,
        booking.movie?.title,
        booking.cinemaName,
        booking.cinema?.name,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!keyword || searchable.includes(keyword));
    });
  }, [bookings, query, status]);

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Hủy đơn ${booking.bookingCode || booking.id}?`)) return;
    setCancellingId(booking.id);
    try {
      await bookingService.updateBookingStatus(booking.id, 'CANCELLED');
      setBookings((items) => items.map((item) => (
        item.id === booking.id ? { ...item, status: 'CANCELLED', bookingStatus: 'CANCELLED' } : item
      )));
      notification.success('Đã hủy đơn đặt vé.');
    } catch (requestError) {
      notification.error(requestError?.response?.data?.message || requestError?.message || 'Không thể hủy đơn đặt vé.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <main className="container mx-auto max-w-6xl px-4 py-8 sm:py-12">
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Lịch sử đặt vé</h1>
        <p className="text-muted-foreground">Theo dõi và quản lý các đơn đặt vé của bạn.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_220px_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm theo mã vé, phim hoặc rạp"
            aria-label="Tìm đơn đặt vé"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger aria-label="Lọc trạng thái"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadBookings} disabled={loading}>
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
          Làm mới
        </Button>
      </div>

      {error && (
        <Alert
          variant="destructive"
          showIcon
          className="mb-6"
          message="Không thể tải lịch sử"
          description={error}
        />
      )}

      {loading ? (
        <div className="flex min-h-64 items-center justify-center text-muted-foreground">
          <Loader2 className="mr-2 size-5 animate-spin" /> Đang tải lịch sử...
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12">
            <Empty description={bookings.length ? 'Không có đơn đặt vé phù hợp với bộ lọc' : 'Bạn chưa có đơn đặt vé nào'} />
            {!bookings.length && <div className="mt-5 flex justify-center"><Button asChild><Link to="/movies">Chọn phim ngay</Link></Button></div>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredBookings.map((booking) => {
            const rawStatus = booking.bookingStatus || booking.paymentStatus || booking.status || 'PENDING';
            const normalizedStatus = String(rawStatus).toUpperCase();
            const meta = statusMeta(rawStatus);
            const canCancel = ['PENDING', 'CONFIRMED'].includes(normalizedStatus);
            const code = booking.bookingCode || String(booking.id);
            const showDate = booking.showDate || booking.showtimeDate || booking.date || booking.showtime?.date;
            const startTime = booking.startTime || booking.showtime?.startTime;
            return (
              <Card key={booking.id || code} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                      <CardTitle className="text-lg">{code}</CardTitle>
                    </div>
                    <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <h2 className="text-base font-semibold">{booking.movieTitle || booking.movie?.title || 'Chưa có tên phim'}</h2>
                  <p>{booking.cinemaName || booking.cinema?.name || 'Chưa có tên rạp'}{booking.roomName ? ` · ${booking.roomName}` : ''}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {showDate || 'Chưa có ngày'} · {startTime || '—'}
                  </p>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-muted-foreground"><Ticket className="mr-1 inline size-4" />{booking.seats?.length || booking.tickets?.length || 0} ghế</span>
                    <strong>{formatMoney(booking.finalAmount ?? booking.totalAmount ?? booking.totalPrice)}</strong>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 border-t bg-muted/30 py-4 sm:flex-row">
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link to={`/booking-detail/${encodeURIComponent(code)}`}>Xem chi tiết</Link>
                  </Button>
                  {canCancel && (
                    <Button
                      variant="destructive"
                      className="w-full sm:ml-auto sm:w-auto"
                      disabled={cancellingId === booking.id}
                      onClick={() => cancelBooking(booking)}
                    >
                      {cancellingId === booking.id
                        ? <Loader2 className="mr-2 size-4 animate-spin" />
                        : <XCircle className="mr-2 size-4" />}
                      Hủy đặt vé
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default BookingHistory;
