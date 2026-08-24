import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import paymentService from '@/services/paymentService';

const delay = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, milliseconds));

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xác nhận giao dịch với hệ thống...');

  useEffect(() => {
    let active = true;

    const readPayment = async (pending) => {
      if (pending.paymentId) {
        return paymentService.getPaymentById(pending.paymentId);
      }
      const payments = await paymentService.getPaymentsByBookingId(pending.bookingId);
      return payments.find((item) => (
        item.providerOrderId === pending.providerOrderId
        || item.providerTransactionId === pending.providerTransactionId
      )) || payments[0];
    };

    const verifyPayment = async () => {
      try {
        const rawPending = localStorage.getItem('pendingPayment');
        const pending = rawPending ? JSON.parse(rawPending) : null;
        if (!pending?.bookingId) throw new Error('Không tìm thấy giao dịch đang chờ xác nhận.');

        let payment = null;
        for (let attempt = 0; attempt < 8 && active; attempt += 1) {
          payment = await readPayment(pending);
          if (!payment) {
            if (attempt < 7) await delay(1500);
            continue;
          }

          const paymentStatus = String(payment.status || '').toUpperCase();
          if (['SUCCESS', 'FAILED', 'CANCELLED'].includes(paymentStatus)) break;
          if (attempt < 7) await delay(1500);
        }

        if (!active) return;
        if (!payment) throw new Error('Hệ thống chưa ghi nhận giao dịch.');

        const paymentStatus = String(payment.status || '').toUpperCase();
        if (paymentStatus === 'SUCCESS') {
          const completedBooking = {
            ...pending,
            paymentId: payment.id,
            providerOrderId: payment.providerOrderId,
            providerTransactionId: payment.providerTransactionId,
            paymentStatus,
          };
          localStorage.setItem('lastBooking', JSON.stringify(completedBooking));
          localStorage.removeItem('pendingPayment');
          setStatus('success');
          setMessage('Thanh toán đã được backend xác nhận từ cổng thanh toán.');
          navigate(`/booking/success?bookingCode=${encodeURIComponent(completedBooking.bookingCode || '')}`, {
            replace: true,
            state: { bookingData: completedBooking },
          });
          return;
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          localStorage.removeItem('pendingPayment');
          setStatus('failed');
          setMessage('Giao dịch không thành công hoặc đã bị hủy.');
          return;
        }

        setStatus('pending');
        setMessage('Cổng thanh toán chưa gửi xác nhận cuối cùng. Bạn có thể kiểm tra lại trạng thái sau.');
      } catch (error) {
        if (!active) return;
        setStatus('failed');
        setMessage(error?.message || 'Không thể xác nhận trạng thái thanh toán.');
      }
    };

    verifyPayment();
    return () => {
      active = false;
    };
  }, [navigate]);

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
            <StatusIcon
              className={`h-12 w-12 ${status === 'processing' ? 'animate-spin text-primary' : status === 'success' ? 'text-[hsl(var(--success))]' : status === 'pending' ? 'text-[hsl(var(--warning))]' : 'text-destructive'}`}
            />
          </div>
          <CardTitle>{status === 'processing' ? 'Đang xác nhận thanh toán' : 'Trạng thái thanh toán'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <Alert
            variant={status === 'failed' ? 'destructive' : status === 'success' ? 'success' : 'warning'}
            description={message}
          />
          {status !== 'processing' && status !== 'success' && (
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button onClick={() => window.location.reload()}>Kiểm tra lại</Button>
              <Button variant="outline" onClick={() => navigate('/history')}>Xem lịch sử đặt vé</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default PaymentCallback;
