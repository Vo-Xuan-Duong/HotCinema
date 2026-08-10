import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Download, Loader2, Printer, Ticket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import ContentLoader from '@/components/Loading/ContentLoader';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import useNotification from '@/hooks/useNotification';

const statusMeta = (status) => {
  const value = String(status || 'PENDING').toUpperCase();
  if (['PAID', 'CONFIRMED', 'COMPLETED', 'SUCCESS'].includes(value)) return { label: value === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã xác nhận', tone: 'success' };
  if (['FAILED'].includes(value)) return { label: 'Thanh toán lỗi', tone: 'destructive' };
  if (['CANCELLED', 'CANCELED'].includes(value)) return { label: 'Đã hủy', tone: 'neutral' };
  if (value === 'REFUNDED') return { label: 'Đã hoàn tiền', tone: 'info' };
  if (value === 'EXPIRED') return { label: 'Hết hạn', tone: 'neutral' };
  return { label: 'Đang chờ xử lý', tone: 'warning' };
};

const money = (value) => `${Number(value || 0).toLocaleString('vi-VN')} ₫`;
const displayDate = (value, withTime = false) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return withTime ? date.toLocaleString('vi-VN') : date.toLocaleDateString('vi-VN');
};

const BookingDetail = () => {
  const { bookingCode } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    bookingService.getBookingByCode(bookingCode)
      .then((response) => active && setBooking(response))
      .catch((error) => {
        console.error('Error loading booking detail:', error);
        if (active) {
          notification.error('Không thể tải thông tin đặt vé');
          navigate('/history');
        }
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [bookingCode, navigate, notification]);

  const handleDownload = async () => {
    if (!booking?.id) return;
    try {
      setDownloading(true);
      const blob = await ticketService.downloadBookingPDF(booking.id);
      ticketService.triggerDownload(blob, `ticket-${booking.bookingCode || booking.id}.pdf`);
      notification.success('Đã tải vé PDF');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      notification.error('Không thể tải vé PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyCode = async () => {
    if (!booking?.bookingCode) return;
    try {
      await navigator.clipboard.writeText(booking.bookingCode);
      notification.success('Đã sao chép mã đặt vé');
    } catch {
      notification.error('Không thể sao chép mã đặt vé');
    }
  };

  if (loading) return <ContentLoader message="Đang tải thông tin vé..." />;
  if (!booking) return <Empty description="Không tìm thấy thông tin đặt vé" />;

  const status = statusMeta(booking.paymentStatus || booking.bookingStatus || booking.status);
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const showDate = booking.showDate || booking.showtimeDate || booking.showtimeDateTime;
  const startTime = booking.startTime || booking.showtimeStartTime || booking.showtime?.startTime;
  const endTime = booking.endTime || booking.showtimeEndTime || booking.showtime?.endTime;
  const total = booking.finalAmount ?? booking.totalAmount ?? booking.totalPrice ?? 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => navigate('/history')}><ArrowLeft className="h-4 w-4" />Lịch sử đặt vé</Button>
            <h1 className="text-2xl font-bold tracking-tight">Chi tiết đặt vé</h1>
            <p className="mt-1 text-sm text-muted-foreground">Thông tin vé và giao dịch của mã {booking.bookingCode || booking.id}.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDownload} disabled={!booking.id || downloading}>{downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Tải vé PDF</Button>
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" />In vé</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Ticket className="h-4 w-4" />Vé HotCinema</CardTitle></CardHeader>
              <CardContent className="space-y-5 text-center">
                {booking.qrCodeBase64 ? (
                  <img src={`data:image/png;base64,${booking.qrCodeBase64}`} alt="QR Code vé" className="mx-auto aspect-square w-full max-w-64 rounded-md border bg-white p-2" />
                ) : (
                  <div className="mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">QR Code không khả dụng</div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="text-xl font-semibold tracking-wide">{booking.bookingCode || booking.id}</span>
                    {booking.bookingCode && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode} aria-label="Sao chép mã đặt vé"><Copy className="h-4 w-4" /></Button>}
                  </div>
                </div>
                <StatusBadge tone={status.tone} className="text-sm">{status.label}</StatusBadge>
              </CardContent>
            </Card>

            {(booking.moviePosterUrl || booking.posterUrl) && (
              <Card className="overflow-hidden"><img src={booking.moviePosterUrl || booking.posterUrl} alt={booking.movieTitle || 'Poster phim'} className="aspect-[2/3] w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /></Card>
            )}
          </div>

          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="text-lg">Phim & suất chiếu</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Tên phim"><span className="font-medium">{booking.movieTitle || booking.movie?.title || 'N/A'}</span></DetailItem>
                  <DetailItem label="Định dạng">{booking.movieFormat || booking.formatType || booking.showtime?.format || 'N/A'}</DetailItem>
                  <DetailItem label="Rạp chiếu">{booking.cinemaName || booking.cinema?.name || 'N/A'}</DetailItem>
                  <DetailItem label="Phòng chiếu">{booking.roomName || booking.showtime?.roomName || 'N/A'}</DetailItem>
                  <DetailItem label="Ngày chiếu">{displayDate(showDate)}</DetailItem>
                  <DetailItem label="Giờ chiếu">{startTime || '—'}{endTime ? ` - ${endTime}` : ''}</DetailItem>
                  <DetailItem label="Địa chỉ" wide>{booking.cinemaAddress || booking.cinema?.address || 'N/A'}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Ghế</CardTitle></CardHeader>
              <CardContent>
                {seats.length ? <div className="flex flex-wrap gap-2">{seats.map((seat, index) => <StatusBadge key={seat.id || `${seat.seatName || seat.name}-${index}`} tone="info">{seat.seatName || seat.seatLabel || seat.name || `Ghế ${index + 1}`}{seat.seatType || seat.type ? ` · ${seat.seatType || seat.type}` : ''}</StatusBadge>)}</div> : <p className="text-sm text-muted-foreground">Không có thông tin ghế.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Thanh toán</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Giá gốc">{money(booking.originalPrice ?? booking.totalAmount ?? total)}</DetailItem>
                  <DetailItem label="Giảm giá"><span className={Number(booking.discountAmount || 0) > 0 ? 'text-destructive' : ''}>{Number(booking.discountAmount || 0) > 0 ? `-${money(booking.discountAmount)}` : money(0)}</span></DetailItem>
                  <DetailItem label="Tổng tiền"><span className="text-lg font-semibold">{money(total)}</span></DetailItem>
                  <DetailItem label="Phương thức">{booking.paymentMethod || 'N/A'}</DetailItem>
                  <DetailItem label="Ngày đặt vé" wide>{displayDate(booking.bookingDate || booking.createdAt, true)}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Khách hàng</CardTitle></CardHeader>
              <CardContent>
                <DetailList columns={2}>
                  <DetailItem label="Họ tên">{booking.userName || booking.userFullName || booking.user?.fullName || 'N/A'}</DetailItem>
                  <DetailItem label="Email">{booking.userEmail || booking.user?.email || 'N/A'}</DetailItem>
                </DetailList>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingDetail;
