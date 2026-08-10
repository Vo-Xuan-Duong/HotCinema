import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import QRCode from 'qrcode';
import { CheckCircle2, Download, Home, Mail } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import bookingService from '@/services/bookingService';
import emailService from '@/services/emailService';
import ticketService from '@/services/ticketService';
import useNotification from '@/hooks/useNotification';

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
  return date.isValid() ? date.locale('vi').format('DD/MM/YYYY') : String(value);
};

const formatTime = (value) => {
  if (!value) return '';
  const text = String(value);
  if (/^\d{2}:\d{2}/.test(text)) return text.slice(0, 5);
  const time = dayjs(`2000-01-01 ${text}`);
  return time.isValid() ? time.format('HH:mm') : text;
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
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({});

  const bookingCodeParam = searchParams.get('bookingCode')
    || location.state?.bookingData?.bookingCode
    || readStoredBooking().bookingCode;

  useEffect(() => {
    let cancelled = false;

    const createQrCode = async (bookingCode) => {
      if (!bookingCode) return '';
      return QRCode.toDataURL(`BOOKING:${bookingCode}`, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#FFFFFF' },
      });
    };

    const fetchBookingDetails = async () => {
      setLoading(true);

      try {
        if (bookingCodeParam) {
          const bookingDetails = await bookingService.getBookingByCode(bookingCodeParam);
          if (cancelled) return;

          const seats = Array.isArray(bookingDetails.seats) ? bookingDetails.seats : [];
          const seatNumbers = seats.length
            ? seats.map((seat) => seat.seatName || seat.name || seat.seatNumber || seat.id).filter(Boolean).join(', ')
            : 'Chưa có thông tin ghế';

          const startTime = formatTime(bookingDetails.showtimeStartTime);
          const endTime = formatTime(bookingDetails.showtimeEndTime);
          const finalAmount = bookingDetails.finalAmount ?? bookingDetails.totalAmount ?? 0;
          const formatType = [bookingDetails.movieFormat, bookingDetails.movieAudioType].filter(Boolean).join(' ');

          const combinedData = {
            bookingId: bookingDetails.id,
            bookingCode: bookingDetails.bookingCode,
            status: bookingDetails.status,
            movieTitle: bookingDetails.movieTitle,
            cinemaName: bookingDetails.cinemaName,
            cinemaAddress: bookingDetails.cinemaAddress,
            roomName: bookingDetails.roomName,
            seatNumbers,
            seats,
            showDate: formatDate(bookingDetails.showtimeDateTime || bookingDetails.showDate),
            showTime: startTime,
            showTimeEnd: endTime,
            showTimeRange: endTime ? `${startTime} – ${endTime}` : startTime,
            totalAmount: formatAmount(finalAmount),
            totalAmountValue: Number(finalAmount) || 0,
            discountAmount: Number(bookingDetails.discountAmount) || 0,
            moviePoster: bookingDetails.moviePosterUrl || '/brand-placeholder.svg',
            bookingDate: bookingDetails.bookingDate,
            userName: bookingDetails.userName,
            userEmail: bookingDetails.userEmail,
            formatType,
          };

          setBookingData(combinedData);
          setQrCodeUrl(await createQrCode(combinedData.bookingCode));
        } else {
          const fallbackData = location.state?.bookingData || readStoredBooking();
          if (cancelled) return;
          setBookingData(fallbackData);
          setQrCodeUrl(await createQrCode(fallbackData.bookingCode));
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        if (!cancelled) {
          const fallbackData = location.state?.bookingData || readStoredBooking();
          setBookingData(fallbackData);
          if (fallbackData.bookingCode) setQrCodeUrl(await createQrCode(fallbackData.bookingCode));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBookingDetails();
    return () => {
      cancelled = true;
    };
  }, [bookingCodeParam, location.state]);

  const handleDownloadPDF = async () => {
    if (!bookingData.bookingId) {
      notification.error('Không tìm thấy thông tin booking');
      return;
    }

    try {
      notification.info('Đang tải vé...');
      const pdfBlob = await ticketService.downloadBookingPDF(bookingData.bookingId);
      ticketService.triggerDownload(pdfBlob, `Ve_${bookingData.bookingId}.pdf`);
      notification.success('Tải vé thành công!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      notification.error('Không thể tải vé. Vui lòng thử lại sau.');
    }
  };

  const handleSendEmail = async () => {
    if (!bookingData.bookingId) {
      notification.error('Không tìm thấy thông tin booking');
      return;
    }

    try {
      notification.info('Đang gửi email...');
      await emailService.sendTicketEmail(bookingData.bookingId);
      notification.success('Đã gửi vé qua email thành công!');
    } catch (error) {
      console.error('Error sending email:', error);
      notification.error('Không thể gửi email. Vui lòng thử lại sau.');
    }
  };

  if (loading) {
    return <ContentLoader message="Đang tải thông tin đặt vé..." />;
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
            Vé của bạn đã được ghi nhận. Hãy lưu mã QR hoặc tải vé PDF để sử dụng khi đến rạp.
          </p>
        </header>

        <Alert type="success" showIcon message="Thanh toán thành công" description="Bạn có thể kiểm tra lại thông tin vé trước khi rời trang này." />

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="h-fit shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Mã vé của bạn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-center">
                {qrCodeUrl ? (
                  <div className="rounded-lg border border-border bg-white p-3">
                    <img src={qrCodeUrl} alt={`QR booking ${bookingCode}`} className="h-56 w-56" />
                  </div>
                ) : (
                  <div className="flex h-56 w-56 items-center justify-center rounded-lg border border-dashed border-border bg-muted text-sm text-muted-foreground">
                    Không thể tạo QR
                  </div>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">Mã đặt vé</p>
                <p className="mt-1 font-mono text-xl font-semibold tracking-wider">{bookingCode || 'N/A'}</p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button type="button" className="w-full" onClick={handleDownloadPDF} disabled={!bookingData.bookingId}>
                  <Download className="mr-2 h-4 w-4" />
                  Tải vé PDF
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleSendEmail} disabled={!bookingData.bookingId}>
                  <Mail className="mr-2 h-4 w-4" />
                  Gửi vé qua email
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b border-border">
              <CardTitle>Chi tiết vé</CardTitle>
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
