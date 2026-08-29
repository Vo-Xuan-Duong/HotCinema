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
  return { label: 'Chờ thanh toán', tone: 'warning' };
};

const formatMoney = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
}).format(Number(value || 0));

const formatShowtime = (value) => {
  if (!value) return 'Chưa có lịch chiếu';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

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
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await bookingService.getMyBookingHistory();
      setBookings(Array.isArray(result) ? result : []);
    } catch (requestError) {
      setBookings([]);
      setError(requestError?.message || 'Không thể tải lịch sử đặt vé.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const bookingStatus = String(booking.status || 'PENDING').toUpperCase();
      const matchesStatus = status === 'all'
        || bookingStatus === status
        || (status === 'PENDING' && bookingStatus === 'PENDING_PAYMENT');
      const searchable = [
        booking.bookingCode,
        booking.movieTitle,
        booking.cinemaName,
        booking.roomName,
      ].filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!keyword || searchable.includes(keyword));
    });
  }, [bookings, query, status]);

  const cancelBooking = async (booking) => {
    if (!window.confirm(`Hủy đơn ${booking.bookingCode || booking.id}? Ghế đang giữ sẽ được trả lại.`)) return;
    setCancellingId(booking.id);
    try {
      const cancelled = await bookingService.cancelMyBooking(booking.id);
      setBookings((items) => items.map((item) => (
        item.id === booking.id ? { ...item, ...cancelled, status: 'CANCELLED' } : item
      )));
      notification.success('Đã hủy đơn và trả lại ghế.');
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
            <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
            <SelectItem value="PAID">Đã thanh toán</SelectItem>
            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
            <SelectItem value="COMPLETED">Đã hoàn thành</SelectItem>
            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
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
            const normalizedStatus = String(booking.status || 'PENDING').toUpperCase();
            const meta = statusMeta(normalizedStatus);
            const canCancel = ['PENDING', 'PENDING_PAYMENT'].includes(normalizedStatus);
            const code = booking.bookingCode || String(booking.id);
            const seatCount = booking.seats?.length || booking.tickets?.length;
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
                  <h2 className="text-base font-semibold">{booking.movieTitle || 'Chưa có tên phim'}</h2>
                  <p>{booking.cinemaName || 'Chưa có tên rạp'}{booking.roomName ? ` · ${booking.roomName}` : ''}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {formatShowtime(booking.showtimeStartTime)}
                  </p>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-muted-foreground">
                      <Ticket className="mr-1 inline size-4" />
                      {seatCount ? `${seatCount} ghế` : 'Xem chi tiết ghế'}
                    </span>
                    <strong>{formatMoney(booking.totalAmount)}</strong>
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
