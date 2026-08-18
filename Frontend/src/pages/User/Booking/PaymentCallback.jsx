import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import paymentService from '@/services/paymentService';
import { STORAGE_KEYS } from '@/utils/constants';
import { sameResourceId } from '@/utils/resourceId';

const MAX_AUTO_CHECKS = 10;
const POLL_INTERVAL_MS = 3000;

const readPendingPayment = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_PAYMENT) || 'null');
  } catch {
    return null;
  }
};

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xác nhận giao dịch với hệ thống...');
  const [checking, setChecking] = useState(false);
  const attemptRef = useRef(0);
  const activeRef = useRef(true);

  const context = useMemo(() => {
    const pending = readPendingPayment() || {};
    return {
      ...pending,
      bookingId: searchParams.get('bookingId') || pending.bookingId,
      bookingCode: searchParams.get('bookingCode') || pending.bookingCode,
      paymentId: searchParams.get('paymentId') || pending.paymentId,
      transactionId: searchParams.get('transactionId') || searchParams.get('transId') || pending.transactionId,
    };
  }, [searchParams]);

  const verifyPayment = useCallback(async ({ manual = false } = {}) => {
    if (!context.bookingId) {
      setStatus('failed');
      setMessage('Không tìm thấy mã booking để xác nhận giao dịch.');
      return 'failed';
    }

    setChecking(true);
    try {
      const payments = await paymentService.getPaymentsByBookingId(context.bookingId);
      const payment = payments.find((item) => (
        (context.paymentId && sameResourceId(item.id, context.paymentId))
        || (context.transactionId && String(item.transactionId || item.providerTransactionId || '') === String(context.transactionId))
      )) || payments[0];

      if (!payment) {
        setStatus('pending');
        setMessage('Hệ thống chưa ghi nhận giao dịch. Vui lòng chờ thêm một chút.');
        return 'pending';
      }

      const paymentStatus = String(payment.paymentStatus || payment.status || '').toUpperCase();
      if (paymentStatus === 'SUCCESS') {
        const completedBooking = {
          ...context,
          bookingCode: payment.bookingCode || context.bookingCode,
          paymentId: payment.id,
          transactionId: payment.transactionId || payment.providerTransactionId,
          paymentStatus,
          paymentDate: payment.paymentDate || payment.paidAt,
          totalAmount: Number(payment.amount ?? context.totalAmount ?? 0),
        };
        localStorage.setItem(STORAGE_KEYS.LAST_BOOKING, JSON.stringify(completedBooking));
        localStorage.removeItem(STORAGE_KEYS.PENDING_PAYMENT);
        setStatus('success');
        setMessage('Thanh toán đã được xác nhận.');
        navigate(`/booking/success?bookingCode=${encodeURIComponent(completedBooking.bookingCode || '')}`, {
          replace: true,
          state: { bookingData: completedBooking },
        });
        return 'success';
      }

      if (['FAILED', 'CANCELLED'].includes(paymentStatus)) {
        setStatus('failed');
        setMessage(payment.failureMessage || 'Giao dịch không thành công hoặc đã bị hủy.');
        return 'failed';
      }

      setStatus('pending');
      setMessage(manual
        ? 'Giao dịch vẫn đang chờ cổng thanh toán xác nhận.'
        : 'Giao dịch đang được xử lý. Hệ thống sẽ tự kiểm tra lại.');
      return 'pending';
    } catch (error) {
      setStatus('failed');
      setMessage(error?.message || 'Không thể xác nhận trạng thái thanh toán.');
      return 'failed';
    } finally {
      setChecking(false);
    }
  }, [context, navigate]);

  useEffect(() => {
    activeRef.current = true;
    let timer;

    const poll = async () => {
      if (!activeRef.current) return;
      attemptRef.current += 1;
      const result = await verifyPayment();
      if (!activeRef.current || result !== 'pending') return;

      if (attemptRef.current >= MAX_AUTO_CHECKS) {
        setMessage('Giao dịch vẫn đang chờ xác nhận. Bạn có thể kiểm tra lại thủ công hoặc xem lịch sử đặt vé.');
        return;
      }
      timer = window.setTimeout(poll, POLL_INTERVAL_MS);
    };

    poll();
    return () => {
      activeRef.current = false;
      if (timer) window.clearTimeout(timer);
    };
  }, [verifyPayment]);

  const StatusIcon = status === 'success'
    ? CheckCircle2
    : status === 'pending'
      ? Clock3
      : status === 'failed'
        ? XCircle
        : Loader2;

  return (
    <main className="container mx-auto flex min-h-[70vh] max-w-xl items-center px-4 py-10">
      <Card className="w-full text-center">
        <CardHeader>
          <div className="mx-auto mb-3">
            <StatusIcon className={`h-12 w-12 ${status === 'processing' || checking ? 'animate-pulse text-primary' : status === 'success' ? 'text-[hsl(var(--success))]' : status === 'pending' ? 'text-[hsl(var(--warning))]' : 'text-destructive'}`} />
          </div>
          <CardTitle>{status === 'processing' ? 'Đang xác nhận thanh toán' : 'Trạng thái thanh toán'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert
            variant={status === 'failed' ? 'destructive' : status === 'success' ? 'success' : 'warning'}
            description={message}
          />
          {context.bookingCode && <p className="text-sm text-muted-foreground">Booking: <strong>{context.bookingCode}</strong></p>}
          {status !== 'success' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => verifyPayment({ manual: true })} disabled={checking}>
                {checking && <Loader2 className="h-4 w-4 animate-spin" />}Kiểm tra lại
              </Button>
              <Button variant="outline" onClick={() => navigate('/history')}>Xem lịch sử đặt vé</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PaymentCallback;
