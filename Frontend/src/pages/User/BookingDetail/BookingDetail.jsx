import { useEffect, useState } from 'react';
import { ArrowLeft, Copy, Download, Loader2, Printer, Ticket } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DetailItem, DetailList } from '@/components/ui/detail-list';
import { Empty } from '@/components/ui/empty';
import { StatusBadge } from '@/components/ui/status-badge';
import ContentLoader from '@/components/Loading/ContentLoader';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';
import useNotification from '@/hooks/useNotification';
import { isUuid, normalizeResourceId } from '@/utils/resourceId';

const statusMeta = (status) => {
  const value = String(status || 'PENDING').toUpperCase();
  if (['PAID', 'CONFIRMED', 'COMPLETED', 'SUCCESS'].includes(value)) return { label: value === 'COMPLETED' ? 'Đã hoàn thành' : 'Đã xác nhận', tone: 'success' };
  if (value === 'FAILED') return { label: 'Thanh toán lỗi', tone: 'destructive' };
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

const displayTime = (value) => {
  if (!value) return '—';
  const raw = String(value);
  if (/^\d{1,2}:\d{2}/.test(raw)) return raw.slice(0, 5);
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? raw : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const BookingDetail = () => {
  const { bookingCode: routeIdentifier } = useParams();
  const navigate = useNavigate();
  const notification = useNotification();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const pdfSupported = ticketService.isPdfDownloadSupported();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const normalized = normalizeResourceId(routeIdentifier);
        const response = !MOCK_API_ENABLED && isUuid(normalized)
          ? await bookingService.getBookingById(normalized)
          : await bookingService.getBookingByCode(routeIdentifier);
        if (active) setBooking(response);
      } catch (requestError) {
        console.error('Error loading booking detail:', requestError);
        if (active) {
          setBooking(null);
          setError(requestError?.message || 'Không thể tải thông tin đặt vé');
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [routeIdentifier]);

  const handleDownload = async () => {
    if (!booking?.id || !pdfSupported) return;
    try {
      setDownloading(true);
      const blob = await ticketService.downloadBookingPDF(booking.id);
      ticketService.triggerDownload(blob, `ticket-${booking.bookingCode || booking.id}.pdf`);
      notification.success('Đã tải vé PDF');
    } catch (requestError) {
      console.error('Error downloading ticket:', requestError);
      notification.error(requestError?.message || 'Không thể tải vé PDF');
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
  if (!booking) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-10">
        <Alert type={error.includes('backend') ? 'info' : 'error'} showIcon message="Không thể tải booking" description={error || 'Booking không tồn tại hoặc không thể truy cập.'} />
        <div className="mt-5"><Button variant="outline" onClick={() => navigate('/history')}><ArrowLeft className="h-4 w-4" />Quay lại lịch sử</Button></div>
      </main>
    );
  }

  const status = statusMeta(booking.paymentStatus || booking.bookingStatus || booking.status);
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const showDate = booking.showDate || booking.showtimeDate || booking.showtimeDateTime || booking.showtime?.startTime;
  const startTime = booking.startTime || booking.showtime?.startTime;
  const endTime = booking.endTime || booking.showtime?.endTime;
  const total = booking.finalAmount ?? booking.totalAmount ?? booking.totalPrice ?? 0;

  return (
    <main className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Button variant="ghost" className="mb-2 -ml-3" onClick={() => navigate('/history')}><ArrowLeft className="h-4 w-4" />Lịch sử đặt vé</Button>
            <h1 className="text-2xl font-bold tracking-tight">Chi tiết đặt vé</h1>
            <p className="mt-1 text-sm text-muted-foreground">Booking {booking.bookingCode || booking.id}.</p>
          </div>
          <div className="flex gap-2">
            {pdfSupported && <Button variant="outline" onClick={handleDownload} disabled={!booking.id || downloading}>{downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Tải vé PDF</Button>}
            <Button onClick={() => window.print()}><Printer className="h-4 w-4" />In trang</Button>
          </div>
        </div>

        {!pdfSupported && (
          <Alert type="info" showIcon message="PDF ticket chưa được backend hỗ trợ" description="Backend hiện chỉ có Ticket CRUD. FE không tạo file PDF giả hoặc tải JSON dưới đuôi .pdf." />
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-5">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Ticket className="h-4 w-4" />Vé HotCinema</CardTitle></CardHeader>
              <CardContent className="space-y-5 text-center">
                {booking.qrCodeBase64 ? (
                  <img src={`data:image/png;base64,${booking.qrCodeBase64}`} alt="QR Code vé" className="mx-auto aspect-square w-full max-w-64 rounded-md border bg-white p-2" />
                ) : (
                  <div className="mx-auto flex aspect-square w-full max-w-64 items-center justify-center rounded-md border bg-muted/30 text-sm text-muted-foreground">QR server-issued chưa khả dụng</div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                  <div className="mt-1 flex items-center justify-center gap-2"><span className="text-xl font-semibold tracking-wide">{booking.bookingCode || booking.id}</span>{booking.bookingCode && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyCode} aria-label="Sao chép mã đặt vé"><Copy className="h-4 w-4" /></Button>}</div>
                </div>
                <StatusBadge tone={status.tone} className="text-sm">{status.label}</StatusBadge>
              </CardContent>
            </Card>
            {(booking.moviePosterUrl || booking.posterUrl) && <Card className="overflow-hidden"><img src={booking.moviePosterUrl || booking.posterUrl} alt={booking.movieTitle || 'Poster phim'} className="aspect-[2/3] w-full object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} /></Card>}
          </div>

          <div className="space-y-5">
            <Card><CardHeader><CardTitle className="text-lg">Phim & suất chiếu</CardTitle></CardHeader><CardContent><DetailList columns={2}><DetailItem label="Tên phim"><span className="font-medium">{booking.movieTitle || booking.movie?.title || 'N/A'}</span></DetailItem><DetailItem label="Định dạng">{booking.movieFormat || booking.formatType || booking.showtime?.format || 'N/A'}</DetailItem><DetailItem label="Rạp chiếu">{booking.cinemaName || booking.cinema?.name || 'N/A'}</DetailItem><DetailItem label="Phòng chiếu">{booking.roomName || booking.showtime?.roomName || 'N/A'}</DetailItem><DetailItem label="Ngày chiếu">{displayDate(showDate)}</DetailItem><DetailItem label="Giờ chiếu">{displayTime(startTime)}{endTime ? ` - ${displayTime(endTime)}` : ''}</DetailItem><DetailItem label="Địa chỉ" wide>{booking.cinemaAddress || booking.cinema?.address || 'N/A'}</DetailItem></DetailList></CardContent></Card>

            <Card><CardHeader><CardTitle className="text-lg">Ghế</CardTitle></CardHeader><CardContent>{seats.length ? <div className="flex flex-wrap gap-2">{seats.map((seat, index) => <StatusBadge key={seat.id || `${seat.seatName || seat.name}-${index}`} tone="info">{seat.seatName || seat.seatLabel || seat.name || `Ghế ${index + 1}`}{seat.seatType || seat.type ? ` · ${seat.seatType || seat.type}` : ''}</StatusBadge>)}</div> : <p className="text-sm text-muted-foreground">BookingResponse hiện không trả danh sách ghế chi tiết.</p>}</CardContent></Card>

            <Card><CardHeader><CardTitle className="text-lg">Thanh toán</CardTitle></CardHeader><CardContent><DetailList columns={2}><DetailItem label="Tiền ghế">{money(booking.seatAmount ?? 0)}</DetailItem><DetailItem label="Đồ ăn">{money(booking.foodAmount ?? 0)}</DetailItem><DetailItem label="Giảm giá">{money(booking.discountAmount ?? 0)}</DetailItem><DetailItem label="Tạm tính">{money(booking.subtotal ?? 0)}</DetailItem><DetailItem label="Tổng tiền"><span className="text-lg font-semibold">{money(total)}</span></DetailItem><DetailItem label="Tiền tệ">{booking.currency || 'VND'}</DetailItem><DetailItem label="Ngày đặt vé" wide>{displayDate(booking.createdAt || booking.bookingDate, true)}</DetailItem></DetailList></CardContent></Card>

            <Card><CardHeader><CardTitle className="text-lg">Khách hàng</CardTitle></CardHeader><CardContent><DetailList columns={2}><DetailItem label="Họ tên">{booking.customerName || booking.userName || booking.userFullName || booking.user?.fullName || 'N/A'}</DetailItem><DetailItem label="Email">{booking.customerEmail || booking.userEmail || booking.user?.email || 'N/A'}</DetailItem><DetailItem label="Điện thoại">{booking.customerPhone || 'N/A'}</DetailItem><DetailItem label="Booking ID">{booking.id}</DetailItem></DetailList></CardContent></Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingDetail;
