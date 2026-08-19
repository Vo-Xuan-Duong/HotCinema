import { useEffect, useMemo, useState } from 'react';
import { CreditCard, Loader2, ShieldCheck, Ticket } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup } from '@/components/ui/radio-group';
import { MOCK_API_ENABLED } from '@/mocks/mockConfig';
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

const BookingProgress = () => (
  <div className="grid grid-cols-3 border border-border/80 bg-muted/20 text-xs sm:text-sm" aria-label="Tiến trình đặt vé">
    {[
      ['01', 'Chọn suất', false],
      ['02', 'Chọn ghế', false],
      ['03', 'Thanh toán', true],
    ].map(([number, label, active], index) => (
      <div key={number} className={`relative flex items-center gap-2 px-3 py-3 sm:px-4 ${index > 0 ? 'border-l border-border/70' : ''}`}>
        <span className={`font-semibold ${active ? 'text-primary' : 'text-muted-foreground'}`}>{number}</span>
        <span className={active ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}>{label}</span>
        {active && <span className="absolute inset-x-0 bottom-0 h-0.5 bg-primary" />}
      </div>
    ))}
  </div>
);

const paymentMethodDescription = (method) => {
  if (method === 'MOMO') return 'Thanh toán nhanh bằng ví MoMo';
  if (method === 'ZALOPAY') return 'Thanh toán bằng ví ZaloPay';
  if (method === 'VNPAY') return 'Ngân hàng, thẻ hoặc mã QR';
  return 'Thanh toán điện tử';
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
        notification.error('Phương thức thanh toán này hiện chưa sẵn sàng.');
        return;
      }
      if (error?.status === 409) notification.error('Đơn đặt vé đã có giao dịch thanh toán hoặc không thể thanh toán lại.');
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
    if (!MOCK_API_ENABLED || !bookingData?.bookingId) return;
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
    <main className="min-h-screen bg-background px-4 pb-10 pt-20 text-foreground">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="border-b border-border/70 pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-primary">
                <Ticket className="h-3.5 w-3.5" />
                Đặt vé HotCinema
              </div>
              <h1 className="mt-2 text-3xl font-semibold tracking-[-0.025em] sm:text-4xl">Thanh toán</h1>
              <p className="mt-1 text-sm text-muted-foreground">Mã đặt vé: <strong className="font-semibold text-foreground">{bookingData.bookingCode || bookingData.bookingId}</strong></p>
            </div>
            <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-[hsl(var(--success))]" />
              Số tiền được xác nhận trước khi hoàn tất giao dịch
            </div>
          </div>
        </header>

        <BookingProgress />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Card>
            <CardHeader className="border-b border-border/70">
              <CardTitle>Chọn phương thức thanh toán</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-[18px]">
              {enabledMethods.length > 0 ? (
                <RadioGroup value={paymentMethod} onChange={setPaymentMethod} className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {enabledMethods.map((method) => (
                    <RadioGroup.Button key={method} value={method.toLowerCase()} className="h-auto min-h-28 w-full items-start px-4 py-4 text-left">
                      <div className="flex min-h-full flex-col text-left">
                        <span className="mb-3 flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <CreditCard className="h-4 w-4" />
                        </span>
                        <p className="font-semibold">{paymentService.getPaymentMethodName(method)}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{paymentMethodDescription(method)}</p>
                      </div>
                    </RadioGroup.Button>
                  ))}
                </RadioGroup>
              ) : (
                <div className="border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">Chưa có phương thức thanh toán khả dụng.</div>
              )}

              {!bookingData.serverPriced && (
                <div className="border-l-2 border-primary bg-primary/5 px-3 py-2.5 text-sm leading-6 text-muted-foreground">
                  Tổng tiền hiện tại là ước tính. Số tiền cuối cùng sẽ được xác nhận khi giao dịch bắt đầu.
                </div>
              )}

              <div className="border-t border-border/70 pt-4">
                <p className="text-xs leading-5 text-muted-foreground">
                  Sau khi tiếp tục, bạn có thể được chuyển sang trang thanh toán của nhà cung cấp đã chọn.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="h-fit lg:sticky lg:top-20">
            <CardHeader className="border-b border-border/70">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">Tóm tắt đơn hàng</CardTitle>
                <span className="text-xs text-muted-foreground">{selectedSeats.length} ghế</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-[18px]">
              <div className="space-y-3 text-sm">
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Phim</p><p className="mt-1 font-semibold">{bookingData.movieTitle || 'Chưa có thông tin'}</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Rạp & suất chiếu</p><p className="mt-1 font-medium">{bookingData.cinemaName || 'Chưa có thông tin'}</p><p className="mt-0.5 text-xs leading-5 text-muted-foreground">{bookingData.showTime || '—'}{bookingData.showDate ? ` · ${dayjs(bookingData.showDate).format('DD/MM/YYYY')}` : ''}{bookingData.roomName ? ` · ${bookingData.roomName}` : ''}</p></div>
                <div><p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Ghế</p><p className="mt-1 font-medium">{selectedSeats.map((seat) => seat.seatLabel || seat.name).filter(Boolean).join(', ') || 'Chưa có thông tin'}</p></div>
              </div>

              <div className="space-y-2 border-t border-border/70 pt-3 text-sm">
                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tạm tính</span><span>{seatSubtotal.toLocaleString('vi-VN')} ₫</span></div>
                {discountAmount > 0 && <div className="flex justify-between gap-4"><span className="text-muted-foreground">Giảm giá</span><span className="text-[hsl(var(--success))]">-{discountAmount.toLocaleString('vi-VN')} ₫</span></div>}
              </div>

              <div className="flex items-end justify-between gap-4 border-t border-border/70 pt-3">
                <span className="font-semibold">Tổng cộng</span>
                <span className="text-2xl font-semibold tracking-[-0.025em] text-primary">{bookingTotal.toLocaleString('vi-VN')} ₫</span>
              </div>

              <div className={MOCK_API_ENABLED ? 'grid grid-cols-2 gap-2 pt-1' : 'pt-1'}>
                {MOCK_API_ENABLED && (
                  <Button variant="outline" onClick={handleCancelBooking} disabled={isProcessing || isCancelling}>
                    {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}{isCancelling ? 'Đang hủy...' : 'Hủy đặt vé'}
                  </Button>
                )}
                <Button className="w-full" size="lg" onClick={handlePayment} disabled={isCancelling || isProcessing || !paymentMethod}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
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