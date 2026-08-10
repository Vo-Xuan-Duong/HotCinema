import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Home, RotateCcw, XCircle } from 'lucide-react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import ContentLoader from '@/components/Loading/ContentLoader';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import bookingService from '@/services/bookingService';
import paymentService from '@/services/paymentService';

const formatAmount = (value) => {
  if (typeof value === 'number') return `${value.toLocaleString('vi-VN')}đ`;
  if (!value) return '0đ';
  return String(value).includes('đ') ? String(value) : `${value}đ`;
};

const BookingFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [errorData, setErrorData] = useState({});

  const transactionId = searchParams.get('transactionId') || location.state?.errorData?.transactionId;

  useEffect(() => {
    window.scrollTo(0, 0);

    const readFallbackData = () => {
      try {
        return {
          ...(JSON.parse(localStorage.getItem('pendingPayment') || '{}')),
          ...(location.state?.errorData || {}),
        };
      } catch {
        return { ...(location.state?.errorData || {}) };
      }
    };

    const fetchBookingDetails = async () => {
      setLoading(true);

      try {
        if (transactionId) {
          const paymentData = await paymentService.getPaymentByTransactionId(transactionId);
          const bookingDetails = await bookingService.getBookingById(paymentData.bookingId);

          setErrorData({
            errorMessage: location.state?.errorData?.errorMessage || 'Thanh toán không thành công',
            reason: location.state?.errorData?.reason || 'Lỗi không xác định',
            movieTitle: bookingDetails.movieTitle || bookingDetails.movie?.title,
            cinemaName: bookingDetails.cinemaName || bookingDetails.cinema?.name,
            showTime: bookingDetails.showtimeTime || bookingDetails.showtime?.time,
            showDate: bookingDetails.showtimeDate || bookingDetails.showtime?.date,
            seatNumbers: bookingDetails.seatNames || bookingDetails.seats?.map((seat) => seat.name).join(', '),
            totalAmount: formatAmount(bookingDetails.totalAmount),
            transactionId: paymentData.transactionId,
            bookingCode: bookingDetails.code,
            bookingId: bookingDetails.id,
            moviePoster: bookingDetails.moviePoster || bookingDetails.movie?.poster,
            cinemaAddress: bookingDetails.cinemaAddress || bookingDetails.cinema?.address,
            screen: bookingDetails.screenName || bookingDetails.screen?.name,
          });
        } else {
          const fallbackData = readFallbackData();
          const errorMessage = searchParams.get('error');
          const reason = searchParams.get('reason');

          setErrorData({
            ...fallbackData,
            errorMessage: errorMessage ? decodeURIComponent(errorMessage) : fallbackData.errorMessage,
            reason: reason ? decodeURIComponent(reason) : fallbackData.reason,
            totalAmount: formatAmount(fallbackData.totalAmount),
          });
        }
      } catch (error) {
        console.error('Error fetching booking details:', error);
        const fallbackData = readFallbackData();
        setErrorData({ ...fallbackData, totalAmount: formatAmount(fallbackData.totalAmount) });
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [transactionId, location.state, searchParams]);

  const handleTryAgain = () => {
    navigate('/booking/payment', {
      state: {
        bookingId: errorData.bookingId,
        bookingCode: errorData.bookingCode,
        movieTitle: errorData.movieTitle,
        moviePoster: errorData.moviePoster,
        cinemaName: errorData.cinemaName,
        cinemaAddress: errorData.cinemaAddress,
        roomName: errorData.screen,
        selectedSeats: errorData.seatNumbers
          ? errorData.seatNumbers.split(', ').map((seat) => ({ name: seat, seatLabel: seat, price: 0 }))
          : [],
        showDate: errorData.showDate,
        showTime: errorData.showTime,
        totalAmount: errorData.totalAmount,
      },
    });
  };

  if (loading) {
    return <ContentLoader message="Đang tải thông tin..." />;
  }

  const {
    errorMessage = 'Giao dịch chưa được hoàn tất. Bạn có thể kiểm tra lại thông tin và thử thanh toán lần nữa.',
    movieTitle = '',
    cinemaName = '',
    showTime = '',
    showDate = '',
    seatNumbers = '',
    totalAmount = '0đ',
    reason = '',
    bookingCode = '',
  } = errorData;

  const details = [
    movieTitle && ['Phim', movieTitle],
    cinemaName && ['Rạp', cinemaName],
    showTime && ['Suất chiếu', `${showTime}${showDate ? ` · ${dayjs(showDate).format('DD/MM/YYYY')}` : ''}`],
    seatNumbers && ['Ghế', seatNumbers],
    bookingCode && ['Mã đặt vé', bookingCode],
  ].filter(Boolean);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-16 text-foreground">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Thanh toán không thành công</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
            Đơn đặt vé chưa được thanh toán. Thông tin bên dưới được giữ lại để bạn có thể kiểm tra và thử lại.
          </p>
        </div>

        <Alert type="error" showIcon message="Giao dịch chưa hoàn tất" description={errorMessage} />
        {reason && reason !== 'Thanh toán không thành công.' && (
          <Alert type="warning" showIcon message="Lý do" description={reason} />
        )}

        <Card className="shadow-sm">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 pt-6">
            {details.map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-6 text-sm">
                <span className="shrink-0 text-muted-foreground">{label}</span>
                <span className={label === 'Mã đặt vé' ? 'text-right font-mono font-medium' : 'text-right font-medium'}>
                  {value}
                </span>
              </div>
            ))}

            <Separator />

            <div className="flex items-center justify-between gap-6">
              <span className="font-semibold">Tổng cộng</span>
              <span className="text-xl font-semibold text-primary">{totalAmount}</span>
            </div>
          </CardContent>

          <CardFooter className="flex-col items-stretch gap-3 border-t border-border pt-6 sm:flex-row">
            <Button type="button" className="flex-1" onClick={handleTryAgain}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Thử lại thanh toán
            </Button>
            <Button type="button" variant="outline" className="flex-1" onClick={() => navigate('/')}>
              <Home className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          </CardFooter>
        </Card>

        <Alert
          type="info"
          showIcon
          description="Ghế chỉ được giữ trong thời gian giới hạn. Nếu thời gian giữ chỗ hết hạn, bạn cần chọn lại ghế trước khi thanh toán."
        />
      </div>
    </div>
  );
};

export default BookingFailed;
