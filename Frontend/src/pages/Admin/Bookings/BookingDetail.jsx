import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, Ticket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AdminPageHeader } from '@/layouts/admin/AdminPageHeader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { StatusBadge } from '@/components/ui/status-badge';
import bookingService from '@/services/bookingService';
import useNotification from '@/hooks/useNotification';

const bookingStatusMeta = (status) => {
  const value = String(status || '').toUpperCase();
  if (['CONFIRMED', 'PAID', 'COMPLETED'].includes(value)) return { label: value === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã xác nhận', tone: 'success' };
  if (value === 'PENDING') return { label: 'Chờ xử lý', tone: 'warning' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { label: 'Đã hủy', tone: 'neutral' };
  if (value === 'FAILED') return { label: 'Thất bại', tone: 'destructive' };
  if (value === 'EXPIRED') return { label: 'Hết hạn', tone: 'neutral' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  return { label: status ? String(status) : 'Chưa có trạng thái', tone: 'neutral' };
};

const paymentStatusMeta = (status) => {
  const value = String(status || '').toUpperCase();
  if (['SUCCESS', 'PAID', 'COMPLETED'].includes(value)) return { label: 'Đã thanh toán', tone: 'success' };
  if (value === 'PENDING') return { label: 'Chờ thanh toán', tone: 'warning' };
  if (value === 'FAILED') return { label: 'Thanh toán lỗi', tone: 'destructive' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { label: 'Đã hủy', tone: 'neutral' };
  return { label: status ? String(status) : 'Chưa có trạng thái', tone: 'neutral' };
};

const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const formatDateTime = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('vi-VN');
};
const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('vi-VN');
};
const shortTime = (value) => value ? String(value).slice(0, 5) : '—';

const BookingDetail = () => {
  const navigate = useNavigate();
  const { bookingCode } = useParams();
  const notification = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const businessCommandsSupported = bookingService.isBookingStatusCommandSupported();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError('');
    bookingService.getAdminBooking(bookingCode)
      .then((response) => active && setBooking(response || null))
      .catch((error) => {
        console.error('Error loading admin booking detail:', error);
        if (!active) return;
        setBooking(null);
        setLoadError(error?.message || 'Không thể tải chi tiết đặt vé');
        notification.error(error?.message || 'Không thể tải chi tiết đặt vé');
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [bookingCode, notification]);

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Đang tải chi tiết đặt vé...</div>;
  }

  if (!booking) {
    return (
      <Alert
        variant="destructive"
        showIcon
        message="Không tìm thấy đặt vé"
        description={loadError || `Không có dữ liệu cho mã hoặc ID ${bookingCode}.`}
        action={<Button onClick={() => navigate('/admin/bookings')}>Quay lại danh sách</Button>}
      />
    );
  }

  const bookingStatus = bookingStatusMeta(booking.bookingStatus || booking.status);
  const paymentStatus = paymentStatusMeta(booking.paymentStatus);
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const showDate = booking.showDate || booking.showtimeDate || booking.showtimeDateTime;
  const startTime = booking.startTime || booking.showtimeStartTime || booking.showtime?.startTime;
  const endTime = booking.endTime || booking.showtimeEndTime || booking.showtime?.endTime;
  const finalAmount = booking.finalAmount ?? booking.totalAmount ?? booking.totalPrice ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Đặt vé #${booking.bookingCode || booking.id}`}
        description="Thông tin booking, suất chiếu, ghế và thanh toán do backend trả về."
        breadcrumbs={[
          { title: 'Dashboard', href: '/admin/dashboard' },
          { title: 'Đặt vé', href: '/admin/bookings' },
          { title: 'Chi tiết' },
        ]}
        actions={<Button variant="outline" onClick={() => navigate('/admin/bookings')}><ArrowLeft className="h-4 w-4" />Quay lại</Button>}
      />

      {!businessCommandsSupported && (
        <Alert
          variant="warning"
          showIcon
          message="Booking hiện ở chế độ quản trị chỉ đọc"
          description="Backend hiện chỉ có CRUD Booking và chưa có command an toàn cho đổi trạng thái, hủy, hoàn tiền hoặc phát hành vé. FE không dùng PUT toàn bộ Booking DTO để giả lập các nghiệp vụ này."
        />
      )}

      {(booking.moviePosterUrl || booking.posterUrl) && (
        <Card className="overflow-hidden">
          <div className="grid md:grid-cols-[180px_minmax(0,1fr)]">
            <img src={booking.moviePosterUrl || booking.posterUrl} alt={booking.movieTitle || 'Poster phim'} className="hidden h-full min-h-64 w-full object-cover md:block" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
            <CardContent className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2"><StatusBadge tone={bookingStatus.tone}>{bookingStatus.label}</StatusBadge><StatusBadge tone={paymentStatus.tone}>{paymentStatus.label}</StatusBadge>{booking.movieFormat && <StatusBadge tone="info">{booking.movieFormat}</StatusBadge>}{booking.movieAudioType && <StatusBadge tone="neutral">{booking.movieAudioType}</StatusBadge>}</div>
              <div><h2 className="text-2xl font-semibold">{booking.movieTitle || booking.movie?.title || 'Không rõ phim'}</h2><p className="mt-1 text-sm text-muted-foreground">{booking.cinemaName || booking.cinema?.name || 'Không rõ rạp'}{booking.roomName ? ` · ${booking.roomName}` : ''}</p></div>
              {booking.cinemaAddress && <p className="text-sm text-muted-foreground">{booking.cinemaAddress}</p>}
            </CardContent>
          </div>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Ticket className="h-4 w-4 text-muted-foreground" />Thông tin đặt vé</CardTitle></CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Booking ID">{booking.id || 'N/A'}</DetailItem>
              <DetailItem label="Mã đặt vé">{booking.bookingCode || booking.code || 'N/A'}</DetailItem>
              <DetailItem label="Trạng thái"><StatusBadge tone={bookingStatus.tone}>{bookingStatus.label}</StatusBadge></DetailItem>
              <DetailItem label="Ngày đặt">{formatDateTime(booking.bookingDate || booking.createdAt)}</DetailItem>
              <DetailItem label="User ID">{booking.userId || booking.user?.id || 'N/A'}</DetailItem>
              <DetailItem label="Khách hàng">{booking.customerName || booking.userName || booking.userFullName || booking.user?.fullName || 'N/A'}</DetailItem>
              <DetailItem label="Email">{booking.customerEmail || booking.userEmail || booking.user?.email || 'N/A'}</DetailItem>
              <DetailItem label="Điện thoại">{booking.customerPhone || booking.userPhone || booking.user?.phone || 'N/A'}</DetailItem>
            </DetailList>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Suất chiếu</CardTitle></CardHeader>
          <CardContent>
            <DetailList columns={2}>
              <DetailItem label="Phim">{booking.movieTitle || booking.movie?.title || 'N/A'}</DetailItem>
              <DetailItem label="Rạp">{booking.cinemaName || booking.cinema?.name || 'N/A'}</DetailItem>
              <DetailItem label="Phòng">{booking.roomName || booking.showtime?.roomName || 'N/A'}</DetailItem>
              <DetailItem label="Showtime ID">{booking.showtimeId || booking.showtime?.id || 'N/A'}</DetailItem>
              <DetailItem label="Ngày chiếu">{formatDate(showDate)}</DetailItem>
              <DetailItem label="Giờ chiếu">{shortTime(startTime)}{endTime ? ` - ${shortTime(endTime)}` : ''}</DetailItem>
            </DetailList>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">Ghế đã chọn ({seats.length})</CardTitle></CardHeader>
        <CardContent>
          {seats.length ? (
            <div className="flex flex-wrap gap-2">
              {seats.map((seat, index) => <StatusBadge key={seat.seatId || seat.id || index} tone="info">{seat.seatName || seat.seatLabel || seat.name || `Ghế ${index + 1}`}{seat.seatType || seat.type ? ` · ${seat.seatType || seat.type}` : ''}{seat.price != null ? ` · ${money(seat.price)}` : ''}</StatusBadge>)}
            </div>
          ) : <p className="text-sm text-muted-foreground">Backend response hiện không kèm chi tiết ghế cho booking này.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Thanh toán</CardTitle></CardHeader>
        <CardContent>
          <DetailList columns={2}>
            <DetailItem label="Trạng thái"><StatusBadge tone={paymentStatus.tone}>{paymentStatus.label}</StatusBadge></DetailItem>
            <DetailItem label="Phương thức">{booking.paymentMethod || 'N/A'}</DetailItem>
            <DetailItem label="Tiền ghế">{money(booking.seatAmount || 0)}</DetailItem>
            <DetailItem label="Đồ ăn / thức uống">{money(booking.foodAmount || 0)}</DetailItem>
            <DetailItem label="Tạm tính">{money(booking.subtotal ?? booking.totalAmount ?? finalAmount)}</DetailItem>
            <DetailItem label="Giảm giá">{money(booking.discountAmount || 0)}</DetailItem>
            <DetailItem label="Thành tiền" wide><span className="text-lg font-semibold">{money(finalAmount)}</span></DetailItem>
          </DetailList>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetail;
