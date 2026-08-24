import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
import { CheckCircle2, Download, Home, TicketCheck } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';
import bookingService from '@/services/bookingService';
import ticketService from '@/services/ticketService';

const readStoredBooking = () => {
  try {
    return JSON.parse(localStorage.getItem('lastBooking') || '{}');
  } catch {
    return {};
  }
};

const formatDate = (value) => {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format('DD/MM/YYYY') : String(value);
};

const formatTime = (value) => {
  if (!value) return '';
  const date = dayjs(value);
  if (date.isValid()) return date.format('HH:mm');
  const text = String(value);
  return /^\d{2}:\d{2}/.test(text) ? text.slice(0, 5) : text;
};

const formatAmount = (value) => {
  const amount = typeof value === 'number' ? value : Number.parseFloat(value || 0);
  return `${(Number.isFinite(amount) ? amount : 0).toLocaleString('vi-VN')}đ`;
};

const BookingSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const notification = useNotification();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({});
  const [tickets, setTickets] = useState([]);
  const [ticketQrById, setTicketQrById] = useState({});

  const bookingCodeParam = searchParams.get('bookingCode')
    || location.state?.bookingData?.bookingCode
    || readStoredBooking().bookingCode;

  useEffect(() => {
    let cancelled = false;

    const createTicketQr = async (qrToken) => {
      if (!qrToken) return '';
      return QRCode.toDataURL(String(qrToken), {
        width: 280,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    };

    const load = async () => {
      setLoading(true);
      try {
        let bookingDetails = location.state?.bookingData || readStoredBooking();
        if (bookingCodeParam) {
          bookingDetails = await bookingService.getBookingByCode(bookingCodeParam);
        }
        if (cancelled) return;

        let loadedTickets = [];
        if (bookingDetails?.id) {
          try {
            loadedTickets = await ticketService.getTicketsByBooking(bookingDetails.id);
          } catch (error) {
            console.error('Error loading issued tickets:', error);
          }
        }
        if (cancelled) return;

        const qrEntries = await Promise.all(
          loadedTickets.map(async (ticket) => [ticket.id, await createTicketQr(ticket.qrToken)])
        );
        if (cancelled) return;

        const firstTicket = loadedTickets[0] || {};
        const seatNumbers = loadedTickets.length
          ? loadedTickets.map((ticket) => ticket.seatName).filter(Boolean).join(', ')
          : (bookingDetails.seatNumbers || 'Chưa có thông tin ghế');
        const showtimeStart = firstTicket.showtimeStartTime || bookingDetails.showtimeStartTime;
        const showtimeEnd = firstTicket.showtimeEndTime || bookingDetails.showtimeEndTime;
        const finalAmount = bookingDetails.totalAmount ?? bookingDetails.finalAmount ?? 0;
        const formatType = [
          firstTicket.showtimeFormat || bookingDetails.movieFormat,
          firstTicket.language,
          firstTicket.subtitle,
        ].filter(Boolean).join(' · ');

        setTickets(loadedTickets);
        setTicketQrById(Object.fromEntries(qrEntries));
        setBookingData({
          bookingId: bookingDetails.id,
          bookingCode: bookingDetails.bookingCode || bookingCodeParam,
          status: bookingDetails.status,
          movieTitle: firstTicket.movieTitle || bookingDetails.movieTitle || 'Không có thông tin phim',
          cinemaName: firstTicket.cinemaName || bookingDetails.cinemaName || 'N/A',
          cinemaAddress: firstTicket.cinemaAddress || bookingDetails.cinemaAddress || '',
          roomName: firstTicket.roomName || bookingDetails.roomName || 'N/A',
          seatNumbers,
          showDate: formatDate(showtimeStart || bookingDetails.showtimeDateTime || bookingDetails.showDate),
          showTime: formatTime(showtimeStart),
          showTimeEnd: formatTime(showtimeEnd),
          showTimeRange: showtimeEnd
            ? `${formatTime(showtimeStart)} – ${formatTime(showtimeEnd)}`
            : formatTime(showtimeStart),
          totalAmount: formatAmount(finalAmount),
          totalAmountValue: Number(finalAmount) || 0,
          discountAmount: Number(bookingDetails.discountAmount) || 0,
          moviePoster: firstTicket.moviePosterUrl || bookingDetails.moviePosterUrl || '/brand-placeholder.svg',
          customerName: bookingDetails.customerName || bookingDetails.userName,
          customerEmail: bookingDetails.customerEmail || bookingDetails.userEmail,
          formatType,
        });
      } catch (error) {
        console.error('Error fetching booking details:', error);
        if (!cancelled) {
          setBookingData(location.state?.bookingData || readStoredBooking());
          setTickets([]);
          setTicketQrById({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [bookingCodeParam, location.state]);

  const handleDownloadQr = (ticket) => {
    const dataUrl = ticketQrById[ticket.id];
    if (!dataUrl) {
      notification.error('Không thể tải mã QR của vé này');
      return;
    }
    ticketService.triggerDownloadDataUrl(dataUrl, `HotCinema_${ticket.ticketCode || ticket.id}.png`);
  };

  if (loading) {
    return <ContentLoader message="Đang tải thông tin vé..." />;
  }

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
          <div className="status-success mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Đặt vé thành công</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            Mỗi ghế có một mã QR riêng. Hãy xuất trình đúng mã vé khi vào rạp.
          </p>
        </header>

        {tickets.length > 0 ? (
          <Alert
            type="success"
            showIcon
            message={`Đã phát hành ${tickets.length} vé`}
            description="QR bên dưới là token vé do hệ thống phát hành sau khi thanh toán được xác nhận."
          />
        ) : (
          <Alert
            type="warning"
            showIcon
            message="Chưa tìm thấy vé đã phát hành"
            description="Booking đã được ghi nhận nhưng ticket chưa có. Hãy tải lại trang sau khi thanh toán được backend xác nhận."
          />
        )}

        <div className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="h-fit shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TicketCheck className="h-5 w-5" />
                Vé điện tử
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {tickets.length > 0 ? tickets.map((ticket) => (
                <div key={ticket.id} className="space-y-3 rounded-lg border border-border p-4">
                  <div className="flex justify-center">
                    {ticketQrById[ticket.id] ? (
                      <div className="rounded-lg border border-border bg-white p-2">
                        <img
                          src={ticketQrById[ticket.id]}
                          alt={`QR ticket ${ticket.ticketCode}`}
                          className="h-48 w-48"
                        />
                      </div>
                    ) : (
                      <div className="flex h-48 w-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
                        Không thể tạo QR
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">{ticket.seatName || 'Ghế'}</p>
                    <p className="mt-1 font-mono text-sm font-semibold tracking-wide">
                      {ticket.ticketCode || ticket.id}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">Trạng thái: {ticket.status}</p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleDownloadQr(ticket)}
                    disabled={!ticketQrById[ticket.id]}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Tải mã QR
                  </Button>
                </div>
              )) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Ticket sẽ xuất hiện tại đây sau khi payment callback được xác nhận.
                </div>
              )}

              <Separator />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                <p className="mt-1 font-mono text-xl font-semibold tracking-wider">{bookingCode || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle>Chi tiết suất chiếu</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-[180px_minmax(0,1fr)]">
                <div>
                  <img
                    src={moviePoster}
                    alt={movieTitle}
                    className="aspect-[2/3] w-full rounded-lg border border-border object-cover"
                    onError={(event) => {
                      event.currentTarget.src = '/brand-placeholder.svg';
                    }}
                  />
                  <p className="mt-3 text-xs text-muted-foreground">Phim</p>
                  <p className="mt-1 font-semibold">{movieTitle}</p>
                </div>

                <div className="space-y-4">
                  {ticketDetails.map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between gap-6 text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="max-w-[65%] text-right font-medium">{value}</span>
                    </div>
                  ))}

                  {cinemaAddress && (
                    <div className="flex items-start justify-between gap-6 text-sm">
                      <span className="text-muted-foreground">Địa chỉ</span>
                      <span className="max-w-[65%] text-right font-medium">{cinemaAddress}</span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex items-center justify-between gap-6">
                    <span className="font-semibold">Tổng thanh toán</span>
                    <span className="text-2xl font-semibold text-primary">{totalAmount}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center">
          <Button type="button" variant="outline" onClick={() => navigate('/')}>
            <Home className="mr-2 h-4 w-4" />
            Quay về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
