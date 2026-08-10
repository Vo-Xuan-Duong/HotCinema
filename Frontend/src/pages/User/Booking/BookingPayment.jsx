import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import bookingService from '@/services/bookingService';
import paymentService from '@/services/paymentService';
import useNotification from '@/hooks/useNotification';

const BookingPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const notification = useNotification();
  const bookingData = location.state;
  const enabledMethods = (import.meta.env.VITE_PAYMENT_METHODS || 'MOMO')
    .split(',')
    .map((method) => method.trim().toUpperCase())
    .filter(Boolean);
  const [paymentMethod, setPaymentMethod] = useState(enabledMethods[0]?.toLowerCase() || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

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
    bookingCode: paymentData.bookingCode || bookingData?.bookingCode,
    bookingId: bookingData?.bookingId,
    paymentId: paymentData.paymentId ?? paymentData.id,
    transactionId: paymentData.transactionId,
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
    paymentDate: paymentData.paymentDate,
  });

  const handlePayment = async () => {
    if (!paymentMethod) {
      notification.warning('Vui lòng chọn phương thức thanh toán');
      return;
    }
    if (!bookingData?.bookingId) {
      notification.error('Không tìm thấy thông tin đơn đặt vé');
      navigate('/');
      return;
    }

    try {
      setIsProcessing(true);
      const paymentData = await paymentService.createPayment({
        bookingId: bookingData.bookingId,
        paymentMethod: paymentMethod.toUpperCase(),
      });

      if (paymentData?.paymentUrl) {
        localStorage.setItem('pendingPayment', JSON.stringify(buildBookingSnapshot(paymentData)));
        notification.info('Đang chuyển đến trang thanh toán...', 2500, true);
        window.location.assign(paymentData.paymentUrl);
        return;
      }

      if (String(paymentData?.paymentStatus || '').toUpperCase() === 'SUCCESS') {
        const completed = buildBookingSnapshot(paymentData);
        localStorage.setItem('lastBooking', JSON.stringify(completed));
        notification.success('Thanh toán thành công!');
        navigate('/booking/success', { state: { bookingData: completed } });
        return;
      }

      notification.error('Cổng thanh toán chưa trả về liên kết thanh toán. Vui lòng chọn phương thức khác.');
    } catch (error) {
      console.error('Payment error:', error);
      if (error.response?.status === 404) {
        notification.error('Không tìm thấy đơn đặt vé');
        navigate('/');
      } else if (error.response?.status === 400) {
        notification.error(error.response?.data?.message || 'Thanh toán không hợp lệ');
      } else if (error.response?.status === 409) {
        notification.error('Booking đã được thanh toán rồi');
      } else {
        notification.error('Thanh toán thất bại. Vui lòng thử lại.');
      }
      navigate('/booking/failed', {
        state: {
          errorData: {
            errorMessage: error.response?.data?.message || 'Có lỗi xảy ra trong quá trình thanh toán.',
            movieTitle: bookingData?.movieTitle,
            reason: error.response?.data?.reason || 'Thanh toán không thành công.',
            transactionId: error.response?.data?.transactionId || '',
          },
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingData?.bookingId) {
      notification.warning('Không tìm thấy thông tin đơn đặt vé để hủy');
      navigate(-1);
      return;
    }

    try {
      setIsCancelling(true);
      await bookingService.updateBookingStatus(bookingData.bookingId, 'CANCELLED');
      notification.success('Đã hủy đơn đặt vé thành công');
      navigate(-1);
    } catch (error) {
      console.error('Error cancelling booking:', error);
      if (error.response?.status === 404) notification.warning('Đơn đặt vé không tồn tại');
      else notification.error('Không thể hủy đơn đặt vé. Vui lòng thử lại.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (!bookingData) {
    return <div className="flex min-h-screen items-center justify-center bg-background"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <main className="min-h-screen bg-background px-4 pb-12 pt-24">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="text-center"><h1 className="text-3xl font-bold tracking-tight">Thanh toán an toàn</h1><p className="mt-2 text-sm text-muted-foreground">Hoàn tất thanh toán cho booking #{bookingData.bookingCode || bookingData.bookingId}.</p></div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader><CardTitle className="text-xl">Chọn phương thức thanh toán</CardTitle></CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="w-full">
                {enabledMethods.includes('MOMO') && <RadioGroup.Button value="momo" className="h-auto w-full px-4 py-4"><div className="flex items-center gap-4"><img src="https://upload.wikimedia.org/wikipedia/vi/f/fe/MoMo_Logo.png" alt="MoMo" className="h-12 w-12 object-contain" /><div className="text-left"><p className="font-semibold">MoMo</p><p className="text-sm text-muted-foreground">Ví điện tử MoMo</p></div></div></RadioGroup.Button>}
                {enabledMethods.includes('VNPAY') && <RadioGroup.Button value="vnpay" className="h-auto w-full px-4 py-4"><div className="flex items-center gap-4"><img src="https://vnpay.vn/s1/statics.vnpay.vn/2023/9/06ncktiwd6dc1694418196384.png" alt="VNPay" className="h-12 w-12 object-contain" /><div className="text-left"><p className="font-semibold">VNPay</p><p className="text-sm text-muted-foreground">Thanh toán qua VNPay</p></div></div></RadioGroup.Button>}
                {enabledMethods.includes('ZALOPAY') && <RadioGroup.Button value="zalopay" className="h-auto w-full px-4 py-4"><div className="flex items-center gap-4"><img src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png" alt="ZaloPay" className="h-12 w-12 object-contain" /><div className="text-left"><p className="font-semibold">ZaloPay</p><p className="text-sm text-muted-foreground">Ví điện tử ZaloPay</p></div></div></RadioGroup.Button>}
              </RadioGroup>
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-24">
            <CardHeader><CardTitle className="text-xl">Tóm tắt đơn hàng</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Phim</span><span className="text-right font-medium">{bookingData.movieTitle || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Rạp</span><span className="text-right font-medium">{bookingData.cinemaName || 'N/A'}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Suất chiếu</span><span className="text-right font-medium">{bookingData.showTime || '—'}{bookingData.showDate ? ` · ${dayjs(bookingData.showDate).format('DD/MM/YYYY')}` : ''}</span></div>
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Ghế</span><span className="text-right font-medium">{selectedSeats.map((seat) => seat.seatLabel || seat.name).filter(Boolean).join(', ') || 'N/A'}</span></div>
              </div>

              <div className="space-y-2 border-t pt-4 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Giá ghế ({selectedSeats.length})</span><span>{seatSubtotal.toLocaleString('vi-VN')} ₫</span></div>
                {discountAmount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Giảm giá</span><span className="text-destructive">-{discountAmount.toLocaleString('vi-VN')} ₫</span></div>}
              </div>

              <div className="flex items-center justify-between border-t pt-4"><span className="text-lg font-semibold">Tổng cộng</span><span className="text-2xl font-bold text-primary">{bookingTotal.toLocaleString('vi-VN')} ₫</span></div>

              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleCancelBooking} disabled={isProcessing || isCancelling}>{isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}{isCancelling ? 'Đang hủy...' : 'Hủy booking'}</Button>
                <Button onClick={handlePayment} disabled={isCancelling || isProcessing}>{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}{isProcessing ? 'Đang xử lý...' : 'Thanh toán'}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default BookingPayment;
