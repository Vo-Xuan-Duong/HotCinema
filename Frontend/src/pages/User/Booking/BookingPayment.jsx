import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import paymentService from '@/services/paymentService';
import useNotification from '@/hooks/useNotification';

const LIVE_PAYMENT_METHODS = ['MOMO'];

const BookingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  const bookingData = location.state;

  const configuredMethods = (import.meta.env.VITE_PAYMENT_METHODS || 'MOMO')
    .split(',')
    .map((method) => method.trim().toUpperCase())
    .filter(Boolean);
  const enabledMethods = configuredMethods.filter((method) => LIVE_PAYMENT_METHODS.includes(method));
  const methods = enabledMethods.length > 0 ? enabledMethods : ['MOMO'];

  const [paymentMethod, setPaymentMethod] = useState(methods[0]?.toLowerCase() || 'momo');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!bookingData) {
      notification.error('Không tìm thấy thông tin đặt vé');
      navigate('/');
    }
  }, [bookingData, navigate, notification]);

  const selectedSeats = useMemo(
    () => Array.isArray(bookingData?.selectedSeats) ? bookingData.selectedSeats : [],
    [bookingData?.selectedSeats]
  );
  const seatSubtotal = useMemo(
    () => selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0),
    [selectedSeats]
  );
  const bookingTotal = useMemo(() => {
    const totalFromBooking = Number(bookingData?.totalAmount);
    return Number.isFinite(totalFromBooking) && totalFromBooking >= 0 ? totalFromBooking : seatSubtotal;
  }, [bookingData?.totalAmount, seatSubtotal]);
  const discountAmount = Math.max(seatSubtotal - bookingTotal, 0);

  const buildBookingSnapshot = (paymentData = {}) => ({
    bookingCode: bookingData?.bookingCode,
    bookingId: bookingData?.bookingId,
    paymentId: paymentData.id,
    providerOrderId: paymentData.providerOrderId,
    providerTransactionId: paymentData.providerTransactionId,
    paymentStatus: paymentData.status,
    movieTitle: bookingData?.movieTitle,
    moviePoster: bookingData?.moviePoster,
    cinemaName: bookingData?.cinemaName,
    cinemaAddress: bookingData?.cinemaAddress || '',
    roomName: bookingData?.roomName || 'N/A',
    seatNumbers: selectedSeats.map((seat) => seat.seatLabel || seat.name).filter(Boolean).join(', '),
    selectedSeats,
    showDate: bookingData?.showDate,
    showTime: bookingData?.showTime,
    formatType: bookingData?.formatType,
    totalAmount: bookingTotal,
    discountAmount,
    paymentMethod: paymentService.getPaymentMethodName(paymentMethod),
  });

  const handlePayment = async () => {
    const provider = String(paymentMethod || '').toUpperCase();
    if (!LIVE_PAYMENT_METHODS.includes(provider)) {
      notification.warning('Phương thức thanh toán này chưa được bật cho giao dịch thật');
      return;
    }
    if (!bookingData?.bookingId) {
      notification.error('Không tìm thấy thông tin đơn đặt vé');
      navigate('/');
      return;
    }

    try {
      setIsProcessing(true);
      const paymentData = await paymentService.initiatePayment(bookingData.bookingId, provider);
      const pendingSnapshot = buildBookingSnapshot(paymentData);

      if (paymentData?.paymentUrl) {
        localStorage.setItem('pendingPayment', JSON.stringify(pendingSnapshot));
        notification.info('Đang chuyển đến cổng thanh toán...', 2500, true);
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      if (String(paymentData?.status || '').toUpperCase() === 'SUCCESS') {
        localStorage.setItem('lastBooking', JSON.stringify(pendingSnapshot));
        notification.success('Thanh toán thành công!');
        navigate(`/booking/success?bookingCode=${encodeURIComponent(bookingData.bookingCode || '')}`, {
          state: { bookingData: pendingSnapshot },
        });
        return;
      }

      notification.error('Cổng thanh toán chưa trả về liên kết thanh toán. Vui lòng thử lại.');
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.status === 404) {
        notification.error('Không tìm thấy đơn đặt vé');
        navigate('/');
      } else if (error.response?.status === 400) {
        notification.error(error.response?.data?.message || 'Thanh toán không hợp lệ');
      } else if (error.response?.status === 409) {
        notification.error('Giao dịch đang được xử lý hoặc booking đã thanh toán');
      } else {
        notification.error('Không thể khởi tạo thanh toán. Vui lòng thử lại.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLeavePayment = () => {
    notification.info('Booking chưa thanh toán sẽ tự hết hạn và trả ghế khi thời gian giữ chỗ kết thúc.');
    navigate('/history');
  };

  if (!bookingData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-8 pt-20">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thanh toán an toàn</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hoàn tất thanh toán cho booking #{bookingData.bookingCode || bookingData.bookingId}.
            </p>
          </div>
          <span className="text-sm text-muted-foreground">{selectedSeats.length} ghế đã chọn</span>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Chọn phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {methods.includes('MOMO') && (
                  <RadioGroup.Button value="momo" className="h-auto w-full px-3 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png"
                        alt="MoMo"
                        className="h-10 w-10 object-contain"
                      />
                      <div className="min-w-0 text-left">
                        <p className="font-semibold">MoMo</p>
                        <p className="truncate text-xs text-muted-foreground">Ví điện tử MoMo</p>
                      </div>
                    </div>
                  </RadioGroup.Button>
                )}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phim</span><span className="text-right font-medium">{bookingData.movieTitle || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rạp</span><span className="text-right font-medium">{bookingData.cinemaName || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Suất chiếu</span><span className="text-right font-medium">{bookingData.showTime || '—'}{bookingData.showDate ? ` · ${dayjs(bookingData.showDate).format('DD/MM/YYYY')}` : ''}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ghế</span><span className="text-right font-medium">{selectedSeats.map((seat) => seat.seatLabel || seat.name).filter(Boolean).join(', ') || 'N/A'}</span></div>
              </div>

              <div className="space-y-1.5 border-t pt-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Giá ghế ({selectedSeats.length})</span><span>{seatSubtotal.toLocaleString('vi-VN')} ₫</span></div>
                {discountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span className="text-destructive">-{discountAmount.toLocaleString('vi-VN')} ₫</span></div>}
              </div>

              <div className="flex items-center justify-between border-t pt-3">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{bookingTotal.toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={handleLeavePayment} disabled={isProcessing}>Thoát thanh toán</Button>
                <Button onClick={handlePayment} disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default BookingPayment;
