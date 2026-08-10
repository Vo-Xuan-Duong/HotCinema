import { useEffect, useState } from 'react';
import { CheckCircle2, Clock3, Loader2, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import paymentService from '@/services/paymentService';

const PaymentCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Đang xác nhận giao dịch với hệ thống...');

  useEffect(() => {
    let active = true;

    const verifyPayment = async () => {
      try {
        const rawPending = localStorage.getItem('pendingPayment');
        const pending = rawPending ? JSON.parse(rawPending) : null;
        if (!pending?.bookingId) throw new Error('Không tìm thấy giao dịch đang chờ xác nhận.');

        const payments = await paymentService.getPaymentsByBookingId(pending.bookingId);
        const payment = payments.find((item) => (
          item.id === pending.paymentId || item.transactionId === pending.transactionId
        )) || payments[0];

        if (!payment) throw new Error('Hệ thống chưa ghi nhận giao dịch.');

        const paymentStatus = String(payment.paymentStatus || '').toUpperCase();
        if (paymentStatus === 'SUCCESS') {
          const completedBooking = {
            ...pending,
            bookingCode: payment.bookingCode || pending.bookingCode,
            paymentId: payment.id,
            transactionId: payment.transactionId,
            paymentStatus,
          };
          localStorage.setItem('lastBooking', JSON.stringify(completedBooking));
          localStorage.removeItem('pendingPayment');
          if (!active) return;
          setStatus('success');
          setMessage('Thanh toán đã được xác nhận.');
          navigate(`/booking/success?bookingCode=${encodeURIComponent(completedBooking.bookingCode || '')}`, {
            replace: true,
            state: { bookingData: completedBooking },
          });
          return;
        }

        if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
          if (!active) return;
          setStatus('failed');
          setMessage('Giao dịch không thành công hoặc đã bị hủy.');
          return;
        }

        if (!active) return;
        setStatus('pending');
        setMessage('Giao dịch đang được cổng thanh toán xử lý. Vui lòng kiểm tra lại sau.');
      } catch (error) {
        if (!active) return;
        setStatus('failed');
        setMessage(error?.message || 'Không thể xác nhận trạng thái thanh toán.');
      }
    };

    verifyPayment();
    return () => { active = false; };
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
