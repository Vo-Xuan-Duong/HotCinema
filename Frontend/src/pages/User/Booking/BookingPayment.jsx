import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import bookingService from '@/services/bookingService';
import paymentService from '@/services/paymentService';
import useNotification from '@/hooks/useNotification';
import { STORAGE_KEYS } from '@/utils/constants';

const CHECKOUT_STORAGE_KEY = 'hotcinema_checkout_context';

const readCheckoutContext = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(CHECKOUT_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

const BookingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  const [bookingData, setBookingData] = useState(() => location.state || readCheckoutContext());
  const enabledMethods = useMemo(() => (
    (import.meta.env.VITE_PAYMENT_METHODS || 'MOMO,VNPAY,ZALOPAY')
      .split(',')
      .map((method) => method.trim().toUpperCase())
      .filter(Boolean)
  ), []);
  const [paymentMethod, setPaymentMethod] = useState(enabledMethods[0]?.toLowerCase() || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (location.state) {
      setBookingData(location.state);
      window.sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(location.state));
    }
  }, [location.state]);

  useEffect(() => {
    if (!bookingData?.bookingId) {
      notification.error('Không tìm thấy thông tin đơn đặt vé để thanh toán.');
      navigate('/history', { replace: true });
    }
  }, [bookingData?.bookingId, navigate, notification]);

  const selectedSeats = useMemo(
    () => Array.isArray(bookingData?.selectedSeats) ? bookingData.selectedSeats : [],
    [bookingData?.selectedSeats],
  );
  const seatSubtotal = useMemo(
    () => Number(bookingData?.subtotal) || selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0),
    [bookingData?.subtotal, selectedSeats],
  );
  const bookingTotal = useMemo(() => {
    const total = Number(bookingData?.totalAmount);
    return Number.isFinite(total) && total >= 0 ? total : seatSubtotal;
  }, [bookingData?.totalAmount, seatSubtotal]);
  const discountAmount = Math.max(0, Number(bookingData?.discountAmount) || seatSubtotal - bookingTotal);

  const buildBookingSnapshot = (paymentData = {}) => ({
    bookingCode: paymentData.bookingCode || bookingData?.bookingCode,
    bookingId: bookingData?.bookingId,
    paymentId: paymentData.paymentId ?? paymentData.id,
    transactionId: paymentData.transactionId || paymentData.providerTransactionId,
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
    totalAmount: Number(paymentData.amount ?? bookingTotal),
    discountAmount,
    paymentMethod: paymentService.getPaymentMethodName(paymentMethod),
    paymentDate: paymentData.paymentDate || paymentData.paidAt,
  });

  const clearCheckoutContext = () => window.sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);

  const handlePayment = async () => {
    if (!paymentMethod) return notification.warning('Vui lòng chọn phương thức thanh toán.');
    if (!bookingData?.bookingId) return notification.error('Đơn đặt vé không hợp lệ.');

    try {
      setIsProcessing(true);
      const paymentData = await paymentService.createPayment({
        bookingId: bookingData.bookingId,
        paymentMethod: paymentMethod.toUpperCase(),
      });
      const snapshot = buildBookingSnapshot(paymentData);

      if (paymentData?.paymentUrl) {
        localStorage.setItem(STORAGE_KEYS.PENDING_PAYMENT, JSON.stringify(snapshot));
        notification.info('Đang chuyển đến cổng thanh toán...', 2500, true);
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      if (String(paymentData?.paymentStatus || paymentData?.status || '').toUpperCase() === 'SUCCESS') {
        localStorage.setItem(STORAGE_KEYS.LAST_BOOKING, JSON.stringify(snapshot));
        localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT);
        clearCheckoutContext();
        notification.success('Thanh toán thành công!');
        navigate('/booking/success', { replace: true, state: { bookingData: snapshot } });
        return;
      }

      notification.warning('Giao dịch đã được tạo nhưng chưa hoàn tất. Bạn có thể kiểm tra trạng thái trong lịch sử đặt vé.');
      navigate('/history', { replace: true });
    } catch (error) {
      if (error?.code === 'BACKEND_CAPABILITY_MISSING') {
        notification.error(error.message);
        return;
      }
      if (error?.status === 409) notification.error('Booking đã có giao dịch thanh toán hoặc trạng thái không cho phép thanh toán lại.');
      else if (error?.status === 404) notification.error('Không tìm thấy đơn đặt vé.');
      else notification.error(error?.message || 'Thanh toán thất bại. Vui lòng thử lại.');

      navigate('/booking/failed', {
        state: {
          errorData: {
            errorMessage: error?.message || 'Có lỗi xảy ra trong quá trình thanh toán.',
            movieTitle: bookingData?.movieTitle,
            reason: error?.response?.data?.reason || 'Thanh toán không thành công.',
            transactionId: error?.response?.data?.transactionId || '',
          },
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingData?.bookingId) return navigate('/history');
    try {
      setIsCancelling(true);
      await bookingService.updateBookingStatus(bookingData.bookingId, 'CANCELLED');
      clearCheckoutContext();
      notification.success('Đã hủy đơn đặt vé.');
      navigate('/history', { replace: true });
    } catch (error) {
      notification.error(error?.message || 'Không thể hủy đơn đặt vé.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!bookingData?.bookingId) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-8 pt-20">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Thanh toán</h1>
            <p className="mt-1 text-sm text-muted-foreground">Booking #{bookingData.bookingCode || bookingData.bookingId}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><ShieldCheck className="h-4 w-4" />Thông tin thanh toán được xác nhận ở máy chủ</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-lg">Phương thức thanh toán</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {enabledMethods.map((method) => (
                  <RadioGroup.Button key={method} value={method.toLowerCase()} className="h-auto w-full px-4 py-4">
                    <div className="text-left">
                      <p className="font-semibold">{paymentService.getPaymentMethodName(method)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{method === 'MOMO' || method === 'ZALOPAY' ? 'Ví điện tử' : method === 'VNPAY' ? 'Ngân hàng / QR' : 'Thanh toán điện tử'}</p>
                    </div>
                  </RadioGroup.Button>
                ))}
              </RadioGroup>
              {!bookingData.serverPriced && (
                <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
                  Giá đang hiển thị là ước tính từ bước chọn ghế. Máy chủ/payment provider phải xác nhận số tiền cuối cùng trước khi giao dịch hoàn tất.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader className="pb-3"><CardTitle className="text-lg">Tóm tắt đơn hàng</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phim</span><span className="text-right font-medium">{bookingData.movieTitle || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rạp</span><span className="text-right font-medium">{bookingData.cinemaName || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Suất chiếu</span><span className="text-right font-medium">{bookingData.showTime || '—'}{bookingData.showDate ? ` · ${dayjs(bookingData.showDate).format('DD/MM/YYYY')}` : ''}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ghế</span><span className="text-right font-medium">{selectedSeats.map((seat) => seat.seatLabel || seat.name).filter(Boolean).join(', ') || 'N/A'}</span></div>
              </div>

              <div className="space-y-1.5 border-t pt-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Tạm tính</span><span>{seatSubtotal.toLocaleString('vi-VN')} ₫</span></div>
                {discountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span>-{discountAmount.toLocaleString('vi-VN')} ₫</span></div>}
              </div>

              <div className="flex items-center justify-between border-t pt-3"><span className="font-semibold">Tổng cộng</span><span className="text-xl font-bold text-primary">{bookingTotal.toLocaleString('vi-VN')} ₫</span></div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button variant="outline" onClick={handleCancelBooking} disabled={isProcessing || isCancelling}>
                  {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}{isCancelling ? 'Đang hủy...' : 'Hủy booking'}
                </Button>
                <Button onClick={handlePayment} disabled={isCancelling || isProcessing || !paymentMethod}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
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
