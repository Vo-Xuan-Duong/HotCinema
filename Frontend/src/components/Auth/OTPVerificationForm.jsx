import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, CheckCircle2, Mail, RotateCcw } from 'lucide-react';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Countdown } from '@/components/ui/countdown';
import { Form, FormControl, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import useNotification from '@/hooks/useNotification';

const OTP_LENGTH = 6;

const OTPVerificationForm = ({ email, onSuccess, onBack }) => {
  const notification = useNotification();
  const inputRefs = useRef([]);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdownEnd, setCountdownEnd] = useState(Date.now() + 60 * 1000);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const resetOtp = () => {
    setOtp(Array(OTP_LENGTH).fill(''));
    window.requestAnimationFrame(() => inputRefs.current[0]?.focus());
  };

  const handleOTPChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);

    setOtp((previous) => {
      const next = [...previous];
      next[index] = digit;
      return next;
    });

    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;

    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((digit, index) => {
      next[index] = digit;
    });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== OTP_LENGTH) {
      notification.error('Vui lòng nhập đủ 6 số OTP!');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.verifyOTP(email, otpCode);
      if (result === false) {
        notification.error('Mã OTP không chính xác hoặc đã hết hạn!');
        return;
      }

      notification.success('Xác thực tài khoản thành công!');
      onSuccess?.();
    } catch (error) {
      console.error('OTP verification error:', error);
      notification.error(error.response?.data?.message || error.message || 'Mã OTP không chính xác hoặc đã hết hạn!');
      resetOtp();
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    try {
      await authService.resendOTP(email);
      notification.success('Đã gửi lại mã OTP đến email của bạn!');
      setCanResend(false);
      setCountdownEnd(Date.now() + 60 * 1000);
      resetOtp();
    } catch (error) {
      console.error('Resend OTP error:', error);
      notification.error(error.response?.data?.message || error.message || 'Không thể gửi lại mã OTP. Vui lòng thử lại!');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight">Xác thực tài khoản</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Nhập mã OTP đã gửi đến <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <Form onSubmit={handleSubmit}>
        <FormItem>
          <FormControl>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(element) => { inputRefs.current[index] = element; }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  disabled={loading}
                  onChange={(event) => handleOTPChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`Chữ số OTP ${index + 1}`}
                  className="h-12 w-11 px-0 text-center text-lg font-semibold tabular-nums sm:w-12"
                />
              ))}
            </div>
          </FormControl>
        </FormItem>

        <FormItem>
          <Button type="submit" disabled={loading || otp.join('').length !== OTP_LENGTH} className="h-11 w-full">
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </Button>
        </FormItem>
      </Form>

      <div className="text-center text-sm text-muted-foreground">
        {!canResend ? (
          <span>
            Gửi lại mã sau{' '}
            <Countdown
              value={countdownEnd}
              format="ss"
              onFinish={() => setCanResend(true)}
              className="font-semibold tabular-nums text-primary"
            />{' '}
            giây
          </span>
        ) : (
          <Button type="button" variant="link" className="h-auto p-0 text-sm" onClick={handleResendOTP} disabled={resendLoading}>
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            {resendLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
          </Button>
        )}
      </div>

      <Separator />

      <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Quay lại đăng ký
      </Button>
    </div>
  );
};

export default OTPVerificationForm;
