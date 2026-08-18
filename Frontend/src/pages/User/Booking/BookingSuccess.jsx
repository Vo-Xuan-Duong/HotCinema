import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
import { CheckCircle2, Clock3, Download, Home, Mail, Ticket } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
import bookingService from '@/services/bookingService';
import emailService from '@/services/emailService';
import ticketService from '@/services/ticketService';

const readStoredBooking = () => {
  try {
    return JSON.parse(localStorage.getItem('lastBooking') || '{}');
  } catch {
    return {};
  }
};

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : String(value);
};

const formatTime = (value) => {
  if (!value) return '';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('HH:mm') : text;
};

const formatAmount = (value) => {
  const amount = Number(value || 0);
  return `${(Number.isFinite(amount) ? amount : 0).toLocaleString('vi-VN')}đ`;
};

const mapBooking = (booking = {}) => {
  const seats = Array.isArray(booking.seats) ? booking.seats : [];
  const seatNumbers = seats.length
    ? seats.map((seat) => seat.seatName || seat.seatLabel || seat.name || seat.seatNumber).filter(Boolean).join(', ')
    : 'Chưa có thông tin ghế';
  const startTime = formatTime(booking.showtimeStartTime || booking.startTime || booking.showtime?.startTime);
  const endTime = formatTime(booking.showtimeEndTime || booking.endTime || booking.showtime?.endTime);
  const finalAmount = booking.finalAmount ?? booking.totalAmount ?? booking.totalPrice ?? 0;

  return {
    ...booking,
    bookingId: booking.id || booking.bookingId,
    bookingCode: booking.bookingCode || booking.code || '',
    movieTitle: booking.movieTitle || booking.movie?.title || 'Không có thông tin phim',
    cinemaName: booking.cinemaName || booking.cinema?.name || 'N/A',
    cinemaAddress: booking.cinemaAddress || booking.cinema?.address || '',
    roomName: booking.roomName || booking.showtime?.roomName || 'N/A',
    seatNumbers,
    showDate: formatDate(booking.showtimeDateTime || booking.showDate || booking.showtime?.startTime),
    showTime: startTime,
    showTimeEnd: endTime,
    showTimeRange: endTime ? `${startTime} – ${endTime}` : startTime,
    totalAmount: formatAmount(finalAmount),
    totalAmountValue: Number(finalAmount) || 0,
    moviePoster: booking.moviePosterUrl || booking.posterUrl || booking.movie?.posterUrl || '/brand-placeholder.svg',
    formatType: [booking.movieFormat, booking.movieAudioType].filter(Boolean).join(' '),
  };
};

const normalizeQrImage = (booking = {}) => {
  if (booking.qrCodeBase64) {
    return String(booking.qrCodeBase64).startsWith('data:')
      ? booking.qrCodeBase64
      : `data:image/png;base64,${booking.qrCodeBase64}`;
  }
  return booking.qrImageUrl || booking.qrCodeUrl || '';
};

const isConfirmedBooking = (booking = {}) => {
  const paymentStatus = String(booking.paymentStatus || '').toUpperCase();
  const bookingStatus = String(booking.bookingStatus || booking.status || '').toUpperCase();
  return paymentStatus === 'SUCCESS' || ['CONFIRMED', 'COMPLETED'].includes(bookingStatus);
};

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const notification = useNotification();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({});
  const [ticketCapabilityMessage, setTicketCapabilityMessage] = useState('');
  const [bookingCapabilityMessage, setBookingCapabilityMessage] = useState('');
  const [serverHydrated, setServerHydrated] = useState(false);

  const fallbackBooking = useMemo(() => location.state?.bookingData || readStoredBooking(), [location.state]);
  const bookingCodeParam = searchParams.get('bookingCode') || fallbackBooking.bookingCode;
  const bookingIdParam = searchParams.get('bookingId') || fallbackBooking.id || fallbackBooking.bookingId;
  const pdfSupported = ticketService.isPdfDownloadSupported();
  const emailSupported = emailService.isTicketEmailSupported();

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setTicketCapabilityMessage('');
      setBookingCapabilityMessage('');
      setServerHydrated(false);

      let source = fallbackBooking;
      try {
        if (bookingIdParam) {
          source = await bookingService.getMyBookingById(bookingIdParam);
          if (!cancelled) setServerHydrated(Boolean(source));
        } else if (MOCK_API_ENABLED && bookingCodeParam) {
          source = await bookingService.getBookingByCode(bookingCodeParam);
          if (!cancelled) setServerHydrated(Boolean(source));
        }
      } catch (error) {
        console.error('Error hydrating customer booking success:', error);
        if (error?.code === 'BACKEND_CAPABILITY_MISSING' && !cancelled) {
          setBookingCapabilityMessage(error.message);
        }
        source = fallbackBooking;
      }

      if (cancelled) return;
      const mapped = mapBooking(source || fallbackBooking);
      setBookingData(mapped);

      const embeddedQr = normalizeQrImage(source || fallbackBooking);
      if (embeddedQr) {
        setQrCodeUrl(embeddedQr);
        setLoading(false);
        return;
      }

      if (!mapped.bookingId) {
        setQrCodeUrl('');
        setLoading(false);
        return;
      }

      try {
        const tickets = await ticketService.resolveBookingQrPayload(mapped.bookingId);
        const qrPayload = tickets?.find((ticket) => ticket.qrPayload)?.qrPayload;
        if (!qrPayload) {
          setQrCodeUrl('');
          setTicketCapabilityMessage('Backend chưa trả về QR token/ticket code có thể dùng làm vé điện tử.');
        } else {
          const image = await QRCode.toDataURL(qrPayload, { width: 300, margin: 2 });
          if (!cancelled) setQrCodeUrl(image);
        }
      } catch (error) {
        if (!cancelled) {
          setQrCodeUrl('');
          if (error?.code === 'BACKEND_CAPABILITY_MISSING') setTicketCapabilityMessage(error.message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [bookingCodeParam, bookingIdParam, fallbackBooking]);

  const confirmed = isConfirmedBooking(bookingData);
  const callbackConfirmed = String(fallbackBooking?.paymentStatus || '').toUpperCase() === 'SUCCESS';
  const trustedConfirmation = confirmed && (serverHydrated || callbackConfirmed || MOCK_API_ENABLED);

  const handleDownloadPDF = async () => {
    if (!pdfSupported || !bookingData.bookingId) return;
    try {
      const pdfBlob = await ticketService.downloadBookingPDF(bookingData.bookingId);
      ticketService.triggerDownload(pdfBlob, `Ve_${bookingData.bookingCode || bookingData.bookingId}.pdf`);
      notification.success('Tải vé thành công!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      notification.error(error?.message || 'Không thể tải vé.');
    }
  };

  const handleSendEmail = async () => {
    if (!emailSupported || !bookingData.bookingId) return;
    try {
      await emailService.sendTicketEmail(bookingData.bookingId);
      notification.success('Đã gửi vé qua email.');
    } catch (error) {
      console.error('Error sending email:', error);
      notification.error(error?.message || 'Không thể gửi email.');
    }
  };

  if (loading) return <ContentLoader message="Đang xác minh thông tin booking..." />;

  const {
    bookingCode = '',
    movieTitle = 'Không có thông tin phim',
    cinemaName = 'N/A',
    cinemaAddress = '',
    roomName = 'N/A',
    seatNumbers = 'N/A',
    showDate = 'N/A',
    showTime = '',
    showTimeRange = '',
    totalAmount = '0đ',
    moviePoster = '/brand-placeholder.svg',
    formatType = '',
  } = bookingData;

  const ticketDetails = [
    ['Rạp chiếu', cinemaName],
    ['Phòng chiếu', roomName],
    ['Ghế', seatNumbers],
    ['Ngày chiếu', showDate],
    ['Giờ chiếu', showTimeRange || showTime || 'N/A'],
    formatType && ['Định dạng', formatType],
  ].filter(Boolean);

  return (
    <div className="min-h-dvh bg-background px-4 py-16 text-foreground">
      <div className="mx-auto w-full max-w-6xl space-y-8">
        <header className="text-center">
          <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border ${trustedConfirmation ? 'status-success' : 'bg-muted text-muted-foreground'}`}>
            {trustedConfirmation ? <CheckCircle2 className="h-7 w-7" /> : <Clock3 className="h-7 w-7" />}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {trustedConfirmation ? 'Đặt vé đã được xác nhận' : 'Booking đang chờ xác minh'}
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            {trustedConfirmation
              ? 'Trạng thái booking/thanh toán đã được xác nhận từ server hoặc callback payment của phiên hiện tại.'
              : 'Frontend có dữ liệu booking cục bộ nhưng chưa có nguồn server-side đủ mạnh để khẳng định giao dịch thành công.'}
          </p>
        </header>

        {!trustedConfirmation && (
          <Alert
            variant="warning"
            showIcon
            message="Chưa xác minh được trạng thái thành công"
            description={bookingCapabilityMessage || 'Không dùng dữ liệu localStorage đơn thuần làm bằng chứng thanh toán. Hãy kiểm tra lại trong lịch sử booking khi backend có API ownership-scoped.'}
          />
        )}

        {ticketCapabilityMessage && (
          <Alert variant="warning" showIcon message="Vé điện tử chưa được backend phát hành đầy đủ" description={ticketCapabilityMessage} />
        )}

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-fit shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Ticket className="h-4 w-4" />Vé điện tử</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {trustedConfirmation && qrCodeUrl ? (
                  <div className="rounded-lg border border-border bg-white p-3"><img src={qrCodeUrl} alt={`QR ticket ${bookingCode || bookingData.bookingId}`} className="h-56 w-56" /></div>
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted p-5 text-center text-sm leading-6 text-muted-foreground">
                    {trustedConfirmation ? 'Chưa có QR do backend phát hành' : 'QR bị ẩn cho đến khi booking được xác minh'}
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                <p className="mt-1 break-all font-mono text-lg font-semibold tracking-wide">{bookingCode || 'N/A'}</p>
              </div>

              {trustedConfirmation && (pdfSupported || emailSupported) && <Separator />}
              {trustedConfirmation && (
                <div className="space-y-2">
                  {pdfSupported && <Button type="button" className="w-full" onClick={handleDownloadPDF} disabled={!bookingData.bookingId}><Download className="mr-2 h-4 w-4" />Tải vé PDF</Button>}
                  {emailSupported && <Button type="button" variant="outline" className="w-full" onClick={handleSendEmail} disabled={!bookingData.bookingId}><Mail className="mr-2 h-4 w-4" />Gửi vé qua email</Button>}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border"><CardTitle>Chi tiết booking</CardTitle></CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                  <img src={moviePoster} alt={movieTitle} className="aspect-[2/3] w-full rounded-lg border border-border object-cover" onError={(event) => { event.currentTarget.src = '/brand-placeholder.svg'; }} />
                  <p className="mt-3 text-xs text-muted-foreground">Phim</p><p className="mt-1 font-semibold">{movieTitle}</p>
                </div>
                <div className="space-y-4">
                  {ticketDetails.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-6 text-sm"><span className="text-muted-foreground">{label}</span><span className="max-w-[65%] text-right font-medium">{value}</span></div>)}
                  {cinemaAddress && <div className="flex items-start justify-between gap-6 text-sm"><span className="text-muted-foreground">Địa chỉ</span><span className="max-w-[65%] text-right font-medium">{cinemaAddress}</span></div>}
                  <Separator />
                  <div className="flex items-center justify-between gap-6"><span className="font-semibold">Tổng thanh toán</span><span className="text-2xl font-semibold text-primary">{totalAmount}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate('/history')}>Xem lịch sử booking</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/')}><Home className="mr-2 h-4 w-4" />Quay về trang chủ</Button>
        </div>
      </div>
    </div>
  );
};

export { isConfirmedBooking, mapBooking, normalizeQrImage };
export default BookingSuccess;
