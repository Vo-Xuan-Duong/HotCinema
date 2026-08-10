import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Loader2, RefreshCw, Search, Ticket, XCircle } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import bookingService from '@/services/bookingService';
import useNotification from '@/hooks/useNotification';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusLabels = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Đã hoàn thành',
  cancelled: 'Đã hủy',
  canceled: 'Đã hủy',
};

const normalizeStatus = (status) => String(status || 'pending').toLowerCase();
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

  const loadBookings = async () => {
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
  };

  useEffect(() => {
    loadBookings();
  }, [user?.id]);

  const filteredBookings = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const bookingStatus = normalizeStatus(booking.status);
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
      await bookingService.updateBookingStatus(booking.id, 'cancelled');
      setBookings((items) => items.map((item) => (
        item.id === booking.id ? { ...item, status: 'cancelled' } : item
      )));
      notification.success('Đã hủy đơn đặt vé.');
    } catch (requestError) {
      notification.error(requestError?.message || 'Không thể hủy đơn đặt vé.');
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
            <SelectItem value="pending">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="completed">Đã hoàn thành</SelectItem>
            <SelectItem value="cancelled">Đã hủy</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={loadBookings}>
          <RefreshCw className="mr-2 size-4" /> Làm mới
        </Button>
      </div>

      {error && (
        <Alert
          variant="destructive"
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
          <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center">
            <Ticket className="size-12 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">Chưa có đơn đặt vé phù hợp</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {bookings.length ? 'Hãy thay đổi từ khóa hoặc bộ lọc.' : 'Các đơn đặt vé sẽ xuất hiện tại đây.'}
              </p>
            </div>
            {!bookings.length && <Button asChild><Link to="/movies">Chọn phim ngay</Link></Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {filteredBookings.map((booking) => {
            const bookingStatus = normalizeStatus(booking.status);
            const canCancel = ['pending', 'confirmed'].includes(bookingStatus);
            const code = booking.bookingCode || String(booking.id);
            return (
              <Card key={booking.id || code} className="overflow-hidden">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                      <CardTitle className="text-lg">{code}</CardTitle>
                    </div>
                    <Badge variant={bookingStatus === 'cancelled' || bookingStatus === 'canceled' ? 'destructive' : 'secondary'}>
                      {statusLabels[bookingStatus] || booking.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <h2 className="text-base font-semibold">{booking.movieTitle || booking.movie?.title || 'Chưa có tên phim'}</h2>
                  <p>{booking.cinemaName || booking.cinema?.name || 'Chưa có tên rạp'}{booking.roomName ? ` · ${booking.roomName}` : ''}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {booking.showtimeDate || booking.date || booking.showtime?.date || 'Chưa có ngày'} · {booking.startTime || booking.showtime?.startTime || '—'}
                  </p>
                  <div className="flex items-center justify-between border-t pt-3">
                    <span className="text-muted-foreground">{booking.seats?.length || booking.tickets?.length || 0} ghế</span>
                    <strong>{formatMoney(booking.totalAmount || booking.totalPrice)}</strong>
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
